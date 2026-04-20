'use client'
import { useEffect } from "react";
import socket from "./socket.js";
import { useUser } from "../app/auth/userContext.jsx";

const SocketManager = () => {
  const { user } = useUser();

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (user) {
      if (!socket.connected) {
        socket.connect();
      }
    } else if (socket.connected) {
      socket.disconnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [user]);

  return null;
};

export default SocketManager;
