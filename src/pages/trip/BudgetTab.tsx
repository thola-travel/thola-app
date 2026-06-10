import { useState, type FormEvent } from "react";
import { CreditCard, Plus, Trash2, Wallet } from "lucide-react";
import type { ExpenseCategory, Trip } from "../../types";
import { EXPENSE_CATEGORIES } from "../../types";
import { useAppDispatch } from "../../store/store";
import { formatMoney, parseAmount, totalExpenses } from "../../lib/money";
import { Modal } from "../../components/Modal";
import { EmptyState } from "../../components/EmptyState";

function AddExpenseForm({
  trip,
  onDone,
}: {
  trip: Trip;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [label, setLabel] = useState("");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = parseAmount(amountText);
    if (!label.trim()) {
      setError("What did you spend on?");
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    dispatch({
      type: "expense/add",
      tripId: trip.id,
      expense: { label: label.trim(), amount, category },
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="exp-label">Expense</label>
        <input
          id="exp-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Hotel Casablanca, 5 nights"
          autoFocus
          maxLength={80}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="exp-amount">Amount ({trip.currency})</label>
          <input
            id="exp-amount"
            inputMode="decimal"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label htmlFor="exp-cat">Category</label>
          <select
            id="exp-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Add expense
        </button>
      </div>
    </form>
  );
}

export function BudgetTab({ trip }: { trip: Trip }) {
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState(false);

  const spent = totalExpenses(trip.expenses);
  const remaining = trip.budget - spent;
  const pct = trip.budget > 0 ? Math.min(100, (spent / trip.budget) * 100) : 0;
  const fillClass = trip.budget > 0 && spent > trip.budget ? "over" : pct > 85 ? "warn" : "";

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: totalExpenses(trip.expenses.filter((e) => e.category === cat.value)),
  })).filter((c) => c.total > 0);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.total));

  return (
    <>
      <div className="budget-summary">
        <div className="stat">
          <div className="stat-label">Budget</div>
          <div className="stat-value">
            {trip.budget > 0 ? formatMoney(trip.budget, trip.currency) : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Spent</div>
          <div className="stat-value">{formatMoney(spent, trip.currency)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">{remaining < 0 ? "Over by" : "Left"}</div>
          <div className={`stat-value ${remaining < 0 ? "over" : ""}`}>
            {trip.budget > 0 ? formatMoney(Math.abs(remaining), trip.currency) : "—"}
          </div>
        </div>
      </div>

      {trip.budget > 0 && (
        <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className={`progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="page-head">
        <h2 className="section-label" style={{ margin: 0 }}>
          Expenses
        </h2>
        <span className="spacer" />
        <button className="btn small" onClick={() => setAdding(true)}>
          <Plus size={15} aria-hidden /> Add expense
        </button>
      </div>

      {trip.expenses.length === 0 ? (
        <EmptyState
          icon={<Wallet size={44} strokeWidth={1.5} />}
          title="Nothing logged yet"
          body="Track bookings and on-the-ground spending to stay inside your budget."
        />
      ) : (
        <>
          {trip.expenses.map((e) => {
            const cat = EXPENSE_CATEGORIES.find((c) => c.value === e.category);
            const CatIcon = cat?.Icon ?? CreditCard;
            return (
              <div key={e.id} className="expense-row">
                <span className="exp-icon" aria-hidden>
                  <CatIcon size={18} />
                </span>
                <div className="exp-label">
                  {e.label}
                  <div className="exp-cat">{cat?.label}</div>
                </div>
                <span className="exp-amount">{formatMoney(e.amount, trip.currency)}</span>
                <button
                  className="icon-btn"
                  aria-label={`Delete ${e.label}`}
                  onClick={() => dispatch({ type: "expense/delete", tripId: trip.id, id: e.id })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {byCategory.length > 1 && (
            <>
              <h2 className="section-label">By category</h2>
              <div className="card cat-breakdown">
                {byCategory.map((c) => (
                  <div key={c.value} className="cat-line">
                    <span className="cat-name">
                      <c.Icon size={14} aria-hidden /> {c.label}
                    </span>
                    <div className="cat-bar">
                      <div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                    </div>
                    <span className="cat-amt">{formatMoney(c.total, trip.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {adding && (
        <Modal title="Add expense" onClose={() => setAdding(false)}>
          <AddExpenseForm trip={trip} onDone={() => setAdding(false)} />
        </Modal>
      )}
    </>
  );
}
