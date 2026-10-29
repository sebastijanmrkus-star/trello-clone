type P = { className?: string };
const base = "h-4 w-4 shrink-0";
const svg = (className: string | undefined, children: React.ReactNode, filled = false) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? base}
    aria-hidden
  >
    {children}
  </svg>
);

export const BoardsIcon = ({ className }: P) =>
  svg(className, <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v10" /></>);
export const TemplateIcon = ({ className }: P) =>
  svg(className, <><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M18 2v6M15 5h6" /></>);
export const SearchIcon = ({ className }: P) => svg(className, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const StarIcon = ({ className, filled }: P & { filled?: boolean }) =>
  svg(className, <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />, filled);
export const ClockIcon = ({ className }: P) => svg(className, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const CloseIcon = ({ className }: P) => svg(className, <path d="M6 6l12 12M18 6 6 18" />);
export const ChevronDownIcon = ({ className }: P) => svg(className, <path d="m6 9 6 6 6-6" />);
export const PlusIcon = ({ className }: P) => svg(className, <path d="M12 5v14M5 12h14" />);
