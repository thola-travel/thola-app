import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppState } from "../types";
import { initialState, reducer, sanitizeState, type Action } from "./reducer";

const STORAGE_KEY = "thola.state.v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return sanitizeState(JSON.parse(raw)) ?? initialState;
  } catch {
    return initialState;
  }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or unavailable (private mode); the app keeps working in memory.
  }
}

const StateContext = createContext<AppState>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  return useContext(StateContext);
}

export function useAppDispatch(): Dispatch<Action> {
  return useContext(DispatchContext);
}
