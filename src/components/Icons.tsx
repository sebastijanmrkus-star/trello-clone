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
export const DotsIcon = ({ className }: P) =>
  svg(className, <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>);
export const FilterIcon = ({ className }: P) => svg(className, <path d="M3 5h18l-7 8v6l-4 2v-8z" />);
export const TagIcon = ({ className }: P) =>
  svg(className, <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>);
export const CheckSquareIcon = ({ className }: P) =>
  svg(className, <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m8 12 3 3 5-6" /></>);
export const CalendarIcon = ({ className }: P) =>
  svg(className, <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
export const TextIcon = ({ className }: P) => svg(className, <path d="M4 6h16M4 12h16M4 18h10" />);
export const CommentIcon = ({ className }: P) =>
  svg(className, <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />);
export const ArchiveIcon = ({ className }: P) =>
  svg(className, <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>);
export const ArrowRightIcon = ({ className }: P) => svg(className, <path d="M5 12h14M13 6l6 6-6 6" />);
export const CopyIcon = ({ className }: P) =>
  svg(className, <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>);
export const TrashIcon = ({ className }: P) =>
  svg(className, <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />);
export const ImageIcon = ({ className }: P) =>
  svg(className, <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>);
export const PencilIcon = ({ className }: P) => svg(className, <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />);
export const MenuIcon = ({ className }: P) => svg(className, <path d="M4 6h16M4 12h16M4 18h16" />);
export const ChevronLeftIcon = ({ className }: P) => svg(className, <path d="m15 6-6 6 6 6" />);
export const ChevronRightIcon = ({ className }: P) => svg(className, <path d="m9 6 6 6-6 6" />);
export const CheckCircleIcon = ({ className, filled }: P & { filled?: boolean }) =>
  filled
    ? svg(className, <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m7.5 12.5 3 3 6-6.5" stroke="white" /></>)
    : svg(className, <><circle cx="12" cy="12" r="9.5" /><path d="m7.5 12.5 3 3 6-6.5" /></>);
