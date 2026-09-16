/**
 * Blank print-only order form — circle sizes, write in the rest.
 * Not tied to filled digital data.
 */

const BED_CIRCLES = [
  'Twin 38"',
  '48"',
  'Full 54"',
  'Queen 60"',
  'King 76"',
  "90×190",
  "90×200",
  "100×200",
  "120×200",
  "140×200",
  "160×200",
  "180×200",
  "200×200",
] as const;

const FITTED_CIRCLES = [
  'Twin 38"',
  '48"',
  'Full 54"',
  'Queen 60"',
  'King 76"',
  "90×190",
  "100×200",
  "120×200",
  "140×200",
  "160×200",
  "180×200",
] as const;

const PILLOW_CIRCLES = [
  '50×70 (20×26")',
  '66×66 (26×26")',
  '30×51 (12×20")',
  "50×80",
  "60×90",
] as const;

const DUVET_CIRCLES = [
  "Queen 240×230",
  "King 270×240",
  "140×200",
  "150×200",
  "160×200",
  "200×220",
  "240×220",
] as const;

function BlankLine({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <div className={`blank-field ${wide ? "wide" : ""}`}>
      <span className="blank-label">{label}</span>
      <span className="blank-line" />
    </div>
  );
}

function CircleRow({
  title,
  options,
  showQty,
}: {
  title: string;
  options: readonly string[];
  showQty?: boolean;
}) {
  return (
    <div className="circle-block">
      <div className="circle-head">
        <h4>{title}</h4>
        {showQty ? (
          <span className="qty-blank">
            Qty <span className="mini-box" />
          </span>
        ) : null}
      </div>
      <p className="circle-hint">Circle size</p>
      <div className="circle-row">
        {options.map((opt) => (
          <span key={opt} className="size-circle">
            {opt}
          </span>
        ))}
        <span className="size-circle other">Other ________</span>
      </div>
    </div>
  );
}

function BlankRoom({ index }: { index: number }) {
  return (
    <section className="blank-room">
      <header className="blank-room-head">
        <h3>
          Room {index}
          <span className="name-blank">Name ________________________</span>
        </h3>
      </header>

      <div className="blank-fields">
        <BlankLine label="Style" />
        <BlankLine label="Color" />
        <BlankLine label="Thread" />
      </div>

      <CircleRow title="Bed size" options={BED_CIRCLES} showQty />
      <CircleRow title="Pillow cases" options={PILLOW_CIRCLES} showQty />
      <CircleRow title="Fitted sheet" options={FITTED_CIRCLES} showQty />
      <CircleRow title="Duvet cover" options={DUVET_CIRCLES} showQty />

      <div className="blank-fields types">
        <BlankLine label="Type of pillow" wide />
        <BlankLine label="Type of duvet" wide />
      </div>

      <div className="blank-checks">
        <span className="check-box">☐ Mattress protector &nbsp; Qty ____</span>
        <span className="check-box">☐ Pillow protector &nbsp; Qty ____</span>
      </div>

      <div className="blank-notes">
        <span className="blank-label">Notes</span>
        <div className="notes-lines">
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

type Props = {
  /** How many blank room blocks to print */
  roomCount?: number;
};

export function BlankPrintForm({ roomCount = 2 }: Props) {
  const rooms = Array.from({ length: Math.max(1, roomCount) }, (_, i) => i + 1);

  return (
    <div className="print-sheet blank-print print-only" aria-hidden="true">
      <header className="print-top blank-top">
        <p className="print-brand">RAPP COLLECTIONS</p>
        <h1>Order form</h1>
        <p className="circle-instruction">Circle sizes · Fill in blanks</p>
        <div className="print-meta blank-meta">
          <BlankLine label="Project" wide />
          <BlankLine label="Date" />
          <BlankLine label="Client" wide />
        </div>
      </header>

      {rooms.map((n) => (
        <BlankRoom key={n} index={n} />
      ))}

      <section className="blank-room">
        <h3>Additional notes</h3>
        <div className="notes-lines tall">
          <span />
          <span />
          <span />
        </div>
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
