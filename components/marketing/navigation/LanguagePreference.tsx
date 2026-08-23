import Image from "next/image";
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
  return (
    <div className="group relative">
      {/* Trigger */}
      <button
        type="button"
        className={`
          flex items-center gap-2
          rounded-sm
          px-6 py-3
          text-lg font-medium
          transition-colors duration-300
          hover:bg-slate-100 cursor-pointer
        `}
      >
        <Globe size={20} weight="regular" />

        <span>Bahasa Indonesia</span>

        <CaretDown
          size={14}
          weight="bold"
          className="transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      {/* Dropdown */}
      <div
        className="
          invisible absolute right-0 top-full z-50
          w-64 pt-3
          translate-y-1 opacity-0
          transition-all duration-200
          group-hover:visible
          group-hover:translate-y-0
          group-hover:opacity-100        
        "
      >
        <div className="border border-border bg-white p-2 shadow-sm rounded-md">
          {languages.map((language) => (
            <button
              key={language.name}
              type="button"
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
