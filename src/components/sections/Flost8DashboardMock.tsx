import styles from "./CaseStudy.module.css";

/**
 * Code-drawn illustration of a booking dashboard. Every name, venue and date is made up on purpose:
 * no real people, phones, fees or venues, and no amounts at all.
 */
const ROWS = [
  { artist: "Sample Artist A", venue: "Demo Venue 1", date: "Sat 14 Mar", status: "Confirmed" },
  { artist: "Sample Artist B", venue: "Demo Venue 2", date: "Fri 20 Mar", status: "Pending" },
  { artist: "Sample Artist C", venue: "Demo Venue 3", date: "Sat 28 Mar", status: "Confirmed" },
  { artist: "Sample Artist D", venue: "Demo Venue 1", date: "Fri 3 Apr", status: "Pending" },
  { artist: "Sample Artist E", venue: "Demo Venue 4", date: "Sat 11 Apr", status: "Confirmed" },
  { artist: "Sample Artist F", venue: "Demo Venue 2", date: "Sat 18 Apr", status: "Pending" },
] as const;

export function Flost8DashboardMock() {
  return (
    <figure className={styles.mock}>
      <div className={styles.frame} aria-hidden="true">
        <div className={styles.screen}>
          <div className={styles.bar}>
            <span className={styles.barTitle}>Bookings</span>
            <span className={styles.barMeta}>6 requests</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artist</th>
                <th className={styles.venue}>Venue</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.artist}>
                  <td>{r.artist}</td>
                  <td className={styles.venue}>{r.venue}</td>
                  <td>{r.date}</td>
                  <td>
                    <span className={r.status === "Confirmed" ? styles.confirmed : styles.pending}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <span className="sr-only">Illustration of a booking dashboard with made-up data</span>
      <figcaption className={styles.caption} aria-hidden="true">
        Made-up data for illustration.
      </figcaption>
    </figure>
  );
}
