// The Active Tasks mark: a check mark over two task lines on a blue tile.
export function LogoMark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-md bg-[#0c66e4] text-white ${
        size === "lg" ? "h-8 w-8" : "h-6 w-6"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "lg" ? "h-5 w-5" : "h-4 w-4"}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 7.5l2.5 2.5L11 5.5" />
        <path d="M14 8h6M4 15h16M4 20h10" />
      </svg>
    </span>
  );
}

export const APP_NAME = "Active Tasks";
