import { useState } from "react";
import { ExploreMode } from "./explore/ExploreMode";
import { ReviewMode } from "./review/ReviewMode";
import { useResearchStore } from "./review/useResearchStore";
import "./App.css";

type AppView = "explore" | "review";

export default function App() {
  const [view, setView] = useState<AppView>("explore");
  const [store, setStore] = useResearchStore();

  return (
    <main className="app">
      <div className="view-tabs" role="group" aria-label="App view">
        <button type="button" aria-pressed={view === "explore"} onClick={() => setView("explore")}>
          Explore
        </button>
        <button type="button" aria-pressed={view === "review"} onClick={() => setView("review")}>
          Review
        </button>
      </div>
      {view === "explore" ? <ExploreMode /> : <ReviewMode store={store} onChange={setStore} />}
    </main>
  );
}
