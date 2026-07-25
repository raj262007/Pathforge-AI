from pydantic import BaseModel, EmailStr
from typing import Optional


class AdmissionForm(BaseModel):
    full_name: str
    email: str
    whatsapp: str
    enrollment_no: str
    branch: str
    year: str
    address: str
    parent_mobile: str
    domain: str
    reason: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class SelectAdmissionRequest(BaseModel):
    admission_id: str
    plan: str  # "pro" or "career_pro"


class RejectAdmissionRequest(BaseModel):
    admission_id: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserInfo(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    subscription_type: Optional[str] = None
    status: Optional[str] = None
