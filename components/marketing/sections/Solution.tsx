"use client";

import { Gauge, ShieldCheck, Database } from "@phosphor-icons/react";

const solutions = [
  {
    icon: Gauge,
    title: "Alternative Credit Scoring",
    description:
      "Memanfaatkan data alternatif untuk menghasilkan insight kredit yang lebih relevan bagi UMKM.",
  },
  {
    icon: Database,
    title: "Data-Driven Insights",
    description:
      "Mengubah data menjadi informasi yang membantu memahami profil dan karakteristik kredit secara lebih menyeluruh.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible Scoring",
    description:
      "Menghadirkan proses scoring yang transparan dengan memperhatikan keamanan dan privasi data.",
  },
];

export default function Solution() {
  return (
    <section id="solusi" className="bg-background px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Headline */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Solusi
            </p>

            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Teknologi untuk Membuka Lebih Banyak Peluang.
            </h2>
          </div>

          {/* Subheadline */}
          <div className="flex items-end lg:justify-end">
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Qredi menghubungkan data, teknologi, dan kebutuhan industri
              keuangan untuk menghadirkan cara yang lebih relevan dalam memahami
              profil kredit UMKM.
            </p>
          </div>
        </div>

        {/* Solution Cards */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon;

            return (
              <div
                key={solution.title}
                className="
                  group
                  rounded-2xl
                  border border-border
                  bg-surface
                  p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                  pb-12
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-full
                    bg-tranparent
                    text-primary
                    transition-colors duration-300
                    group-hover:bg-primary
                    group-hover:text-white
                  "
                >
                  <Icon size={28} weight="regular" />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {solution.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {solution.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
