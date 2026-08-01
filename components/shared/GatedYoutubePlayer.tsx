"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------
type Props = {
  videoUrl: string;
  startTimeSeconds?: number;
  endTimeSeconds?: number | null; // null/undefined = no limit, plays the full video
  alreadyCompleted: boolean; // if lecture_watched is already true, skip the gate
  onSegmentComplete: () => void; // called when playback reaches endTimeSeconds (pass your existing handleMarkWatched here)
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function getYoutubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

// Load the YouTube IFrame API only once, even if multiple players exist on the page
let apiLoadPromise: Promise<void> | null = null;
function loadYoutubeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return apiLoadPromise;
}

// ---------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------
export default function GatedYoutubePlayer({
  videoUrl,
  startTimeSeconds = 0,
  endTimeSeconds = null,
  alreadyCompleted,
  onSegmentComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFiredRef = useRef(alreadyCompleted);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    let destroyed = false;
    const videoId = getYoutubeId(videoUrl);
    hasFiredRef.current = alreadyCompleted;

    loadYoutubeApi().then(() => {
      if (destroyed || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          start: startTimeSeconds || 0,
          rel: 0,
        },
        events: {
          onReady: () => {
            // Only poll for the end boundary if a limit is set and it hasn't been completed yet
            if (endTimeSeconds && !hasFiredRef.current) {
              intervalRef.current = setInterval(() => {
                const player = playerRef.current;
                if (!player || typeof player.getCurrentTime !== "function") return;

                const current = player.getCurrentTime();

                if (current >= endTimeSeconds) {
                  player.pauseVideo();
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (!hasFiredRef.current) {
                    hasFiredRef.current = true;
                    setShowReminder(true);
                    onSegmentComplete(); // marks lecture_watched=true on the backend
                  }
                }
              }, 1000);
            }
          },
          onStateChange: (event: any) => {
            // Prevent skipping ahead past the allowed segment
            if (endTimeSeconds && event.data === window.YT.PlayerState.PLAYING) {
              const player = playerRef.current;
              if (player && player.getCurrentTime() > endTimeSeconds) {
                player.seekTo(endTimeSeconds, true);
                player.pauseVideo();
              }
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, startTimeSeconds, endTimeSeconds]);

  return (
    <>
      <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {showReminder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">🎉 Video Complete!</h2>
            <p className="text-gray-600 mb-4">
              You&apos;ve finished this lecture segment. The quiz is now
              unlocked — scroll down to start it.
            </p>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
              onClick={() => setShowReminder(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}