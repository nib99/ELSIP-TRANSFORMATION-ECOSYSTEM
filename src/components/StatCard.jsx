import React from "react";

export default function StatCard({ title, count, icon, color = "bg-white" }) {
  return (
    <div className={`p-4 rounded shadow ${color}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold">{count}</div>
        </div>
      </div>
    </div>
  );
}
