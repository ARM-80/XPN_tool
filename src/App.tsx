import { Tabletop } from "./tabletop/Tabletop";
import { useBoardStore } from "./tabletop/useBoardStore";
import { useResearchStore } from "./review/useResearchStore";
import "./App.css";

export default function App() {
  const [board, setBoard] = useBoardStore();
  const [research, setResearch] = useResearchStore();

  return (
    <Tabletop
      board={board}
      research={research}
      onBoard={setBoard}
      onResearch={setResearch}
    />
  );
}
