export default function Logo({ size = 32, showText = true, textClass = '' }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background square */}
        <rect width="40" height="40" rx="10" fill="#3B6FE8" />

        {/* Notepad lines — the "Note" part */}
        <rect x="10" y="13" width="14" height="2.5" rx="1.25" fill="white" opacity="0.9" />
        <rect x="10" y="18.5" width="20" height="2.5" rx="1.25" fill="white" opacity="0.9" />
        <rect x="10" y="24" width="10" height="2.5" rx="1.25" fill="white" opacity="0.9" />

        {/* Circuit dot — the "Tech" part */}
        <circle cx="28" cy="26.5" r="3" fill="white" />
        <rect x="25" y="25.75" width="6" height="1.5" rx="0.75" fill="#3B6FE8" />
        <rect x="27.25" y="23.5" width="1.5" height="6" rx="0.75" fill="#3B6FE8" />
      </svg>

      {/* Word mark */}
      {showText && (
        <span className={`font-bold text-gray-900 ${textClass}`}>
          Tech<span className="text-primary">Note</span>
        </span>
      )}
    </div>
  );
}
