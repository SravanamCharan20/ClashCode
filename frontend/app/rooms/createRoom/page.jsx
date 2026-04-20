"use client";

import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";

const CreateRoom = () => {
  return (
    <ProtectedRoute>
      <>
      <div>Create Room Page</div>
      <div>
        <button className="cursor-pointer rounded-xl p-2 bg-slate-900 text-white">
          Start Contest
        </button>
      </div>
    </>
    </ProtectedRoute>
  );
};

export default CreateRoom;