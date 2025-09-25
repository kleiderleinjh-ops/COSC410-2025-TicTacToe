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
      <div className="w-full h-full flex items-center justify-center">
        <div className="mb-2 text-red-600 font-semibold">Error: {error}</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">Loading…</div>
      </div>
    );
  }

  // Show a giant X/O when won, or "Draw" if drawn
  if (state.winner) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-[6rem] font-extrabold text-gray-900">{state.winner}</span>
      </div>
    );
  }
  if (state.is_draw) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-5xl font-extrabold text-gray-400">Draw</span>
      </div>
    );
  }

  const { board } = state;

  // Normal grid rendering
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-0 w-full h-full">
        {board.map((c, i) => (
          <button
            key={i}
            className="aspect-square border-2 border-black text-3xl font-bold flex items-center justify-center bg-white"
            onClick={() => handleClick(i)}
            aria-label={`cell-${i}`}
            disabled={loading || c !== null || state.winner !== null || state.is_draw}
            style={{
              minWidth: 0,
              minHeight: 0,
              width: "100%",
              height: "100%",
              padding: 0,
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
