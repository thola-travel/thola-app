import { useEffect, useRef, useState } from "react";
import { searchPlaces, type PlaceResult } from "../lib/places";
import { AppIcon } from "./AppIcon";

interface PlaceSearchProps {
  id?: string;
  /** Current text value (controlled). */
  value: string;
  onChange: (text: string) => void;
  /** Called when the user picks a real place from the suggestions. */
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Free-text input with live "real place" suggestions from OpenStreetMap.
 * Typing stays free-form (works offline); picking a suggestion attaches
 * real coordinates.
 */
export function PlaceSearch({ id, value, onChange, onSelect, placeholder, autoFocus }: PlaceSearchProps) {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pickedRef = useRef(false);

  useEffect(() => {
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (pickedRef.current) {
      pickedRef.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      setFailed(false);
      try {
        const found = await searchPlaces(q, controller.signal);
        setResults(found);
        setOpen(true);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResults([]);
          setFailed(true);
          setOpen(true);
        }
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(timerRef.current);
  }, [value]);

  return (
    <div className="place-search">
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search a city, town, or place…"}
        autoFocus={autoFocus}
        autoComplete="off"
        maxLength={120}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {searching && <span className="place-search-status">Searching…</span>}
      {open && (
        <div className="place-results" role="listbox">
          {failed && (
            <div className="place-result-empty">
              Couldn't reach the map service — check your connection. You can still type the
              destination by hand.
            </div>
          )}
          {!failed && results.length === 0 && !searching && (
            <div className="place-result-empty">No places found for that search.</div>
          )}
          {results.map((r) => (
            <button
              key={`${r.lat},${r.lon}`}
              type="button"
              className="place-result"
              role="option"
              aria-selected="false"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                pickedRef.current = true;
                onSelect(r);
                setOpen(false);
              }}
            >
              <AppIcon id="pin" size={15} />
              <span className="place-result-text">
                <span className="place-result-name">{r.name}</span>
                <span className="place-result-detail">{r.displayName}</span>
              </span>
            </button>
          ))}
          {!failed && results.length > 0 && (
            <div className="place-attribution">Search data © OpenStreetMap contributors</div>
          )}
        </div>
      )}
    </div>
  );
}
