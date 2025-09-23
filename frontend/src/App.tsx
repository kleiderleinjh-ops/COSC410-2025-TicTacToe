import TicTacToe from "@/components/TicTacToe";

// Returns Tailwind classes for meta-board thick borders
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div
        className="grid grid-cols-3 grid-rows-3 gap-0 bg-white"
        style={{
          // The overall meta-board size
          boxShadow: "0 0 40px 0 #e5e7eb"
        }}
      >
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center ${metaCellBorder(i)} bg-white`}
            style={{
              width: 300, height: 300, // controls meta cell size
              boxSizing: "border-box",
              // Optionally, reduce padding/margin for TicTacToe
              padding: 0, margin: 0
            }}
          >
            {/* Shrink the TicTacToe board to fit tightly */}
            <div style={{ width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TicTacToe />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}