import { useEffect, useState } from "react";
import { type BoardStore, loadBoardStore, saveBoardStore } from "../core/board";

export function useBoardStore() {
  const [board, setBoard] = useState<BoardStore>(() => loadBoardStore());

  useEffect(() => {
    saveBoardStore(board);
  }, [board]);

  return [board, setBoard] as const;
}
