import { useState } from "react";
import { CalendarDays, Compass, CreditCard, MapPin, Plane, Plus } from "lucide-react";
import type { Trip } from "../types";
import { useAppDispatch, useAppState } from "../store/store";
import { daysUntil, formatRange, tripDayCount, tripPhase } from "../lib/dates";
import { formatMoney, totalExpenses } from "../lib/money";
import { Modal } from "../components/Modal";
import { TripForm } from "../components/TripForm";
import { EmptyState } from "../components/EmptyState";
import { PACKING_ESSENTIALS } from "../data/packing";
import { navigate } from "../lib/router";
import { useToast } from "../components/Toast";
import { uid } from "../lib/id";
import { getIcon } from "../lib/icons";

function countdownChip(trip: Trip) {
  const phase = tripPhase(trip.startDate, trip.endDate);
  if (phase === "active")
    return (
      <span className="chip amber">
        <Plane size={13} aria-hidden /> Happening now
      </span>
    );
  if (phase === "past") return <span className="chip">Done & dusted</span>;
  const days = daysUntil(trip.startDate);
  return <span className="chip teal">{days === 1 ? "Tomorrow!" : `In ${days} days`}</span>;
}

function TripCard({ trip }: { trip: Trip }) {
  const days = tripDayCount(trip.startDate, trip.endDate);
  const spent = totalExpenses(trip.expenses);
  const Icon = getIcon(trip.icon);
  return (
    <a className="trip-card" href={`#/trip/${trip.id}/itinerary`}>
      <div className="trip-card-top">
        <span className="trip-emoji" aria-hidden>
          <Icon size={26} />
        </span>
        <div>
          <h3>{trip.name}</h3>
          {trip.destination && (
            <p className="dest">
              <MapPin size={13} aria-hidden /> {trip.destination}
            </p>
          )}
          <p className="dest">
            {formatRange(trip.startDate, trip.endDate)} · {days} {days === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
      <div className="trip-card-meta">
        {countdownChip(trip)}
        {trip.activities.length > 0 && (
          <span className="chip">
            <CalendarDays size={13} aria-hidden /> {trip.activities.length}{" "}
            {trip.activities.length === 1 ? "plan" : "plans"}
          </span>
        )}
        {spent > 0 && (
          <span className="chip">
            <CreditCard size={13} aria-hidden /> {formatMoney(spent, trip.currency)} spent
          </span>
        )}
      </div>
    </a>
  );
}

export function TripsPage() {
  const { trips } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const upcoming = trips.filter((t) => tripPhase(t.startDate, t.endDate) !== "past");
  const past = trips.filter((t) => tripPhase(t.startDate, t.endDate) === "past").reverse();

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My trips</h1>
          <p className="page-sub">Everything you're planning, in one place.</p>
        </div>
        <span className="spacer" />
        <button className="btn" onClick={() => setCreating(true)}>
          <Plus size={16} aria-hidden /> New trip
        </button>
      </div>

      {trips.length === 0 && (
        <EmptyState
          icon={<Compass size={44} strokeWidth={1.5} />}
          title="No trips yet"
          body="Thola means “discover” in isiZulu. Start planning your first adventure."
          action={
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn" onClick={() => setCreating(true)}>
                Plan a trip
              </button>
              <a className="btn secondary" href="#/explore">
                Get inspired
              </a>
            </div>
          }
        />
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="section-label">Upcoming</h2>
          <div className="trip-grid">
            {upcoming.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-label">Past trips</h2>
          <div className="trip-grid">
            {past.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </>
      )}

      {creating && (
        <Modal title="New trip" onClose={() => setCreating(false)}>
          <TripForm
            submitLabel="Create trip"
            onCancel={() => setCreating(false)}
            onSubmit={(draft) => {
              const id = uid();
              dispatch({ type: "trip/add", draft, id, packing: PACKING_ESSENTIALS });
              setCreating(false);
              toast("Trip created — let's plan it!");
              navigate({ page: "trip", tripId: id, tab: "itinerary" });
            }}
          />
        </Modal>
      )}
    </>
  );
}
