export default function SearchBox({
  value,
  onChange,
  placeholder = "Cerca…",
  full = false,
}) {
  return (
    <div className={`relative ${full ? "w-full" : "min-w-[180px]"}`}>
      <svg
        viewBox="0 0 24 24"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-full bg-white/10 text-white border border-white/20 outline-none focus:ring-2 focus:ring-[#28c8ff]/40"
      />
    </div>
  );
}
