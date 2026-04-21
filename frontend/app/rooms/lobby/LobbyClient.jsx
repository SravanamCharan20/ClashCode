"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import socket from "../../../sockets/socket.js";
import { useUser } from "../../auth/userContext";
import ProblemsPanel from "../components/ProblemsPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

const LobbyClient = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initialRoomCode = searchParams.get("roomCode") || "";
  const [participants, setParticipants] = useState([]);
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [roomProblems, setRoomProblems] = useState([]);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const currentParticipant = participants.find(
    (participant) => participant.user?.toString() === user?._id?.toString(),
  );

  const isCurrentUserReady = Boolean(currentParticipant?.ready);
  const allReady = participants.length > 0 && participants.every((p) => p.ready);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setError("Missing room id");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/room/${roomId}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Unable to load room");
          setLoading(false);
          return;
        }

        setParticipants(data.room.participants || []);
        setRoomCode(data.room.roomCode || "");
        setDuration(data.room.duration || null);
        setRoomProblems(data.room.problems || []);
      } catch {
        setError("Something went wrong while loading the room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (userLoading || !roomId || !user) return;

    const handleParticipantsUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants);
    };

    const handleRoomStarted = () => {
      router.push(`/rooms/arena?roomId=${roomId}&roomCode=${roomCode}`);
    };

    const handleRoomError = (payload) => {
      setError(payload?.message || "Room action failed");
    };

    socket.emit("join-room", roomId);
    socket.on("participants-update", handleParticipantsUpdate);
    socket.on("room-started", handleRoomStarted);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("participants-update", handleParticipantsUpdate);
      socket.off("room-started", handleRoomStarted);
      socket.off("room-error", handleRoomError);
    };
  }, [roomCode, roomId, router, user, userLoading]);

  const start = () => {
    if (!roomId) return;
    socket.emit("start-room", roomId);
  };

  const toggleReady = () => {
    if (!roomId) return;
    socket.emit("toggle-ready", roomId);
  };

  if (loading || userLoading) {
    return <div className="min-h-screen bg-gray-50 px-6 py-24">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            Contest Lobby
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            Final room check before entering arena
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Confirm participants, verify readiness, and launch the contest when the room is fully prepared.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Room Code</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{roomCode}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Duration</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {duration ? `${duration} minutes` : "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Problems</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{roomProblems.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Participants</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{participants.length}</p>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <ProblemsPanel
            problems={roomProblems}
            title="Problems Panel"
            subtitle="Selected Contest Set"
          />

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Participants
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Room lineup and readiness
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  allReady
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {allReady ? "All Ready" : "Waiting for readiness"}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {participants.length === 0 ? (
                <p className="text-sm text-gray-500">No participants yet.</p>
              ) : (
                participants.map((participant, index) => (
                  <div
                    key={participant.user}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {participant.username}
                        {participant.user?.toString() === user?._id?.toString() && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        participant.ready
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {participant.ready ? "Ready" : "Waiting"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {currentParticipant && (
                <button
                  onClick={toggleReady}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                    isCurrentUserReady
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {isCurrentUserReady ? "Set Not Ready" : "Set Ready"}
                </button>
              )}

              {user?.role === "admin" && (
                <button
                  disabled={!allReady}
                  onClick={start}
                  className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Contest
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyClient;
