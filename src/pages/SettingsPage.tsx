import { useRef, useState } from "react";
import { AppIcon } from "../components/AppIcon";
import { useAppDispatch, useAppState } from "../store/store";
import { sanitizeState } from "../store/reducer";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";

export function SettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mizdon-travels-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  }

  async function importData(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const next = sanitizeState(parsed);
      if (!next) {
        toast("That file doesn't look like a MIzDon Travels backup.");
        return;
      }
      dispatch({ type: "state/import", state: next });
      toast(`Imported ${next.trips.length} ${next.trips.length === 1 ? "trip" : "trips"}`);
    } catch {
      toast("Couldn't read that file.");
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Your data lives on this device — you own it.</p>
        </div>
      </div>

      <div className="card settings-section">
        <h3><AppIcon id="floppy" size={19} /> Back up</h3>
        <p>Download all trips as a JSON file you can keep anywhere.</p>
        <button className="btn secondary" onClick={exportData}>
          Export data
        </button>
      </div>

      <div className="card settings-section">
        <h3><AppIcon id="inbox" size={19} /> Restore</h3>
        <p>Import a MIzDon Travels backup file. This replaces what's currently on this device.</p>
        <button className="btn secondary" onClick={() => fileInput.current?.click()}>
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importData(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="card settings-section">
        <h3><AppIcon id="broom" size={19} /> Start fresh</h3>
        <p>Delete all trips and data from this device.</p>
        <button className="btn danger" onClick={() => setConfirmingReset(true)}>
          Erase everything
        </button>
      </div>

      <p className="muted">
        MIzDon Travels is an offline-first travel planner. No account, no tracking — everything
        is stored locally in your browser. v1.0.0
      </p>

      {confirmingReset && (
        <Modal title="Erase everything?" onClose={() => setConfirmingReset(false)}>
          <p>
            All <strong>{state.trips.length}</strong>{" "}
            {state.trips.length === 1 ? "trip" : "trips"} will be permanently deleted from this
            device. Export a backup first if you might want them back.
          </p>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
            <button
              className="btn danger"
              onClick={() => {
                dispatch({ type: "state/import", state: { version: 1, trips: [] } });
                setConfirmingReset(false);
                toast("All data erased");
              }}
            >
              Erase everything
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
