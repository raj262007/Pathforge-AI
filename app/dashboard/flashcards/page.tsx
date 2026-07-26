"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

interface Flashcard {
  flashcard_id: string;
  question: string;
  answer: string;
  phase_number: number;
}

function authHeaders() {
  const token = localStorage.getItem("student_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadDue() {
    const token = localStorage.getItem("student_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_BASE}/student/flashcards/due`, { headers: authHeaders() })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.detail || "Failed to load flashcards");
        setCards(body.flashcards || []);
        setIndex(0);
        setShowAnswer(false);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReview(quality: number) {
    const card = cards[index];
    if (!card) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/student/flashcards/${card.flashcard_id}/review`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ quality }),
      });
      if (index + 1 < cards.length) {
        setIndex(index + 1);
        setShowAnswer(false);
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-6 py-4 max-w-md text-center">
          {error}
        </div>
      </div>
    );

  const currentCard = cards[index];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm">
              PF
            </span>
            Flashcards
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {!currentCard ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">🎉 All caught up!</p>
            <p className="text-sm text-gray-500">No flashcards due today. Come back tomorrow.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Card {index + 1} of {cards.length} — Phase {currentCard.phase_number}
            </p>
            <div
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-white border border-gray-200 rounded-xl p-10 min-h-[220px] flex items-center justify-center text-center cursor-pointer hover:shadow-sm transition-all"
            >
              <p className="text-lg font-medium text-gray-900">
                {showAnswer ? currentCard.answer : currentCard.question}
              </p>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              {showAnswer ? "Answer" : "Question — tap card to reveal answer"}
            </p>

            {showAnswer && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3 text-center">How well did you remember it?</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleReview(1)}
                    disabled={submitting}
                    className="bg-red-50 text-red-600 text-sm font-medium py-2.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    😵 Forgot
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    disabled={submitting}
                    className="bg-yellow-50 text-yellow-700 text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                  >
                    🤔 With difficulty
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    disabled={submitting}
                    className="bg-green-50 text-green-700 text-sm font-medium py-2.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    😄 Easily
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}