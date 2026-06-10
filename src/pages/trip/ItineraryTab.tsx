import { useState, type FormEvent } from "react";
import { AppIcon } from "../../components/AppIcon";
import type { Activity, ActivityCategory, Trip } from "../../types";
import { ACTIVITY_CATEGORIES } from "../../types";
import { useAppDispatch } from "../../store/store";
import { dateOfDay, formatDayLabel, tripDayCount } from "../../lib/dates";
import { Modal } from "../../components/Modal";

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

interface ActivityFormProps {
  dayCount: number;
  initial?: Activity;
  initialDay: number;
  onSubmit: (data: Omit<Activity, "id">) => void;
  onCancel: () => void;
  startDate: string;
}

function ActivityForm({ dayCount, initial, initialDay, onSubmit, onCancel, startDate }: ActivityFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dayIndex, setDayIndex] = useState(initial?.dayIndex ?? initialDay);
  const [time, setTime] = useState(initial?.time ?? "");
  const [category, setCategory] = useState<ActivityCategory>(initial?.category ?? "sightseeing");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("What's the plan? Give it a title.");
      return;
    }
    onSubmit({ title: title.trim(), dayIndex, time, category, notes: notes.trim() });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="act-title">Activity</label>
        <input
          id="act-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Snorkeling at Johnny Cay"
          autoFocus
          maxLength={100}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="act-day">Day</label>
          <select id="act-day" value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))}>
            {Array.from({ length: dayCount }, (_, i) => (
              <option key={i} value={i}>
                Day {i + 1} · {formatDayLabel(dateOfDay(startDate, i))}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="act-time">Time (optional)</label>
          <input id="act-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="act-cat">Category</label>
        <select
          id="act-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as ActivityCategory)}
        >
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="act-notes">Notes (optional)</label>
        <textarea
          id="act-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Booking refs, addresses, what to bring…"
        />
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          {initial ? "Save changes" : "Add to itinerary"}
        </button>
      </div>
    </form>
  );
}

export function ItineraryTab({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState<number | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);

  const dayCount = tripDayCount(trip.startDate, trip.endDate);
  const byDay = new Map<number, Activity[]>();
  for (const a of trip.activities) {
    byDay.set(a.dayIndex, [...(byDay.get(a.dayIndex) ?? []), a]);
  }

  return (
    <>
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
                    <AppIcon id={cat?.icon ?? "pin"} size={22} />
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
            initialDay={adding}
            startDate={trip.startDate}
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
            initial={editing}
            initialDay={editing.dayIndex}
            startDate={trip.startDate}
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              dispatch({ type: "activity/update", tripId: trip.id, id: editing.id, patch: data });
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
