"use client";

import Image from "next/image";
import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Data Terhubung",
    description:
      "Data transaksi dan informasi relevan dikumpulkan dengan memperhatikan persetujuan serta keamanan data pengguna.",
  },
  {
    number: "02",
    title: "Data Dianalisis",
    description:
      "Data transaksi diolah menjadi berbagai indikator seperti frekuensi, nilai, konsistensi, tren omzet, dan perubahan aktivitas bisnis, kemudian dianalisis oleh model AI/ML untuk mengenali pola usaha dan tingkat risikonya.",
  },
  {
    number: "03",
    title: "Insight Dihasilkan",
    description:
      "Hasil analisis diterjemahkan menjadi credit score dan insight yang dapat membantu memahami profil kredit secara lebih menyeluruh.",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="cara-kerja" className="bg-surface px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Image */}
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] lg:min-h-[680px]">
            <Image
              src="/images/transaction-qris.png"
              alt="Cara kerja Qredi"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            {/* Heading */}
            <div className="mb-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Cara Kerja
              </p>

              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Mengubah Data Menjadi Insight.
              </h2>
            </div>

            {/* Steps */}
            <div className="flex flex-col border-t border-border">
              {steps.map((step, index) => {
                const isActive = activeStep === index;

                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`
                      group
                      w-full
                      cursor-pointer
                      border-b border-border
                      text-left
                      transition-colors duration-300
                      ${
                        isActive
                          ? "bg-background"
                          : "bg-transparent hover:bg-background/60"
                      }
                    `}
                  >
                    <div className="flex items-start gap-6 px-5 py-6 sm:px-7">
                      {/* Number */}
                      <span
                        className={`
                            h-10 w-16
                          shrink-0
                          text-4xl font-semibold leading-none
                          tracking-tight
                          transition-colors duration-300
                          sm:text-5xl
                          ${
                            isActive
                              ? "text-primary"
                              : "text-foreground/20 group-hover:text-foreground/40"
                          }
                        `}
                      >
                        {step.number}
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3
                            className={`
                              text-lg font-semibold
                              transition-colors duration-300
                              sm:text-2xl
                              ${isActive ? "text-primary" : "text-foreground"}
                            `}
                          >
                            {step.title}
                          </h3>

                          <CaretDown
                            size={20}
                            weight="bold"
                            className={`
                              shrink-0
                              transition-all duration-300
                              ${
                                isActive
                                  ? "rotate-180 text-primary"
                                  : "text-muted"
                              }
                            `}
                          />
                        </div>

                        {/* Description */}
                        <div
                          className={`
                            grid transition-all duration-300 ease-out
                            ${
                              isActive
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }
                          `}
                        >
                          <div className="overflow-hidden">
                            <p className="pt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
