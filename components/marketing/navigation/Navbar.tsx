"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";

import { QrediLogo } from "@/components/branding/QrediLogo";
import { LoginMenu } from "./LoginMenu";
import { LanguagePreference } from "./LanguagePreference";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "#produk" },
  { label: "Solusi", href: "#solusi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Tentang Kami", href: "#tentang-kami" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY <= 20) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
        setMenuOpen(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav>
        {/* Main Navbar */}
        <div className="flex h-20 items-center justify-between px-24">
          {/* Left Side */}
          <div className="flex items-center gap-5">
            {/* Menu Button */}
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-slate-100 cursor-pointer"
            >
              {menuOpen ? (
                <X size={28} weight="regular" />
              ) : (
                <List size={28} weight="regular" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center" aria-label="Qredi">
              <QrediLogo className="h-12 text-primary-foreground" />
            </Link>
          </div>

          {/* CTA */}
          <div className="flex flex-row gap-2">
            <LanguagePreference defaultMode={true} />
            <LoginMenu defaultMode={true} />
          </div>
        </div>

        {/* Navigation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out w-full border-b border-border  ${
            menuOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-24 pb-4 ">
            <div className="flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group relative py-2 text-base font-medium text-foreground/80 hover:font-semibold hover:text-foreground transitions-all "
                >
                  {item.label}

                  <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
