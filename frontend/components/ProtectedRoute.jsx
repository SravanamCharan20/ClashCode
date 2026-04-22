"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../app/auth/userContext";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return children;
};

export default ProtectedRoute;
