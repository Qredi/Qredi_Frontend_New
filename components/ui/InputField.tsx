"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { InputHTMLAttributes, useState } from "react";

interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  type?: "text" | "email" | "password" | "number";
  error?: string;
}

export function InputField({
  label,
  type = "text",
  error,
  className = "",
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="mb-2 block text-base font-semibold text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`
            h-14 w-full
            rounded-xl
            border border-border
            bg-surface
            px-4
            text-base text-foreground
            outline-none
            transition-all duration-200
            placeholder:text-muted/80
            focus:border-primary
            focus:ring-2 focus:ring-primary/15
            disabled:cursor-not-allowed
            disabled:opacity-60
            ${isPassword ? "pr-12" : ""}
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/15" : ""}
            ${className}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="
              absolute right-3 top-1/2
              flex h-9 w-9
              -translate-y-1/2
              items-center justify-center
              rounded-full
              text-muted
              transition-colors duration-200
              hover:bg-background
              hover:text-foreground
            "
          >
            {showPassword ? (
              <EyeSlash size={20} weight="regular" />
            ) : (
              <Eye size={20} weight="regular" />
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
