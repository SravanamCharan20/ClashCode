import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Navigate between rooms, lobby, and contest pages from the top bar.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
