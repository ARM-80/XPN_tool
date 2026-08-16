import { useEffect, useState } from "react";
import {
  type ResearchStore,
  loadResearchStore,
  saveResearchStore,
} from "../core/research";

export function useResearchStore() {
  const [store, setStore] = useState<ResearchStore>(() => loadResearchStore());

  useEffect(() => {
    saveResearchStore(store);
  }, [store]);

  return [store, setStore] as const;
}
