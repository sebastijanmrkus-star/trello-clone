import { LABEL_COLORS, type Label } from "@/lib/types";

export function LabelChip({ label, compact }: { label: Label; compact?: boolean }) {
  const bg = LABEL_COLORS[label.color] ?? label.color;
  if (compact) {
    return (
      <span
        title={label.name || label.color}
        className="inline-block h-2 w-10 rounded-full"
        style={{ background: bg }}
      />
    );
  }
  return (
    <span
      className="inline-flex h-7 min-w-12 items-center rounded px-2.5 text-xs font-semibold text-gray-900"
      style={{ background: bg }}
    >
      {label.name}
    </span>
  );
}
