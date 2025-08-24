export default function BigButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        width: "100%", padding: "14px 16px", fontSize: 18, borderRadius: 12,
        border: "1px solid #ccc", background: "#2563eb", color: "white",
        cursor: "pointer", ...("style" in props ? (props as any).style : {})
      }}
    />
  );
}
