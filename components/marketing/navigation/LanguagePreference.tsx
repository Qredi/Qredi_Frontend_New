"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CaretDown, Globe } from "@phosphor-icons/react";

interface LanguagePreferenceProps {
  defaultMode: boolean;
}

const languages = [
  {
    name: "Bahasa Indonesia",
    flag: "/images/ID-flag.png",
  },
  {
    name: "English",
    flag: "/images/UK-flag.png",
  },
];

export function LanguagePreference({ defaultMode }: LanguagePreferenceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="group relative" ref={menuRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center gap-1.5 sm:gap-2
          rounded-full
          px-3 py-2 sm:px-6 sm:py-3
          text-sm sm:text-lg font-medium
          transition-colors duration-300
          hover:bg-slate-100 cursor-pointer
        `}
      >
        <Globe size={20} weight="regular" />

        <span className="hidden sm:inline">Bahasa Indonesia</span>

        <CaretDown
          size={14}
          weight="bold"
          className={`hidden sm:inline transition-transform duration-200 ${
            isOpen ? "rotate-180" : "group-hover:rotate-180"
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute right-0 top-full z-50
          w-[calc(100vw-2rem)] max-w-xs sm:w-64 pt-3
          transition-all duration-200
          ${
            isOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
          }
        `}
      >
        <div className="border border-border bg-white p-3 shadow-sm rounded-xl">
          {languages.map((language) => (
            <button
              key={language.name}
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                flex w-full items-center gap-3
                px-4 py-3
                text-left
                text-base font-medium
                text-foreground
                transition-colors duration-200
                hover:bg-slate-100
                cursor-pointer
              "
            >
              <Image
                src={language.flag}
                alt=""
                width={128}
                height={128}
                className="h-5 w-5 rounded-full object-cover"
              />

              <span>{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
