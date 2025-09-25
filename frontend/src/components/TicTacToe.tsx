import React from "react";

type Player = "X" | "O";
type Cell = Player | null;

type Props = {
  onWin?: (winner: Player | "draw" | null) => void;
};

type GameStateDTO = {
  id: string;
  board: Cell[];
  current_player: Player;
  winner: Player | null;
  is_draw: boolean;
  status: string;
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export default function TicTacToe({ onWin }: Props) {
  const [state, setState] = React.useState<GameStateDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let canceled = false;
    async function start() {
      setError(null);
      setLoading(true);
      try {
        const gs = await createGame();
        if (!canceled) setState(gs);
      } catch (e: any) {
        if (!canceled) setError(e?.message ?? "Failed to start game");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    start();
    return () => {
      canceled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!state || !onWin) return;
    if (state.winner) onWin(state.winner);
    else if (state.is_draw) onWin("draw");
  }, [state?.winner, state?.is_draw]);

  async function createGame(): Promise<GameStateDTO> {
    const r = await fetch(`${API_BASE}/tictactoe/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starting_player: "X" }),
    });
    if (!r.ok) throw new Error(`Create failed: ${r.status}`);
    return r.json();
  }

  async function playMove(index: number): Promise<GameStateDTO> {
    if (!state) throw new Error("No game");
    const r = await fetch(`${API_BASE}/tictactoe/${state.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      throw new Error(detail?.detail ?? `Move failed: ${r.status}`);
    }
    return r.json();
  }

  async function handleClick(i: number) {
    if (!state || loading) return;
    if (state.winner || state.is_draw || state.board[i] !== null) return;

    setLoading(true);
    setError(null);
    try {
      const next = await playMove(i);
      setState(next);
    } catch (e: any) {
      setError(e?.message ?? "Move failed");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-sm mx-auto p-2">
        <div className="mb-2 text-red-600 font-semibold">Error: {error}</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="max-w-sm mx-auto p-2">
        <div className="text-center">Loading…</div>
      </div>
    );
  }

  const { board } = state;

  // Only render the grid, no status, no New Game button
  return (
    <div className="max-w-sm mx-auto p-2">
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button
            key={i}
            className="aspect-square rounded-xl border-2 border-gray-400 text-3xl font-bold flex items-center justify-center bg-white hover:bg-gray-100 transition-all"
            onClick={() => handleClick(i)}
            aria-label={`cell-${i}`}
            disabled={loading || c !== null || state.winner !== null || state.is_draw}
            style={{
              minWidth: 0,
              minHeight: 0,
              padding: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

