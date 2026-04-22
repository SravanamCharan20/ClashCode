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
  const showCompletionNotice = searchParams.get("notice") === "room-completed";
  const terminatedRoomCode = searchParams.get("roomCode");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-10 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
                Control your coding contest workflow
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Join ongoing contests, create new rooms, and revisit completed contests from one place.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
              Live Contest Platform
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => router.push("/rooms/joinRoom")}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">Join Room</p>
              <p className="mt-1 text-xs text-gray-500">Enter an invite code and compete.</p>
            </button>
            <button
              onClick={() => router.push("/rooms/createRoom")}
              className="rounded-2xl border border-gray-900 bg-gray-900 px-4 py-3 text-left text-white transition hover:bg-black"
            >
              <p className="text-sm font-semibold">Create Contest</p>
              <p className="mt-1 text-xs text-gray-300">Setup problems, duration, and launch.</p>
            </button>
            <button
              onClick={() => router.push("/contests")}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">Contests Archive</p>
              <p className="mt-1 text-xs text-gray-500">Review previous contests and results.</p>
            </button>
            <button
              onClick={() => router.push("/contests")}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">My Results</p>
              <p className="mt-1 text-xs text-gray-500">Open any completed contest result.</p>
            </button>
          </div>
        </div>

        {showTerminationNotice && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800 shadow-sm">
            {terminatedRoomCode
              ? `Room ${terminatedRoomCode} was terminated by the admin.`
              : "Room was terminated by the admin."}
          </div>
        )}
        {showCompletionNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800 shadow-sm">
            {terminatedRoomCode
              ? `Room ${terminatedRoomCode} has been completed.`
              : "Contest completed successfully."}
          </div>
        )}

        {hasRunningContest && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Ongoing Contest
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                  Room {runningRoom.roomCode}
                </h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {formatRemainingTime(remainingSeconds)}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{runningRoom.duration} min</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Participants</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{runningRoom.participantsCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Problems</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{runningRoom.problemsCount}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  router.push(
                    `/rooms/arena?roomId=${runningRoom.id}&roomCode=${runningRoom.roomCode}`,
                  )
                }
                className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
              >
                Resume Contest
              </button>
              <button
                onClick={() => router.push("/rooms/joinRoom")}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Browse Rooms
              </button>
            </div>
          </div>
        )}

        {!hasRunningContest && !loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">No active contest room right now.</p>
            <p className="mt-2 text-base font-medium text-gray-800">
              Start a new contest or jump into the archive.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/rooms/joinRoom")}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Join Room
              </button>
              <button
                onClick={() => router.push("/rooms/createRoom")}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Create Contest
              </button>
              <button
                onClick={() => router.push("/contests")}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Open Archive
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
