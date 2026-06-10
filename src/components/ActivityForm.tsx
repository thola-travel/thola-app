import { useState, type FormEvent } from "react";
import type { Activity, ActivityCategory } from "../types";
import { ACTIVITY_CATEGORIES } from "../types";
import { dateOfDay, formatDayLabel } from "../lib/dates";

interface ActivityFormProps {
  dayCount: number;
  startDate: string;
  initial?: Partial<Omit<Activity, "id">>;
  submitLabel: string;
  onSubmit: (data: Omit<Activity, "id">) => void;
  onCancel: () => void;
}

export function ActivityForm({
  dayCount,
  startDate,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dayIndex, setDayIndex] = useState(initial?.dayIndex ?? 0);
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
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
