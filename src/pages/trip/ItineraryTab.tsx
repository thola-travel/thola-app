import { useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import type { Activity, ActivityCategory, Trip } from "../../types";
import { ACTIVITY_CATEGORIES } from "../../types";
import { useAppDispatch } from "../../store/store";
import { dateOfDay, formatDayLabel, tripDayCount } from "../../lib/dates";
import { Modal } from "../../components/Modal";
import { ActivityForm } from "../../components/ActivityForm";
import { buildItinerary, type Pace } from "../../lib/planner";
import { loadCachedGuide } from "../../lib/places";
import { DESTINATIONS } from "../../data/destinations";
import { useToast } from "../../components/Toast";

function categoryOf(category: ActivityCategory) {
  return ACTIVITY_CATEGORIES.find((c) => c.value === category);
}

function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    if (a.time === "" && b.time === "") return 0;
    if (a.time === "") return 1;
    if (b.time === "") return -1;
    return a.time.localeCompare(b.time);
  });
}

const PACES: { value: Pace; label: string; blurb: string }[] = [
  { value: "relaxed", label: "Relaxed", blurb: "One thing a day, lots of breathing room" },
  { value: "balanced", label: "Balanced", blurb: "Mornings out, afternoons flexible" },
  { value: "full", label: "See it all", blurb: "Packed days, every meal planned" },
];

function PlannerModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [pace, setPace] = useState<Pace>("balanced");
  const dayCount = tripDayCount(trip.startDate, trip.endDate);

  const curated = DESTINATIONS.find(
    (d) =>
      trip.destination.toLowerCase().includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(trip.destination.split(",")[0].trim().toLowerCase())
  );

  function generate() {
    const pois = loadCachedGuide(trip.id);
    const suggestions = buildItinerary({
      dayCount,
      pace,
      pois,
      highlights: curated?.highlights ?? [],
      destination: trip.destination,
    });
    dispatch({ type: "activity/addMany", tripId: trip.id, activities: suggestions });
    toast(`Planned ${suggestions.length} things across ${dayCount} ${dayCount === 1 ? "day" : "days"}`);
    onClose();
  }

  return (
    <Modal title="Plan my days" onClose={onClose}>
      <p className="muted" style={{ marginTop: 0 }}>
        Builds a full {dayCount}-day plan — arrival, sights, meals, departure — using real nearby
        places when the Guide tab has loaded them. You can edit or delete anything afterwards.
      </p>
      <div className="field">
        <label>Pace</label>
        <div className="pace-options">
          {PACES.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`pace-option ${pace === p.value ? "selected" : ""}`}
              onClick={() => setPace(p.value)}
            >
              <strong>{p.label}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
        </div>
      </div>
      {!loadCachedGuide(trip.id) && (
        <p className="muted">
          Tip: open the <strong>Guide</strong> tab first and I'll use real restaurants and sights
          near {trip.destination || "your destination"} in the plan.
        </p>
      )}
      <div className="form-actions">
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn" onClick={generate}>
          <AppIcon id="sparkles" size={15} /> Build my plan
        </button>
      </div>
    </Modal>
  );
}

export function ItineraryTab({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState<number | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [planning, setPlanning] = useState(false);

  const dayCount = tripDayCount(trip.startDate, trip.endDate);
  const byDay = new Map<number, Activity[]>();
  for (const a of trip.activities) {
    byDay.set(a.dayIndex, [...(byDay.get(a.dayIndex) ?? []), a]);
  }

  return (
    <>
      {trip.activities.length === 0 && (
        <div className="card planner-banner">
          <div>
            <strong>Want a head start?</strong>
            <p className="muted" style={{ margin: 0 }}>
              Get a full day-by-day plan suggested for you — then tweak it.
            </p>
          </div>
          <button className="btn" onClick={() => setPlanning(true)}>
            <AppIcon id="sparkles" size={15} /> Plan my days
          </button>
        </div>
      )}

      {trip.activities.length > 0 && (
        <div className="itinerary-toolbar">
          <span className="spacer" />
          <button className="btn secondary small" onClick={() => setPlanning(true)}>
            <AppIcon id="sparkles" size={14} /> Suggest more
          </button>
        </div>
      )}

      {Array.from({ length: dayCount }, (_, day) => {
        const activities = sortActivities(byDay.get(day) ?? []);
        return (
          <section key={day} className="day-block">
            <div className="day-head">
              <h3>Day {day + 1}</h3>
              <span className="day-date">{formatDayLabel(dateOfDay(trip.startDate, day))}</span>
            </div>
            {activities.map((a) => {
              const cat = categoryOf(a.category);
              return (
                <div key={a.id} className="activity">
                  <span className="act-icon" aria-hidden>
                    <AppIcon id={cat?.icon ?? "pin"} size={19} />
                  </span>
                  <div className="act-body">
                    <div className="act-title">{a.title}</div>
                    <div className="act-meta">
                      {a.time && <span className="act-time">{a.time}</span>}
                      <span>{cat?.label}</span>
                    </div>
                    {a.notes && <div className="act-notes">{a.notes}</div>}
                  </div>
                  <button className="icon-btn" aria-label={`Edit ${a.title}`} onClick={() => setEditing(a)}>
                    <AppIcon id="pencil" size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={`Delete ${a.title}`}
                    onClick={() => dispatch({ type: "activity/delete", tripId: trip.id, id: a.id })}
                  >
                    <AppIcon id="trash" size={16} />
                  </button>
                </div>
              );
            })}
            <button className="add-inline" onClick={() => setAdding(day)}>
              + Add plan for day {day + 1}
            </button>
          </section>
        );
      })}

      {adding !== null && (
        <Modal title="Add to itinerary" onClose={() => setAdding(null)}>
          <ActivityForm
            dayCount={dayCount}
            startDate={trip.startDate}
            initial={{ dayIndex: adding }}
            submitLabel="Add to itinerary"
            onCancel={() => setAdding(null)}
            onSubmit={(data) => {
              dispatch({ type: "activity/add", tripId: trip.id, activity: data });
              setAdding(null);
            }}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit plan" onClose={() => setEditing(null)}>
          <ActivityForm
            dayCount={dayCount}
            startDate={trip.startDate}
            initial={editing}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              dispatch({ type: "activity/update", tripId: trip.id, id: editing.id, patch: data });
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {planning && <PlannerModal trip={trip} onClose={() => setPlanning(false)} />}
    </>
  );
}
