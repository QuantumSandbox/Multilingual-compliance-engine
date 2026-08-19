import { useState } from "react";

export default function Tooltip({ label, children, side = "top" }) {
  const [show, setShow] = useState(false);
  const pos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-sm bg-bg-tertiary px-3 py-2 text-sm text-text-secondary shadow-md animate-fade-in ${pos}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
