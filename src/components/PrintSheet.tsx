import { CUSTOM } from "../lib/catalogue";
import type { FillLine, LineItem, Project, RoomOrder } from "../lib/types";

function sizeLabel(size: string, customSize: string): string {
  if (size === CUSTOM) return customSize.trim() || "Custom";
  return size;
}

function LineRows({
  title,
  lines,
}: {
  title: string;
  lines: { qty: number | string; detail: string }[];
}) {
  if (!lines.length) return null;
  return (
    <div className="print-group">
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th className="qty">Qty</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={`${title}-${i}`}>
              <td className="qty">{line.qty}</td>
              <td>{line.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function itemRows(items: LineItem[]) {
  return items
    .filter((l) => l.qty > 0)
    .map((l) => ({
      qty: l.qty,
      detail: sizeLabel(l.size, l.customSize),
    }));
}

function fillRows(items: FillLine[]) {
  return items
    .filter((l) => l.qty > 0)
    .map((l) => ({
      qty: l.qty,
      detail: `${l.fill === "down" ? "Down" : "Synthetic"} · ${sizeLabel(l.size, l.customSize)}`,
    }));
}

function RoomSheet({ room }: { room: RoomOrder }) {
  const options: { qty: number | string; detail: string }[] = [];
  if (room.mattressProtector && room.mattressProtectorQty > 0) {
    options.push({ qty: room.mattressProtectorQty, detail: "Mattress protector" });
  }
  if (room.pillowProtector && room.pillowProtectorQty > 0) {
    options.push({ qty: room.pillowProtectorQty, detail: "Pillow protector" });
  }

  return (
    <section className="print-room">
      <header className="print-room-head">
        <h3>{room.name || "Room"}</h3>
        {room.style.trim() ? <p className="print-style">Style: {room.style.trim()}</p> : null}
      </header>

      <LineRows
        title="Bed"
        lines={[
          {
            qty: room.bedQty,
            detail: sizeLabel(room.bedSize, room.customBedSize),
          },
        ]}
      />
      <LineRows title="Pillow cases" lines={itemRows(room.pillowCases)} />
      <LineRows title="Fitted sheets" lines={itemRows(room.fittedSheets)} />
      <LineRows title="Duvet covers" lines={itemRows(room.duvets)} />
      <LineRows title="Pillow fills" lines={fillRows(room.pillowFills)} />
      <LineRows title="Duvet fills" lines={fillRows(room.duvetFills)} />
      <LineRows title="Options" lines={options} />

      {room.notes.trim() ? (
        <div className="print-notes">
          <h4>Room notes</h4>
          <p>{room.notes.trim()}</p>
        </div>
      ) : null}
    </section>
  );
}

type Props = { project: Project };

export function PrintSheet({ project }: Props) {
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="print-sheet print-only" aria-hidden="true">
      <header className="print-top">
        <p className="print-brand">RAPP COLLECTIONS</p>
        <h1>Order form</h1>
        <div className="print-meta">
          <p>
            <span>Project</span>
            <strong>{project.name.trim() || "________________"}</strong>
          </p>
          <p>
            <span>Date</span>
            <strong>{date}</strong>
          </p>
        </div>
      </header>

      {project.rooms.map((room) => (
        <RoomSheet key={room.id} room={room} />
      ))}

      <section className="print-room">
        <h3>Additional notes</h3>
        <p className="print-notes-body">
          {project.notes.trim() || "________________________________________________"}
        </p>
      </section>

      <footer className="print-sign">
        <div>
          <p>Client signature</p>
          <div className="sign-line" />
        </div>
        <div>
          <p>Date</p>
          <div className="sign-line" />
        </div>
      </footer>
    </div>
  );
}
