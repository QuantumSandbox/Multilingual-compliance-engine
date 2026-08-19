import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, helper, error, className = "", id, leftIcon, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={`input-base ${leftIcon ? "pl-9" : ""} ${
            error ? "border-accent-danger focus:border-accent-danger" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-xs text-accent-danger">{error}</span>
      ) : helper ? (
        <span className="text-xs text-text-muted">{helper}</span>
      ) : null}
    </div>
  );
});

export default Input;
