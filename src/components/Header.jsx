import React from "react";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold">ELSIP Dashboard</h1>
      <div className="flex items-center gap-4">
        <button className="bg-gray-200 px-3 py-1 rounded">Notifications</button>
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full">NA</div>
      </div>
    </header>
  );
}
