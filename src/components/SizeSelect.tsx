import { CUSTOM } from "../lib/catalogue";

type Props = {
  label: string;
  options: readonly string[];
  value: string;
  customValue: string;
  onChange: (v: string) => void;
  onCustomChange: (v: string) => void;
};

export function SizeSelect({
  label,
  options,
  value,
  customValue,
  onChange,
  onCustomChange,
}: Props) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
        <option value={CUSTOM}>Custom…</option>
      </select>
      {value === CUSTOM && (
        <input
          type="text"
          placeholder="Custom size"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      )}
    </label>
  );
}
