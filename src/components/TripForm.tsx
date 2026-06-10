import { useState, type FormEvent } from "react";
import type { Trip } from "../types";
import { CURRENCIES } from "../types";
import type { TripDraft } from "../store/reducer";
import { isValidISODate, toISODate } from "../lib/dates";
import { parseAmount } from "../lib/money";
import { TRIP_ICON_CHOICES } from "../lib/icons";
import { Icon3D } from "./Icon3D";

interface TripFormProps {
  /** Existing trip to edit; omit to create a new one. */
  trip?: Trip;
  /** Prefill values when starting a trip from Explore. */
  prefill?: Partial<TripDraft>;
  submitLabel: string;
  onSubmit: (draft: TripDraft) => void;
  onCancel: () => void;
}

function defaultDates(): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() + 30);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  return { start: toISODate(start), end: toISODate(end) };
}

export function TripForm({ trip, prefill, submitLabel, onSubmit, onCancel }: TripFormProps) {
  const defaults = defaultDates();
  const [name, setName] = useState(trip?.name ?? prefill?.name ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? prefill?.destination ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? prefill?.startDate ?? defaults.start);
  const [endDate, setEndDate] = useState(trip?.endDate ?? prefill?.endDate ?? defaults.end);
  const [icon, setIcon] = useState(trip?.icon ?? prefill?.icon ?? "globe");
  const [budgetText, setBudgetText] = useState(
    trip && trip.budget > 0 ? String(trip.budget) : ""
  );
  const [currency, setCurrency] = useState(trip?.currency ?? prefill?.currency ?? "USD");
  const [notes, setNotes] = useState(trip?.notes ?? prefill?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give your trip a name.");
      return;
    }
    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
      setError("Pick valid start and end dates.");
      return;
    }
    if (endDate < startDate) {
      setError("The end date can't be before the start date.");
      return;
    }
    const budget = budgetText.trim() === "" ? 0 : parseAmount(budgetText);
    if (Number.isNaN(budget)) {
      setError("Budget must be a positive number (or leave it empty).");
      return;
    }
    onSubmit({
      name: trimmedName,
      destination: destination.trim(),
      startDate,
      endDate,
      icon,
      budget,
      currency,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="trip-name">Trip name</label>
        <input
          id="trip-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spring in Lisbon"
          autoFocus
          maxLength={80}
        />
      </div>
      <div className="field">
        <label htmlFor="trip-dest">Destination</label>
        <input
          id="trip-dest"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="City, country…"
          maxLength={80}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="trip-start">Start</label>
          <input
            id="trip-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="trip-end">End</label>
          <input
            id="trip-end"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="trip-budget">Budget (optional)</label>
          <input
            id="trip-budget"
            inputMode="decimal"
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            placeholder="e.g. 1900"
          />
        </div>
        <div className="field">
          <label htmlFor="trip-currency">Currency</label>
          <select id="trip-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Icon</label>
        <div className="chip-row" role="radiogroup" aria-label="Trip icon">
          {TRIP_ICON_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={icon === choice.id}
              aria-label={choice.label}
              title={choice.label}
              className={`chip-btn icon-chip ${icon === choice.id ? "selected" : ""}`}
              onClick={() => setIcon(choice.id)}
            >
              <Icon3D id={choice.id} size={22} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="trip-notes">Notes (optional)</label>
        <textarea
          id="trip-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Flight numbers, hotel address, reminders…"
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
