import {
  BED_SIZES,
  CUSTOM,
  DUVET_COVER_SIZES,
  DUVET_FILL_SIZES,
  FITTED_SHEET_SIZES,
  PILLOW_CASE_SIZES,
  PILLOW_FILL_SIZES,
} from "../lib/catalogue";
import {
  emptyFillLine,
  emptyLine,
  type ActiveFill,
  type FillLine,
  type LineItem,
  type RoomOrder,
} from "../lib/types";
import { SizeSelect } from "./SizeSelect";

type Props = {
  room: RoomOrder;
  onChange: (room: RoomOrder) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function RoomCard({ room, onChange, onRename, onRemove, canRemove }: Props) {
  const set = (patch: Partial<RoomOrder>) => onChange({ ...room, ...patch });

  const updateLines = (
    key: "pillowCases" | "fittedSheets" | "duvets",
    lines: LineItem[]
  ) => {
    const patch: Partial<RoomOrder> = { [key]: lines };
    if (key === "pillowCases" && lines[0]) {
      const prevFirst = room.pillowCases[0]?.size;
      const prevCustom = room.pillowCases[0]?.customSize;
      if (prevFirst && room.pillowFills.length) {
        patch.pillowFills = room.pillowFills.map((f) =>
          f.size === prevFirst && f.customSize === (prevCustom || "")
            ? { ...f, size: lines[0].size, customSize: lines[0].customSize }
            : f
        );
      }
    }
    if (key === "duvets" && lines[0]) {
      const prevFirst = room.duvets[0]?.size;
      const prevCustom = room.duvets[0]?.customSize;
      if (prevFirst && room.duvetFills.length) {
        patch.duvetFills = room.duvetFills.map((f) =>
          f.size === prevFirst && f.customSize === (prevCustom || "")
            ? { ...f, size: lines[0].size, customSize: lines[0].customSize }
            : f
        );
      }
    }
    set(patch);
  };

  const patchLine = (
    key: "pillowCases" | "fittedSheets" | "duvets",
    id: string,
    patch: Partial<LineItem>
  ) => {
    updateLines(
      key,
      room[key].map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const addLine = (
    key: "pillowCases" | "fittedSheets" | "duvets",
    defaultSize: string,
    defaultQty: number
  ) => {
    updateLines(key, [...room[key], emptyLine(defaultSize, defaultQty)]);
  };

  const removeLine = (key: "pillowCases" | "fittedSheets" | "duvets", id: string) => {
    const next = room[key].filter((l) => l.id !== id);
    if (!next.length) return;
    updateLines(key, next);
  };

  const patchFill = (
    key: "pillowFills" | "duvetFills",
    id: string,
    patch: Partial<FillLine>
  ) => {
    set({
      [key]: room[key].map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  };

  const addPillowFill = () => {
    const first = room.pillowCases[0];
    const line = emptyFillLine(first?.size || PILLOW_FILL_SIZES[0], 2);
    if (first?.customSize) line.customSize = first.customSize;
    set({ pillowFills: [...room.pillowFills, line] });
  };

  const addDuvetFill = () => {
    const first = room.duvets[0];
    const line = emptyFillLine(first?.size || DUVET_FILL_SIZES[0], 1);
    if (first?.customSize) line.customSize = first.customSize;
    set({ duvetFills: [...room.duvetFills, line] });
  };

  const removeFill = (key: "pillowFills" | "duvetFills", id: string) => {
    set({ [key]: room[key].filter((f) => f.id !== id) });
  };

  const totalPillowCaseQty = room.pillowCases.reduce((s, l) => s + l.qty, 0);

  return (
    <section className={`room-card ${room.open ? "open" : ""}`}>
      <header className="room-header">
        <button
          type="button"
          className="room-toggle"
          onClick={() => set({ open: !room.open })}
          aria-expanded={room.open}
        >
          {room.open ? "▾" : "▸"}
        </button>
        <input
          className="room-name"
          value={room.name}
          onChange={(e) => onRename(e.target.value)}
          aria-label="Room name"
        />
        {canRemove && (
          <button type="button" className="btn-text danger" onClick={onRemove}>
            Remove
          </button>
        )}
      </header>

      {room.open && (
        <div className="room-body">
          <label className="field">
            <span>Style / design</span>
            <input
              type="text"
              placeholder="e.g. Botero, Fancy, Bacchetta, Horizon"
              value={room.style}
              onChange={(e) => set({ style: e.target.value })}
            />
          </label>

          <div className="block">
            <h3>Bed</h3>
            <div className="row">
              <SizeSelect
                label="Bed size"
                options={BED_SIZES}
                value={room.bedSize}
                customValue={room.customBedSize}
                onChange={(v) => set({ bedSize: v })}
                onCustomChange={(v) => set({ customBedSize: v })}
              />
              <label className="field narrow">
                <span>Qty</span>
                <input
                  type="number"
                  min={1}
                  value={room.bedQty}
                  onChange={(e) => set({ bedQty: Math.max(1, Number(e.target.value) || 1) })}
                />
              </label>
            </div>
          </div>

          <LineListBlock
            title="Pillow cases"
            lines={room.pillowCases}
            sizes={PILLOW_CASE_SIZES}
            onPatch={(id, patch) => patchLine("pillowCases", id, patch)}
            onAdd={() =>
              addLine("pillowCases", room.pillowCases[0]?.size || PILLOW_CASE_SIZES[0], 2)
            }
            onRemove={(id) => removeLine("pillowCases", id)}
          />

          <LineListBlock
            title="Fitted sheets"
            lines={room.fittedSheets}
            sizes={FITTED_SHEET_SIZES}
            onPatch={(id, patch) => patchLine("fittedSheets", id, patch)}
            onAdd={() =>
              addLine(
                "fittedSheets",
                room.fittedSheets[0]?.size || FITTED_SHEET_SIZES[0],
                1
              )
            }
            onRemove={(id) => removeLine("fittedSheets", id)}
          />

          <LineListBlock
            title="Duvet covers"
            lines={room.duvets}
            sizes={DUVET_COVER_SIZES}
            onPatch={(id, patch) => patchLine("duvets", id, patch)}
            onAdd={() =>
              addLine("duvets", room.duvets[0]?.size || DUVET_COVER_SIZES[0], 1)
            }
            onRemove={(id) => removeLine("duvets", id)}
          />

          <FillListBlock
            title="Pillow fills"
            lines={room.pillowFills}
            sizes={PILLOW_FILL_SIZES}
            fallbackSize={room.pillowCases[0]?.size || PILLOW_FILL_SIZES[0]}
            onPatch={(id, patch) => patchFill("pillowFills", id, patch)}
            onAdd={addPillowFill}
            onRemove={(id) => removeFill("pillowFills", id)}
          />

          <FillListBlock
            title="Duvet fills"
            lines={room.duvetFills}
            sizes={DUVET_FILL_SIZES}
            fallbackSize={room.duvets[0]?.size || DUVET_FILL_SIZES[0]}
            onPatch={(id, patch) => patchFill("duvetFills", id, patch)}
            onAdd={addDuvetFill}
            onRemove={(id) => removeFill("duvetFills", id)}
          />

          <div className="block">
            <h3>Options</h3>
            <div className="row checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={room.mattressProtector}
                  onChange={(e) =>
                    set({
                      mattressProtector: e.target.checked,
                      mattressProtectorQty: e.target.checked
                        ? room.mattressProtectorQty || room.bedQty
                        : 0,
                    })
                  }
                />
                Mattress protector
              </label>
              {room.mattressProtector && (
                <label className="field narrow">
                  <span>Qty</span>
                  <input
                    type="number"
                    min={0}
                    value={room.mattressProtectorQty}
                    onChange={(e) =>
                      set({
                        mattressProtectorQty: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </label>
              )}
            </div>
            <div className="row checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={room.pillowProtector}
                  onChange={(e) =>
                    set({
                      pillowProtector: e.target.checked,
                      pillowProtectorQty: e.target.checked
                        ? room.pillowProtectorQty || totalPillowCaseQty
                        : 0,
                    })
                  }
                />
                Pillow protector
              </label>
              {room.pillowProtector && (
                <label className="field narrow">
                  <span>Qty</span>
                  <input
                    type="number"
                    min={0}
                    value={room.pillowProtectorQty}
                    onChange={(e) =>
                      set({
                        pillowProtectorQty: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </label>
              )}
            </div>
          </div>

          <label className="field">
            <span>Room notes</span>
            <textarea
              rows={2}
              value={room.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Special requests for this room…"
            />
          </label>
        </div>
      )}
    </section>
  );
}

function FillListBlock({
  title,
  lines,
  sizes,
  fallbackSize,
  onPatch,
  onAdd,
  onRemove,
}: {
  title: string;
  lines: FillLine[];
  sizes: readonly string[];
  fallbackSize: string;
  onPatch: (id: string, patch: Partial<FillLine>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const singular = title.toLowerCase().replace(/s$/, "");
  return (
    <div className="block">
      <div className="block-head">
        <h3>{title}</h3>
        <button type="button" className="btn-text" onClick={onAdd}>
          + Add {singular}
        </button>
      </div>
      {lines.length === 0 && (
        <p className="line-label" style={{ marginBottom: 0 }}>
          None — use + to add
        </p>
      )}
      {lines.map((line, index) => (
        <div key={line.id} className="line-row">
          <p className="line-label">
            #{index + 1}
            <button
              type="button"
              className="btn-text danger"
              onClick={() => onRemove(line.id)}
            >
              Remove
            </button>
          </p>
          <div className="row">
            <label className="field">
              <span>Fill</span>
              <select
                value={line.fill}
                onChange={(e) =>
                  onPatch(line.id, { fill: e.target.value as ActiveFill })
                }
              >
                <option value="synthetic">Synthetic</option>
                <option value="down">Down</option>
              </select>
            </label>
            <SizeSelect
              label="Size"
              options={sizes}
              value={
                line.size === CUSTOM ||
                (sizes as readonly string[]).includes(line.size)
                  ? line.size
                  : fallbackSize
              }
              customValue={line.customSize}
              onChange={(v) => onPatch(line.id, { size: v })}
              onCustomChange={(v) => onPatch(line.id, { customSize: v })}
            />
            <label className="field narrow">
              <span>Qty</span>
              <input
                type="number"
                min={0}
                value={line.qty}
                onChange={(e) =>
                  onPatch(line.id, {
                    qty: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function LineListBlock({
  title,
  lines,
  sizes,
  onPatch,
  onAdd,
  onRemove,
}: {
  title: string;
  lines: LineItem[];
  sizes: readonly string[];
  onPatch: (id: string, patch: Partial<LineItem>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="block">
      <div className="block-head">
        <h3>{title}</h3>
        <button type="button" className="btn-text" onClick={onAdd}>
          + Add {title.toLowerCase().replace(/s$/, "")}
        </button>
      </div>
      {lines.map((line, index) => (
        <div key={line.id} className="line-row">
          {lines.length > 1 && (
            <p className="line-label">
              #{index + 1}
              <button
                type="button"
                className="btn-text danger"
                onClick={() => onRemove(line.id)}
              >
                Remove
              </button>
            </p>
          )}
          <div className="row">
            <SizeSelect
              label="Size"
              options={sizes}
              value={
                sizes.includes(line.size as (typeof sizes)[number]) || line.size === CUSTOM
                  ? line.size
                  : sizes[0]
              }
              customValue={line.customSize}
              onChange={(v) => onPatch(line.id, { size: v })}
              onCustomChange={(v) => onPatch(line.id, { customSize: v })}
            />
            <label className="field narrow">
              <span>Qty</span>
              <input
                type="number"
                min={0}
                value={line.qty}
                onChange={(e) =>
                  onPatch(line.id, { qty: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
