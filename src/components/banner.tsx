export function ComfortBanner() {
  return (
    <section className="relative isolate flex h-[60svh] min-h-[20rem] items-center overflow-hidden bg-black text-white sm:h-[65svh] lg:h-[50svh]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/60">
            Zinna essentials
          </p>

          <h2 className="mt-6 max-w-xl font-[family-name:var(--font-arizonia)] text-4xl font-normal leading-[0.9] tracking-[0.5] sm:text-7xl lg:text-6xl">
            Feel easy from the moment you put it on
          </h2>
        </div>

        <div className="max-w-lg lg:justify-self-end">
          <p className="text-base leading-8 text-white/75 sm:text-lg">
            Designed around the way you actually live, our everyday pieces
            bring together soft fabrics, relaxed silhouettes, and effortless
            movement. Nothing feels forced. Nothing gets in the way. Just
            comfort that looks as good as it feels.
          </p>

          <p className="mt-6 text-sm uppercase tracking-[0.1em] text-white/50">
            Soft structure. Everyday freedom.
          </p>
        </div>
      </div>
    </section>
  );
}