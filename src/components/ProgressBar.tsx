export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width: "100%", height: 12, background: "#eee", borderRadius: 8 }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 8, background: "#2563eb" }} />
    </div>
  );
}
