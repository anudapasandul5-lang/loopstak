import { PRICES, formatAmount, spokenPrice, type PriceKey } from "@/lib/prices";

/**
 * Both price lists are in the HTML; CSS shows the one picked in <html data-list>.
 * So pages stay static and the right price is there at first paint, with or without JS.
 * Each character is its own span so a list switch can roll the digits in, one after another
 * (after SmoothUI's Price Flow, MIT; the roll is pure CSS, see .price-amt .ch).
 */
export function Price({ id, unit = true }: { id: PriceKey; unit?: boolean }) {
  const p = PRICES[id];
  return (
    <>
      {(["lkr", "usd"] as const).map((list) => (
        <span key={list} className={`price p-${list}`}>
          <span className="sr-only">{spokenPrice(p[list])}</span>
          <span aria-hidden="true">
            <span className="price-amt">
              {[...formatAmount(p[list])].map((ch, i) => (
                <span key={i} className="ch" style={{ "--i": i } as React.CSSProperties}>
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </span>
            {unit && <span className="price-unit">{p[list].unit}</span>}
          </span>
        </span>
      ))}
    </>
  );
}

/** A note that only applies to one list, e.g. transport outside Colombo. */
export function PriceNote({ id }: { id: PriceKey }) {
  const p = PRICES[id];
  return (
    <>
      {(["lkr", "usd"] as const).map((list) =>
        p[list].note ? (
          <span key={list} className={`p-${list}`}>
            {p[list].note}
          </span>
        ) : null,
      )}
    </>
  );
}
