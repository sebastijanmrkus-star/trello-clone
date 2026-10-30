const COLORS = ["#1f845a", "#0c66e4", "#ae2e24", "#7f5f01", "#5e4db2", "#206a83", "#943d73", "#a54800"];

// Initials avatar with a colour that stays the same for each person.
export function Avatar({ email, size = "md", title }: { email: string; size?: "sm" | "md"; title?: string }) {
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const name = email.split("@")[0] ?? email;
  const initials = (name.match(/[a-z0-9]/gi) ?? ["?"]).slice(0, 2).join("").toUpperCase();
  return (
    <span
      title={title ?? email}
      style={{ background: COLORS[Math.abs(hash) % COLORS.length] }}
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
      }`}
    >
      {initials}
    </span>
  );
}
