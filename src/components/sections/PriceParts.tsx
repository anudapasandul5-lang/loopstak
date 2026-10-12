import { HOME } from "@/content/copy";
import { formatPrice } from "@/lib/prices";
import type { PriceEntry, PriceListId } from "@/lib/prices";
import styles from "./Prices.module.css";

const LISTS: PriceListId[] = ["LKR", "USD"];

/** LKR / USD segmented toggle. Shared by the home Prices tabs and the Service pages. */
export function PriceToggle({ list, onChoose }: { list: PriceListId; onChoose: (l: PriceListId) => void }) {
  return (
    <>
      <div className={styles.toggle} role="group" aria-label={HOME.prices.toggleLabel}>
        <span className={styles.toggleLabel} aria-hidden="true">
          {HOME.prices.toggleLabel}
        </span>
        {LISTS.map((l) => (
          <button key={l} type="button" aria-pressed={list === l} onClick={() => onChoose(l)}>
            {l}
          </button>
        ))}
      </div>
      <p className={styles.note}>{HOME.prices.currencyNote}</p>
    </>
  );
}

function PriceItems({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className={styles.listTitle}>{title}</h4>
      <ul className={styles.list}>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function PriceFigure({ entry }: { entry: PriceEntry }) {
  return (
    <p className={styles.figure}>
      <span className={styles.amount}>{formatPrice(entry)}</span>
      <span className={styles.unit}>{entry.unit}</span>
    </p>
  );
}

/** One price entry in full: amount, unit, note, included, not included, optional add-on. */
export function PriceBody({ entry }: { entry: PriceEntry }) {
  return (
    <>
      <PriceFigure entry={entry} />
      {entry.note && <p className={styles.noteLine}>{entry.note}</p>}
      <div className={styles.lists}>
        <PriceItems title="Included" items={entry.included} />
        <PriceItems title="Not included" items={entry.excluded} />
      </div>
      {entry.addOn && (
        <div className={styles.addOn}>
          <h3 className={styles.addOnName}>Optional add-on: {entry.addOn.name}</h3>
          <PriceFigure entry={entry.addOn} />
          <PriceItems title="Included" items={entry.addOn.included} />
        </div>
      )}
    </>
  );
}
