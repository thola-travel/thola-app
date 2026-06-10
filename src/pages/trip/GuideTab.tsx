import { useCallback, useEffect, useState } from "react";
import type { Trip, ActivityCategory } from "../../types";
import { useAppDispatch } from "../../store/store";
import {
  fetchNearby,
  loadCachedGuide,
  saveCachedGuide,
  type PlaceResult,
  type Poi,
  type PoiCategory,
} from "../../lib/places";
import { formatDistance } from "../../lib/geo";
import { getEmergencyNumbers } from "../../data/emergency";
import { tripDayCount } from "../../lib/dates";
import { AppIcon } from "../../components/AppIcon";
import { PlaceSearch } from "../../components/PlaceSearch";
import { Modal } from "../../components/Modal";
import { ActivityForm } from "../../components/ActivityForm";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";

const SECTIONS: { category: PoiCategory; title: string; icon: string; activityCategory: ActivityCategory }[] = [
  { category: "sights", title: "Touristy spots", icon: "landmark", activityCategory: "sightseeing" },
  { category: "food", title: "Food & drink", icon: "food", activityCategory: "food" },
  { category: "medical", title: "Medical & pharmacies", icon: "medical", activityCategory: "other" },
  { category: "emergency", title: "Police & fire stations", icon: "siren", activityCategory: "other" },
];

type GuideData = Record<PoiCategory, Poi[]>;

function PoiRow({ poi, onAdd }: { poi: Poi; onAdd?: () => void }) {
  const maps = `https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lon}#map=18/${poi.lat}/${poi.lon}`;
  return (
    <div className="poi-row">
      <div className="poi-body">
        <div className="poi-name">{poi.name}</div>
        <div className="poi-meta">
          {poi.kind} · {formatDistance(poi.distanceM)} away ·{" "}
          <a href={maps} target="_blank" rel="noreferrer">
            map
          </a>
        </div>
      </div>
      {onAdd && (
        <button className="btn secondary small" onClick={onAdd}>
          + Plan
        </button>
      )}
    </div>
  );
}

export function GuideTab({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [data, setData] = useState<GuideData | null>(() => loadCachedGuide(trip.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachText, setAttachText] = useState(trip.destination);
  const [planning, setPlanning] = useState<{ title: string; category: ActivityCategory } | null>(null);

  const hasCoords = trip.lat !== undefined && trip.lon !== undefined;

  const load = useCallback(async () => {
    if (trip.lat === undefined || trip.lon === undefined) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNearby(trip.lat, trip.lon);
      setData(result);
      saveCachedGuide(trip.id, result);
    } catch {
      setError(
        "Couldn't load nearby places — you may be offline, or the free map service is busy. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, [trip.id, trip.lat, trip.lon]);

  useEffect(() => {
    if (hasCoords && !data && !loading) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords]);

  function attachPlace(place: PlaceResult) {
    dispatch({
      type: "trip/update",
      id: trip.id,
      patch: {
        destination: place.displayName.split(",").slice(0, 2).join(",").trim(),
        lat: place.lat,
        lon: place.lon,
        countryCode: place.countryCode,
      },
    });
    setData(null);
    toast(`Pinned to ${place.name}`);
  }

  const emergency = getEmergencyNumbers(trip.countryCode);

  if (!hasCoords) {
    return (
      <>
        <div className="card settings-section">
          <h3>
            <AppIcon id="pin" size={17} /> Pin your destination
          </h3>
          <p>
            Search the real place you're going — that unlocks nearby restaurants, sights, medical
            spots, and local emergency numbers.
          </p>
          <PlaceSearch value={attachText} onChange={setAttachText} onSelect={attachPlace} autoFocus />
        </div>
        <EmptyState
          icon={<AppIcon id="compass" size={52} />}
          title="No place pinned yet"
          body="Pick your destination above and the guide fills itself in with real places."
        />
      </>
    );
  }

  return (
    <>
      <div className="guide-head">
        <p className="muted">
          Real places near <strong>{trip.destination || "your destination"}</strong>, from
          OpenStreetMap.
        </p>
        <button className="btn ghost small" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="card emergency-card">
        <h3>
          <AppIcon id="siren" size={17} /> Emergency numbers — {emergency.country}
        </h3>
        <div className="emergency-grid">
          <a className="emergency-num" href={`tel:${emergency.police}`}>
            <AppIcon id="phone" size={14} /> Police <strong>{emergency.police}</strong>
          </a>
          <a className="emergency-num" href={`tel:${emergency.ambulance}`}>
            <AppIcon id="medical" size={14} /> Ambulance <strong>{emergency.ambulance}</strong>
          </a>
          <a className="emergency-num" href={`tel:${emergency.fire}`}>
            <AppIcon id="siren" size={14} /> Fire <strong>{emergency.fire}</strong>
          </a>
        </div>
        {emergency.notes && <p className="muted" style={{ marginTop: 8 }}>{emergency.notes}</p>}
      </div>

      {loading && !data && (
        <EmptyState
          icon={<AppIcon id="search" size={52} />}
          title="Finding spots near you…"
          body="Pulling real restaurants, sights, pharmacies, and more from the map."
        />
      )}

      {error && !data && (
        <EmptyState
          icon={<AppIcon id="search" size={52} />}
          title="Couldn't load places"
          body={error}
          action={
            <button className="btn" onClick={() => void load()}>
              Try again
            </button>
          }
        />
      )}

      {data &&
        SECTIONS.map((section) => {
          const pois = data[section.category];
          return (
            <section key={section.category} className="guide-section">
              <h2 className="section-label">
                <AppIcon id={section.icon} size={15} /> {section.title}
              </h2>
              {pois.length === 0 ? (
                <p className="muted">
                  Nothing mapped within ~3 km. Bigger towns nearby may have more.
                </p>
              ) : (
                <div className="card poi-list">
                  {pois.slice(0, 8).map((poi) => (
                    <PoiRow
                      key={poi.id}
                      poi={poi}
                      onAdd={
                        section.category === "food" || section.category === "sights"
                          ? () =>
                              setPlanning({
                                title:
                                  section.category === "food"
                                    ? `Eat at ${poi.name}`
                                    : `Visit ${poi.name}`,
                                category: section.activityCategory,
                              })
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

      {planning && (
        <Modal title="Add to itinerary" onClose={() => setPlanning(null)}>
          <ActivityForm
            dayCount={tripDayCount(trip.startDate, trip.endDate)}
            startDate={trip.startDate}
            initial={{ title: planning.title, category: planning.category }}
            submitLabel="Add to itinerary"
            onCancel={() => setPlanning(null)}
            onSubmit={(activity) => {
              dispatch({ type: "activity/add", tripId: trip.id, activity });
              setPlanning(null);
              toast("Added to your itinerary");
            }}
          />
        </Modal>
      )}
    </>
  );
}
