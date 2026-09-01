export default function WhyQredi() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-20 text-center lg:min-h-[420px] lg:px-12 lg:py-24 ">
        <div className="flex flex-col gap-10 cursor-pointer">
          <p className="text-xl font-semibold leading-snug tracking-tight text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-2xl lg:text-[28px]">
            Jutaan UMKM masih menghadapi keterbatasan akses terhadap pembiayaan,
            meskipun bisnis mereka terus berjalan.
          </p>

          <p className="text-xl font-semibold leading-snug tracking-tight text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-2xl lg:text-[28px]">
            Di balik setiap transaksi <span className="text-primary">QRIS</span>
            , terdapat data yang dapat mencerminkan aktivitas dan kesehatan
            bisnis.
          </p>

          <p className="text-xl font-semibold leading-snug tracking-tight text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-2xl lg:text-[28px]">
            <span className="text-primary">Qredi</span> mengubah data tersebut
            menjadi insight untuk membantu membuka akses pembiayaan yang lebih
            inklusif bagi UMKM.
          </p>
        </div>
      </div>
    </section>
  );
}
