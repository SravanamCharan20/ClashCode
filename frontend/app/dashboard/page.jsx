"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

const formatRemainingTime = (remainingSeconds) => {
  if (typeof remainingSeconds !== "number") {
    return "Not started";
  }

  const safeSeconds = Math.max(0, remainingSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s left`;
  }

  return `${minutes}m ${seconds}s left`;
};

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [runningRoom, setRunningRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(null);

  useEffect(() => {
    const fetchRunningRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/room/running-room`, {
          credentials: "include",
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRunningRoom(data.room);
      } catch {
        console.log("No running room");
      } finally {
        setLoading(false);
      }
    };

    fetchRunningRoom();
  }, []);

  useEffect(() => {
    if (!runningRoom?.endsAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [runningRoom?.endsAt]);

  const remainingSeconds = runningRoom?.endsAt
    ? now === null
      ? runningRoom.remainingSeconds
      : Math.max(0, Math.ceil((new Date(runningRoom.endsAt).getTime() - now) / 1000))
    : runningRoom?.remainingSeconds ?? null;
  const hasRunningContest =
    !loading &&
    Boolean(runningRoom) &&
    runningRoom.status === "started" &&
    Boolean(runningRoom.startTime) &&
    typeof remainingSeconds === "number" &&
    remainingSeconds > 0;
  const showTerminationNotice = searchParams.get("notice") === "room-terminated";
  const terminatedRoomCode = searchParams.get("roomCode");

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Manage your contests and resume ongoing ones.
          </p>
        </div>

        {showTerminationNotice && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800 shadow-sm">
            {terminatedRoomCode
              ? `Room ${terminatedRoomCode} was terminated by the admin.`
              : "Room was terminated by the admin."}
          </div>
        )}

        {/* Running Contest */}
        {hasRunningContest && (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-lg">
            <p className="text-xs font-medium uppercase tracking-widest text-green-600">
              Ongoing Contest
            </p>

            <h2 className="mt-2 text-xl font-semibold text-gray-900">
              Room Code: {runningRoom.roomCode}
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-green-200 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">Duration</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {runningRoom.duration} minutes
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">Time Left</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatRemainingTime(remainingSeconds)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-green-200 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">Participants</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {runningRoom.participantsCount}
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">Problems</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {runningRoom.problemsCount}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  router.push(
                    `/rooms/arena?roomId=${runningRoom.id}&roomCode=${runningRoom.roomCode}`,
                  )
                }
                className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                Resume Contest
              </button>
              <button
                onClick={() => router.push("/rooms/joinRoom")}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
              >
                Join Another Room
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
