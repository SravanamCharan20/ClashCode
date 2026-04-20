'use client'
import { useEffect } from "react";
import socket from "./socket.js";
import { useUser } from "../app/auth/userContext.jsx";

const SocketManager = () => {
  const { user, loading } = useUser();

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (error) => {
      const message = error?.message || "Unable to connect socket";

      // Auth/socket failures are expected when the session is missing or expired.
      if (message === "Not authenticated" || message === "Unauthorized") {
        console.warn("Socket auth skipped:", message);
        socket.disconnect();
        return;
      }

      console.warn("Socket connection issue:", message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!loading && user) {
      if (!socket.connected) {
        socket.connect();
      }
    } else if (!loading && socket.connected) {
      socket.disconnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [user, loading]);

  return null;
};

export default SocketManager;
