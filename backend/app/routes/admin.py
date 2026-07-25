import os
import secrets
import string

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

from app.database import supabase
from app.models import SelectAdmissionRequest, RejectAdmissionRequest
from app.utils.auth import verify_token
from app.utils.email import send_selection_email, send_rejection_email

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─────────────────────────────────────────────────────────────────────────────
# Dependency: require admin JWT
# ─────────────────────────────────────────────────────────────────────────────

def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return payload


def generate_random_password(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    password = "".join(secrets.choice(alphabet) for _ in range(length))
    return password[:72]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/admin/admissions
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/admin/admissions")
async def get_all_admissions(admin: dict = Depends(require_admin)):
    """Return all admission records ordered by creation date (newest first)."""
    try:
        response = (
            supabase.table("admissions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return {"admissions": response.data or []}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admissions: {str(e)}",
        )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/admin/select
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/admin/select")
async def select_admission(body: SelectAdmissionRequest, admin: dict = Depends(require_admin)):
    """
    Mark an admission as selected, create a user account, and send credentials email.
    """
    if body.plan not in ("pro", "career_pro"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plan must be 'pro' or 'career_pro'.")

    try:
        # 1. Fetch the admission record
        admission_resp = (
            supabase.table("admissions")
            .select("*")
            .eq("id", body.admission_id)
            .single()
            .execute()
        )
        admission = admission_resp.data
        if not admission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admission not found.")

        # 2. Update admission status and selected_plan
        supabase.table("admissions").update(
            {"status": "selected", "selected_plan": body.plan}
        ).eq("id", body.admission_id).execute()

       # 3. Generate random password and hash it
        raw_password = generate_random_password(8)
        hashed_password = pwd_context.hash(raw_password)
        # 4. Create or update user record in users table
        user_record = {
            "full_name": admission.get("full_name"),
            "email": admission.get("email"),
            "password_hash": hashed_password,
            "whatsapp": admission.get("whatsapp"),
            "enrollment_no": admission.get("enrollment_no"),
            "branch": admission.get("branch"),
            "year": admission.get("year"),
            "address": admission.get("address"),
            "parent_mobile": admission.get("parent_mobile"),
            "domain": admission.get("domain"),
            "role": "student",
            "subscription_type": body.plan,
            "status": "active",
        }

        existing_user_resp = (
            supabase.table("users")
            .select("id")
            .eq("email", admission.get("email"))
            .execute()
        )
        existing_user = (existing_user_resp.data or [{}])[0] if existing_user_resp.data else None

        if existing_user:
            supabase.table("users").update(user_record).eq("id", existing_user["id"]).execute()
        else:
            supabase.table("users").insert(user_record).execute()

        # 5. Send selection email
        email_sent = send_selection_email(
            to_email=admission.get("email"),
            full_name=admission.get("full_name"),
            plan=body.plan,
            password=raw_password,
        )
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admission selected, but failed to send the credentials email.",
            )

        return {"message": f"Admission selected successfully. Credentials emailed to {admission.get('email')}."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process selection: {str(e)}",
        )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/admin/reject
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/admin/reject")
async def reject_admission(body: RejectAdmissionRequest, admin: dict = Depends(require_admin)):
    """Mark an admission as rejected and send a rejection email with a discount coupon."""
    try:
        # 1. Fetch admission
        admission_resp = (
            supabase.table("admissions")
            .select("*")
            .eq("id", body.admission_id)
            .single()
            .execute()
        )
        admission = admission_resp.data
        if not admission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admission not found.")

        # 2. Update status to rejected
        supabase.table("admissions").update({"status": "rejected"}).eq("id", body.admission_id).execute()

        # 3. Send rejection email with coupon
        email_sent = send_rejection_email(
            to_email=admission.get("email"),
            full_name=admission.get("full_name"),
        )
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admission rejected, but failed to send the rejection email.",
            )

        return {"message": f"Admission rejected. Rejection email sent to {admission.get('email')}."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process rejection: {str(e)}",
        )
