"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Phase {
  phase_number: number;
  phase_title: string;
  weeks_covered: string;
  status: "locked" | "unlocked" | "completed";
  lecture_watched: boolean;
  quiz_attempts: number;
  quiz_score: number | null;
  quiz_passed: boolean;
  project_1_submitted: boolean;
  project_2_submitted: boolean;
}

interface DashboardData {
  user: {
    full_name: string;
    email: string;
    domain: string;
    subscription_type: string | null;
  };
  total_phases: number;
  completed_phases: number;
  phases: Phase[];
}

interface Analytics {
  current_streak: number;
  longest_streak: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
  total_challenges_solved: number;
  total_projects_submitted: number;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8000/api/student/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.detail || "Failed to load dashboard");
        setData(body);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch("http://localhost:8000/api/student/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body) => setAnalytics(body))
      .catch(() => {});
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-6 py-4 max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progressPercent = Math.round((data.completed_phases / data.total_phases) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm">
              PF
            </span>
            PathForge AI
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/leaderboard")}
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => router.push("/dashboard/flashcards")}
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              🗂️ Flashcards
            </button>
            {analytics && analytics.current_streak > 0 && (
              <span className="text-sm font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                🔥 {analytics.current_streak} day streak
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome + progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {data.user.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {data.user.domain} — {data.completed_phases} of {data.total_phases} phases completed
          </p>
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall progress</span>
              <span className="font-semibold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Longest streak" value={`🔥 ${analytics.longest_streak}d`} />
            <StatCard label="Avg quiz score" value={`${analytics.average_quiz_score}%`} />
            <StatCard label="Challenges solved" value={`${analytics.total_challenges_solved}`} />
            <StatCard label="Projects submitted" value={`${analytics.total_projects_submitted}`} />
          </div>
        )}

        {/* Phase list */}
        <div className="space-y-3">
          {data.phases.map((phase) => (
            <PhaseCard key={phase.phase_number} phase={phase} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const router = useRouter();
  const isLocked = phase.status === "locked";
  const isCompleted = phase.status === "completed";

  const statusConfig = {
    locked: { icon: "🔒", label: "Locked", badgeClass: "bg-gray-100 text-gray-500" },
    unlocked: { icon: "🔵", label: "In Progress", badgeClass: "bg-blue-100 text-blue-700" },
    completed: { icon: "✅", label: "Completed", badgeClass: "bg-green-100 text-green-700" },
  }[phase.status];

  return (
    <button
      onClick={() => !isLocked && router.push(`/dashboard/phase/${phase.phase_number}`)}
      disabled={isLocked}
      className={`w-full text-left bg-white border rounded-xl p-5 flex items-center justify-between transition-all ${
        isLocked
          ? "border-gray-200 opacity-60 cursor-not-allowed"
          : "border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
            isCompleted
              ? "bg-green-100 text-green-700"
              : isLocked
              ? "bg-gray-100 text-gray-400"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {isLocked ? "🔒" : phase.phase_number}
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            Phase {phase.phase_number}: {phase.phase_title}
          </div>
          <div className="text-sm text-gray-500">{phase.weeks_covered}</div>
        </div>
      </div>
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.badgeClass}`}>
        {statusConfig.icon} {statusConfig.label}
      </span>
    </button>
  );
}