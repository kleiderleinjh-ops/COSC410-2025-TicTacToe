import React, { useState } from "react";
import TicTacToe from "@/components/TicTacToe";

// Helper for thick meta-board borders
function metaCellBorder(i: number) {
  return [
    i < 3 ? "border-t-0" : "border-t-8",
    i % 3 === 0 ? "border-l-0" : "border-l-8",
    i > 5 ? "border-b-0" : "border-b-8",
    (i + 1) % 3 === 0 ? "border-r-0" : "border-r-8",
    "border-black"
  ].join(" ");
}

export default function App() {
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [resetKey, setResetKey] = useState(0);

  function handleReset() {
    setResetKey(k => k + 1);
    setTurn("X");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div>
        {/* Global status and New Game button */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-3">{turn}'s turn</div>
          <button
            className="rounded-2xl px-6 py-2 border-2 border-black text-xl font-semibold hover:bg-gray-200 transition"
            onClick={handleReset}
          >
            New Game
          </button>
        </div>
        {/* Meta board */}
        <div
          className="grid grid-cols-3 grid-rows-3 gap-0 bg-white"
          style={{
            boxShadow: "0 0 40px 0 #e5e7eb",
            width: 630, // 3 * 210px
            height: 630, // 3 * 210px
          }}
        >
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center ${metaCellBorder(i)} bg-white`}
              style={{
                width: 210,
                height: 210,
                boxSizing: "border-box",
                padding: 0,
                margin: 0,
              }}
            >
              {/* TicTacToe board fills the cell */}
              <div style={{ width: "100%", height: "100%" }}>
                <TicTacToe key={resetKey + "-" + i} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}