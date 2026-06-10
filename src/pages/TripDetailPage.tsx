import { useState } from "react";
import { AppIcon } from "../components/AppIcon";
import { useAppDispatch, useAppState } from "../store/store";
import { daysUntil, formatRange, tripDayCount, tripPhase } from "../lib/dates";
import { Modal } from "../components/Modal";
import { TripForm } from "../components/TripForm";
import { EmptyState } from "../components/EmptyState";
import { ItineraryTab } from "./trip/ItineraryTab";
import { BudgetTab } from "./trip/BudgetTab";
import { PackingTab } from "./trip/PackingTab";
import { navigate, type TripTab } from "../lib/router";
import { useToast } from "../components/Toast";

export function TripDetailPage({ tripId, tab }: { tripId: string; tab: TripTab }) {
  const { trips } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <EmptyState
        icon={<AppIcon id="luggage" size={52} />}
        title="Trip not found"
        body="It may have been deleted on this device."
        action={
          <a className="btn" href="#/">
            Back to my trips
          </a>
        }
      />
    );
  }

  const phase = tripPhase(trip.startDate, trip.endDate);
  const days = tripDayCount(trip.startDate, trip.endDate);
  const until = daysUntil(trip.startDate);

  return (
    <>
      <div className="trip-hero">
        <div className="hero-row">
          <a className="back-link" href="#/">
            ← My trips
          </a>
          <span className="spacer" />
          <button className="btn secondary small" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn danger small" onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        </div>
        <h1>
          <AppIcon id={trip.icon} size={26} className="hero-icon" /> {trip.name}
        </h1>
        <p className="hero-sub">
          {trip.destination && (
            <>
              <AppIcon id="pin" size={13} /> {trip.destination} ·{" "}
            </>
          )}
          {formatRange(trip.startDate, trip.endDate)} · {days} {days === 1 ? "day" : "days"}
        </p>
        <div className="hero-row" style={{ marginTop: 10 }}>
          {phase === "upcoming" && (
            <span className="hero-badge amber">
              {until === 1 ? "Departs tomorrow!" : `${until} days to go`}
            </span>
          )}
          {phase === "active" && <span className="hero-badge amber">Happening now</span>}
          {phase === "past" && <span className="hero-badge">Trip complete</span>}
          {trip.notes && (
            <span className="hero-badge">
              <AppIcon id="memo" size={13} /> {trip.notes}
            </span>
          )}
        </div>
      </div>

      <nav className="tabs" aria-label="Trip sections">
        <a href={`#/trip/${trip.id}/itinerary`} className={tab === "itinerary" ? "active" : ""}>
          <AppIcon id="calendar" size={16} /> Itinerary
        </a>
        <a href={`#/trip/${trip.id}/budget`} className={tab === "budget" ? "active" : ""}>
          <AppIcon id="moneybag" size={16} /> Budget
        </a>
        <a href={`#/trip/${trip.id}/packing`} className={tab === "packing" ? "active" : ""}>
          <AppIcon id="backpack" size={16} /> Packing
        </a>
      </nav>

      {tab === "itinerary" && <ItineraryTab trip={trip} />}
      {tab === "budget" && <BudgetTab trip={trip} />}
      {tab === "packing" && <PackingTab trip={trip} />}

      {editing && (
        <Modal title="Edit trip" onClose={() => setEditing(false)}>
          <TripForm
            trip={trip}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={(draft) => {
              dispatch({ type: "trip/update", id: trip.id, patch: draft });
              setEditing(false);
              toast("Trip updated");
            }}
          />
        </Modal>
      )}

      {confirmingDelete && (
        <Modal title="Delete this trip?" onClose={() => setConfirmingDelete(false)}>
          <p>
            <strong>{trip.name}</strong> and all of its plans, expenses, and packing items will be
            removed. This can't be undone.
          </p>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setConfirmingDelete(false)}>
              Keep it
            </button>
            <button
              className="btn danger"
              onClick={() => {
                dispatch({ type: "trip/delete", id: trip.id });
                toast("Trip deleted");
                navigate({ page: "trips" });
              }}
            >
              Delete trip
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
