from fastapi import APIRouter, HTTPException, status, Depends

from app.database import supabase
from app.routes.student import require_student

router = APIRouter()


def _get_user(user_id: str) -> dict:
    resp = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return resp.data


# ─────────────────────────────────────────────────────────────────────────────
# LEADERBOARD — combined overall score (no LeetCode dependency)
# ─────────────────────────────────────────────────────────────────────────────
#
# Scoring formula (tune the weights below to whatever feels right for your platform):
#   overall_score = (avg_quiz_score * 0.4) + (challenges_solved * 5) + (current_streak * 2)
#
# NOTE: when you add LeetCode syncing later, add a leetcode_solved term back in here
# (matching what's in leetcode.py's leaderboard endpoint) and remove this file's
# router from main.py in favor of that one, or merge them.

QUIZ_WEIGHT = 0.4
CHALLENGE_WEIGHT = 5
STREAK_WEIGHT = 2


@router.get("/student/leaderboard")
async def get_leaderboard(student: dict = Depends(require_student)):
    user_id = student.get("sub")
    user = _get_user(user_id)
    domain = user.get("domain")

    domain_users_resp = supabase.table("users").select("id, full_name").eq("domain", domain).execute()
    domain_users = domain_users_resp.data or []
    user_ids = [u["id"] for u in domain_users]
    names_by_id = {u["id"]: u["full_name"] for u in domain_users}

    if not user_ids:
        return {"leaderboard": [], "your_rank": None, "total_students": 0}

    quiz_resp = supabase.table("quiz_results").select("user_id, score").in_("user_id", user_ids).execute()
    quiz_by_user: dict = {}
    for row in quiz_resp.data or []:
        quiz_by_user.setdefault(row["user_id"], []).append(row["score"])

    challenge_resp = supabase.table("challenge_submissions").select("user_id").in_("user_id", user_ids).execute()
    challenge_counts: dict = {}
    for row in challenge_resp.data or []:
        challenge_counts[row["user_id"]] = challenge_counts.get(row["user_id"], 0) + 1

    streak_resp = supabase.table("study_streaks").select("user_id, current_streak").in_("user_id", user_ids).execute()
    streak_by_user = {row["user_id"]: row["current_streak"] for row in (streak_resp.data or [])}

    entries = []
    for uid in user_ids:
        scores = quiz_by_user.get(uid, [])
        avg_quiz = sum(scores) / len(scores) if scores else 0
        challenges_solved = challenge_counts.get(uid, 0)
        streak = streak_by_user.get(uid, 0)

        overall_score = round(
            avg_quiz * QUIZ_WEIGHT + challenges_solved * CHALLENGE_WEIGHT + streak * STREAK_WEIGHT, 1,
        )
        entries.append({
            "user_id": uid,
            "full_name": names_by_id.get(uid, "Student"),
            "avg_quiz_score": round(avg_quiz, 1),
            "challenges_solved": challenges_solved,
            "leetcode_solved": 0,
            "current_streak": streak,
            "overall_score": overall_score,
        })

    entries.sort(key=lambda e: e["overall_score"], reverse=True)
    for i, e in enumerate(entries):
        e["rank"] = i + 1

    your_rank = next((e["rank"] for e in entries if e["user_id"] == user_id), None)

    return {"leaderboard": entries[:20], "your_rank": your_rank, "total_students": len(entries)}