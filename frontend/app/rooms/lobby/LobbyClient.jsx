"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import socket from "../../../sockets/socket.js";
import { useUser } from "../../auth/userContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

const LobbyClient = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initialRoomCode = searchParams.get("roomCode") || "";
  const [participants, setParticipants] = useState([]);
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

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

  if (loading || userLoading) {
    return <div className="min-h-screen bg-gray-50 px-6 py-24">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-24">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Contest Lobby
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Lobby</h1>
        <p className="mt-2 text-sm text-gray-500">
          Room Code: <span className="font-medium text-gray-900">{roomCode}</span>
        </p>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {participants.length === 0 ? (
            <p className="text-sm text-gray-500">No participants yet.</p>
          ) : (
            participants.map((participant) => (
              <div
                key={participant.user}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-900">
                  {participant.username}
                </p>
              </div>
            ))
          )}
        </div>

        {user?.role === "admin" && (
          <button
            onClick={start}
            className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900"
          >
            Start Contest
          </button>
        )}
      </div>
    </div>
  );
};

export default LobbyClient;
