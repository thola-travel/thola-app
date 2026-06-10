import { useMemo, useState } from "react";
import { Icon3D } from "../components/Icon3D";
import { COST_LABELS, DESTINATIONS, type Destination } from "../data/destinations";
import { useAppDispatch } from "../store/store";
import { Modal } from "../components/Modal";
import { TripForm } from "../components/TripForm";
import { EmptyState } from "../components/EmptyState";
import { PACKING_ESSENTIALS } from "../data/packing";
import { navigate } from "../lib/router";
import { useToast } from "../components/Toast";
import { uid } from "../lib/id";

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"] as const;

function DestinationCard({ dest, onStart }: { dest: Destination; onStart: () => void }) {
  return (
    <article className="dest-card">
      <div className="dest-head">
        <span className="dest-emoji" aria-hidden>
          <Icon3D id={dest.icon} size={28} />
        </span>
        <div>
          <h3>{dest.name}</h3>
          <p className="dest-country">{dest.country}</p>
        </div>
      </div>
      <p className="dest-blurb">{dest.blurb}</p>
      <div className="dest-facts">
        <span className="chip teal">
          <Icon3D id="calendar" size={13} /> Best: {dest.bestTime}
        </span>
        <span className="chip">{COST_LABELS[dest.costLevel]}</span>
        <span className="chip">~{dest.suggestedDays} days</span>
      </div>
      <ul className="dest-highlights">
        {dest.highlights.slice(0, 3).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <button className="btn secondary small" onClick={onStart}>
        Plan this trip →
      </button>
    </article>
  );
}

export function ExplorePage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [starting, setStarting] = useState<Destination | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESTINATIONS.filter((d) => {
      if (region !== "All" && d.region !== region) return false;
      if (!q) return true;
      const haystack = `${d.name} ${d.country} ${d.tags.join(" ")} ${d.blurb}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, region]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-sub">Hand-picked destinations to spark the next trip.</p>
        </div>
      </div>

      <div className="explore-filters">
        <input
          className="search-input"
          type="search"
          placeholder="Search destinations, countries, vibes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search destinations"
        />
        <div className="chip-row">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`chip-btn ${region === r ? "selected" : ""}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon3D id="search" size={52} />}
          title="Nothing matches"
          body="Try a different search or region — or plan a custom trip from the Trips page."
        />
      ) : (
        <div className="dest-grid">
          {filtered.map((d) => (
            <DestinationCard key={d.id} dest={d} onStart={() => setStarting(d)} />
          ))}
        </div>
      )}

      {starting && (
        <Modal title={`Trip to ${starting.name}`} onClose={() => setStarting(null)}>
          <TripForm
            prefill={{
              name: `${starting.name} ${new Date().getFullYear()}`,
              destination: `${starting.name}, ${starting.country}`,
              icon: starting.icon,
            }}
            submitLabel="Start planning"
            onCancel={() => setStarting(null)}
            onSubmit={(draft) => {
              const id = uid();
              dispatch({ type: "trip/add", draft, id, packing: PACKING_ESSENTIALS });
              setStarting(null);
              toast(`${starting.name} — great choice!`);
              navigate({ page: "trip", tripId: id, tab: "itinerary" });
            }}
          />
        </Modal>
      )}
    </>
  );
}
