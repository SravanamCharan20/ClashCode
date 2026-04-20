'use client'
import React, { useEffect, useState } from "react";
import socket from "../../sockets/socket.js";

const Testing = () => {
  const [status, setStatus] = useState(socket.connected ? "connected" : "disconnected");

  useEffect(() => {
    const handleConnect = () => {
      setStatus("connected");
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return <div>Testing sockets page: {status}</div>;
};

export default Testing;
