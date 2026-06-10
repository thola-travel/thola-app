import { useState, type FormEvent } from "react";
import { AppIcon } from "../../components/AppIcon";
import type { Trip } from "../../types";
import { useAppDispatch } from "../../store/store";
import { PACKING_TEMPLATES } from "../../data/packing";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";

export function PackingTab({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [newItem, setNewItem] = useState("");

  const packed = trip.packing.filter((p) => p.packed).length;
  const total = trip.packing.length;
  const pct = total > 0 ? (packed / total) * 100 : 0;

  function addItem(e: FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    dispatch({ type: "packing/add", tripId: trip.id, labels: [newItem] });
    setNewItem("");
  }

  return (
    <>
      {total > 0 && (
        <>
          <div className="pack-progress-label">
            <span>
              {packed} of {total} packed
            </span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </>
      )}

      <form className="pack-add-row" onSubmit={addItem}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item…"
          aria-label="New packing item"
          maxLength={80}
        />
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <div className="chip-row" style={{ marginBottom: 16 }}>
        {PACKING_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            className="chip-btn"
            onClick={() => {
              dispatch({ type: "packing/add", tripId: trip.id, labels: tpl.items });
              toast(`${tpl.label} items added`);
            }}
          >
            <AppIcon id={tpl.icon} size={15} /> {tpl.label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<AppIcon id="backpack" size={52} />}
          title="Pack light, pack right"
          body="Add items one by one, or tap a template above to start from a smart list."
        />
      ) : (
        <>
          {trip.packing.map((item) => (
            <div key={item.id} className={`pack-item ${item.packed ? "packed" : ""}`}>
              <label>
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => dispatch({ type: "packing/toggle", tripId: trip.id, id: item.id })}
                />
                <span>{item.label}</span>
              </label>
              <button
                className="icon-btn"
                aria-label={`Remove ${item.label}`}
                onClick={() => dispatch({ type: "packing/delete", tripId: trip.id, id: item.id })}
              >
                <AppIcon id="trash" size={16} />
              </button>
            </div>
          ))}
          {packed > 0 && (
            <button
              className="btn ghost small"
              style={{ marginTop: 8 }}
              onClick={() => dispatch({ type: "packing/clearPacked", tripId: trip.id })}
            >
              Reset all to unpacked
            </button>
          )}
        </>
      )}
    </>
  );
}
