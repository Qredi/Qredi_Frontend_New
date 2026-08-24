import Image from "next/image";

export default function AboutUs() {
  return (
    <section id="tentang-kami" className="relative overflow-hidden">
      {/* Top Content */}
      <div className="bg-background px-6 py-16 md:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            {/* Left — Heading */}
            <div>
              {/* Section Label */}
              <div>
                <span className="text-sm font-medium tracking-[0.2em] text-primary">
                  TENTANG QREDI
                </span>
              </div>

              <h2 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Setiap usaha memiliki potensi.
                <span className="text-foreground/35">
                  {" "}
                  Data membantu kita melihatnya.
                </span>
              </h2>
            </div>

            {/* Right — Indonesia Map */}
            <div className="flex items-center justify-center lg:justify-end">
              <Image
                src="/images/indo-map.png"
                alt="Peta Indonesia"
                width={1000}
                height={600}
                className="
                  w-full
                  max-w-lg
                  object-contain
                  opacity-80
                  transition-all duration-700
                  scale-[1.25]
                  hover:scale-[1.3]
                  hover:opacity-100
                  md:max-w-2xl
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="bg-surface px-6 py-16 md:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-24">
            {/* Main Statement */}
            <div>
              <p className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
                Qredi hadir untuk membantu membangun ekosistem pembiayaan yang
                lebih inklusif bagi UMKM Indonesia.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-muted md:text-lg">
                Melalui pendekatan Alternative Credit Scoring, Qredi membantu
                lender memperoleh insight tambahan mengenai profil dan risiko
                UMKM. Dengan begitu, proses penilaian dapat dilakukan dengan
                mempertimbangkan lebih dari sekadar riwayat kredit tradisional.
              </p>

              <p className="text-base leading-relaxed text-muted md:text-lg">
                Kami percaya bahwa keterbatasan riwayat kredit tidak seharusnya
                menjadi penghalang bagi usaha yang memiliki potensi. Dengan
                pemanfaatan data yang tepat, lebih banyak UMKM dapat dipahami,
                dipertimbangkan, dan memiliki peluang untuk mendapatkan akses
                pembiayaan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
