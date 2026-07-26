"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avg_quiz_score: number;
  challenges_solved: number;
  leetcode_solved: number;
  current_streak: number;
  overall_score: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  your_rank: number | null;
  total_students: number;
}

function authHeaders() {
  const token = localStorage.getItem("student_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // domain shown in header, and used to know which row is "you"
    const storedUser = localStorage.getItem("student_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUserId(parsed.id || "");
      } catch {}
    }

    fetch(`${API_BASE}/student/dashboard`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((body) => setDomain(body?.user?.domain || ""))
      .catch(() => {});

    fetch(`${API_BASE}/student/leaderboard`, { headers: authHeaders() })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.detail || "Failed to load leaderboard");
        setData(body);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-6 py-4 max-w-md text-center">
          {error}
        </div>
      </div>
    );
  if (!data) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm">
              PF
            </span>
            Leaderboard
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h1>
          <p className="text-gray-500 mt-1">
            {domain ? `${domain} domain` : "Your domain"} — {data.total_students} student
            {data.total_students === 1 ? "" : "s"}
          </p>
        </div>

        {data.your_rank && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-indigo-700 font-semibold">
              Your rank: #{data.your_rank} of {data.total_students}
            </p>
          </div>
        )}

        {data.leaderboard.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
            No leaderboard data yet — take a quiz or solve a challenge to appear here.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-medium text-gray-400 border-b border-gray-100">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-center">Quiz Avg</div>
              <div className="col-span-2 text-center">Challenges</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            {data.leaderboard.map((entry) => {
              const isYou = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm border-b border-gray-50 last:border-0 ${
                    isYou ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="col-span-1 font-semibold text-gray-700">
                    {medals[entry.rank - 1] || entry.rank}
                  </div>
                  <div className="col-span-5 font-medium text-gray-900 flex items-center gap-2">
                    {entry.full_name}
                    {isYou && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">You</span>
                    )}
                    {entry.current_streak > 0 && (
                      <span className="text-xs text-orange-600">🔥{entry.current_streak}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-gray-600">{entry.avg_quiz_score}%</div>
                  <div className="col-span-2 text-center text-gray-600">{entry.challenges_solved}</div>
                  <div className="col-span-2 text-right font-semibold text-indigo-600">{entry.overall_score}</div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Score = (avg quiz score × 0.4) + (challenges solved × 5) + (streak × 2)
        </p>
      </main>
    </div>
  );
}