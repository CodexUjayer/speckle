"use client";

/**
 * The flowing chapters — IV to VI, after the Earth story.
 *
 * When the pinned globe dive ends inside the closing dark, these sections
 * scroll up over the blackened canvas and carry the story in the classic
 * MOTUS voice: full-bleed landscape systems with quiet parallax, the
 * evidence chapter with an interactive optical/radar comparison, the
 * engine watchlist, and the finale. Honest module statuses throughout.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CircleDot, MoveHorizontal } from "lucide-react";
import {
  CHAPTER_4_INTRO,
  SECTORS,
  EVIDENCE,
  VERDICT_TIERS,
  PIPELINES,
  FINALE,
  THEMES,
  type Sector,
} from "./data";
import { cinematify } from "./sections/anim";
import { clamp } from "./scroll";

/* ------------------------------------------------------------------ */
/* status tag                                                          */
/* ------------------------------------------------------------------ */

function StatusTag({ status }: { status: Sector["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8fd8c8]">
        <CircleDot className="h-3 w-3" aria-hidden />
        Live module
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#c8b98d]">
      <span
        className="block h-1.5 w-1.5 rounded-full border border-[#c8b98d]/70"
        aria-hidden
      />
      In development
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* a system — full-bleed imagery, themed accent, honest status          */
/* ------------------------------------------------------------------ */

function SectorBlock({ sector, first }: { sector: Sector; first: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) return cinematify(ref.current);
  }, []);
  const left = sector.align === "left";

  return (
    <section
      ref={ref}
      aria-labelledby={`${sector.id}-heading`}
      className="relative"
      style={{ ["--accent" as string]: sector.theme.accent }}
    >
      <div className="relative h-[92vh] min-h-[560px] overflow-hidden">
        <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
          <Image
            src={sector.image}
            alt={sector.imageAlt}
            fill
            sizes="100vw"
            quality={82}
            className="object-cover"
            priority={first}
          />
        </div>
        <div
          className={`absolute inset-0 ${
            left
              ? "bg-gradient-to-r from-[#04070d]/90 via-[#04070d]/35 to-transparent"
              : "bg-gradient-to-l from-[#04070d]/90 via-[#04070d]/35 to-transparent"
          }`}
        />
        <div className="absolute inset-0 grain" aria-hidden />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8">
          <div className={`max-w-xl ${left ? "mr-auto" : "ml-auto"}`}>
            <p data-reveal className="chapter-kicker text-[var(--accent)]">
              System {sector.index} · {sector.kicker}
            </p>
            <h2
              data-reveal
              id={`${sector.id}-heading`}
              className="mt-4 font-display text-4xl font-light leading-[1.06] text-white sm:text-5xl lg:text-6xl"
            >
              {sector.heading}
            </h2>
            <p
              data-reveal
              className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]"
            >
              {sector.body}
            </p>
            <ul
              data-reveal
              className="mt-7 space-y-2"
              aria-label="Module facts"
            >
              {sector.meta.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.18em] text-white/55"
                >
                  <span
                    className="block h-px w-4 bg-[var(--accent)]/60"
                    aria-hidden
                  />
                  {m}
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={sector.cta.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${
                  sector.status === "live"
                    ? "bg-white text-[#0a1220] hover:bg-[var(--accent)]"
                    : "border border-white/35 text-white hover:border-[var(--accent)] hover:bg-white/[0.06]"
                }`}
              >
                {sector.cta.label}
                {sector.status === "live" ? (
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                ) : (
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                )}
              </a>
              <StatusTag status={sector.status} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* the compare slider — optical vs radar, draggable                     */
/* ------------------------------------------------------------------ */

function CompareSlider() {
  const root = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const divider = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState(35);
  const dragging = useRef(false);

  const apply = useCallback((v: number) => {
    setPos(v);
    if (divider.current) divider.current.style.left = `${v}%`;
    if (clip.current) clip.current.style.clipPath = `inset(0 0 0 ${v}%)`;
    if (readout.current)
      readout.current.textContent = `RADAR ${Math.round(v)}%`;
    if (root.current)
      root.current.setAttribute("aria-valuenow", String(Math.round(v)));
  }, []);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      apply(clamp(((clientX - r.left) / r.width) * 100, 2, 98));
    },
    [apply],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const endDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") {
      apply(clamp(pos - step, 2, 98));
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      apply(clamp(pos + step, 2, 98));
      e.preventDefault();
    } else if (e.key === "Home") {
      apply(2);
      e.preventDefault();
    } else if (e.key === "End") {
      apply(98);
      e.preventDefault();
    }
  };

  return (
    <div>
      <div
        ref={root}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={35}
        aria-label="Comparison between optical and radar imagery"
        aria-valuetext="35% radar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative aspect-[16/9] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-md border border-white/15 bg-[#0a0f18] shadow-[0_30px_90px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        {/* optical (base) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/landscapes/earthquake.webp)" }}
          aria-hidden
        />
        {/* radar (clipped) */}
        <div
          ref={clip}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/landscapes/sar.webp)",
            clipPath: "inset(0 0 0 35%)",
          }}
          aria-hidden
        />

        <span className="pointer-events-none absolute left-3 top-3 rounded-sm bg-[#04070d]/78 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
          {EVIDENCE.compareLabels.left}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-sm bg-[#04070d]/78 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
          {EVIDENCE.compareLabels.right}
        </span>

        <div
          ref={divider}
          className="pointer-events-none absolute inset-y-0 w-px bg-white/90"
          style={{ left: "35%" }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-[#04070d]/75 text-white backdrop-blur-sm">
            <MoveHorizontal className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-sm bg-[#04070d]/78 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          <span ref={readout}>RADAR 35%</span>
          <span className="text-white/35">· {EVIDENCE.compareLabels.hint}</span>
        </span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/40">
        {EVIDENCE.footnote}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* verdict vocabulary                                                  */
/* ------------------------------------------------------------------ */

const VERDICT_TONE: Record<string, string> = {
  ok: "bg-[#8fd8c8] shadow-[0_0_10px_rgba(143,216,200,0.7)]",
  mid: "bg-[#e3cf9a]",
  off: "bg-[#c98d7e]",
  dim: "bg-white/20",
};

function VerdictList() {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">
        Verdict vocabulary — as reported by the engine
      </p>
      <ul className="mt-5 grid gap-3.5 sm:grid-cols-2" aria-label="Possible verdict tiers">
        {VERDICT_TIERS.map((t) => (
          <li key={t.label} className="flex items-start gap-3.5">
            <span
              className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${VERDICT_TONE[t.tone]}`}
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-white/85">{t.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                {t.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-white/[0.07] pt-4 text-xs leading-relaxed text-white/40">
        No calibrated probabilities until labelled histories exist — by design.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the flowing chapters                                                */
/* ------------------------------------------------------------------ */

export default function ScrollChapters() {
  const introRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLElement>(null);
  const finaleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (introRef.current) return cinematify(introRef.current);
  }, []);
  useEffect(() => {
    if (evidenceRef.current) return cinematify(evidenceRef.current);
  }, []);
  useEffect(() => {
    if (finaleRef.current) return cinematify(finaleRef.current);
  }, []);

  return (
    <div className="relative bg-[#04070d]">
      {/* chapter IV — the changing systems */}
      <div ref={introRef} className="relative bg-[#04070d]">
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-28 text-center sm:px-8 sm:pt-36">
          <p data-reveal className="chapter-kicker text-[var(--accent)]">
            {CHAPTER_4_INTRO.kicker}
          </p>
          <h2
            data-reveal
            className="mt-4 font-display text-4xl font-light leading-[1.08] text-white sm:text-5xl"
          >
            {CHAPTER_4_INTRO.heading}
          </h2>
          <p
            data-reveal
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#93a3ba]"
          >
            {CHAPTER_4_INTRO.body}
          </p>
        </div>
        {SECTORS.map((s, i) => (
          <SectorBlock key={s.id} sector={s} first={i === 0} />
        ))}
      </div>

      {/* chapter V — from observation to evidence */}
      <section
        ref={evidenceRef}
        aria-labelledby="evidence-heading"
        className="relative border-t border-white/[0.06] bg-[#050810]"
        style={{ ["--accent" as string]: THEMES.evidence.accent }}
      >
        <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
          <p data-reveal className="chapter-kicker text-[var(--accent)]">
            {EVIDENCE.kicker}
          </p>
          <h2
            data-reveal
            id="evidence-heading"
            className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.08] text-white sm:text-5xl"
          >
            {EVIDENCE.heading}
          </h2>
          <p
            data-reveal
            className="mt-6 max-w-2xl text-sm leading-relaxed text-[#93a3ba]"
          >
            {EVIDENCE.body}
          </p>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {EVIDENCE.stages.map((st) => (
              <div key={st.n} data-reveal>
                <p className="stage-number">{st.n}</p>
                <h3 className="stage-title">{st.title}</h3>
                <p className="stage-body">{st.body}</p>
              </div>
            ))}
          </div>

          <div data-reveal className="mx-auto mt-16 max-w-4xl">
            <CompareSlider />
          </div>

          <div data-reveal className="mt-16">
            <VerdictList />
          </div>

          <div data-reveal className="mt-16">
            <p className="chapter-kicker text-[var(--accent)]">
              {EVIDENCE.engineKicker}
            </p>
            <h3 className="mt-3 font-display text-3xl font-light text-white sm:text-4xl">
              {EVIDENCE.engineHeading}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#93a3ba]">
              {EVIDENCE.engineBody}
            </p>
            <ul
              className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Engine pipelines"
            >
              {PIPELINES.map((p) => (
                <li
                  key={p.code}
                  className="flex items-baseline gap-3 border-b border-white/[0.06] py-2"
                >
                  <span
                    className={`shrink-0 font-mono text-[10px] tracking-[0.12em] ${
                      p.live ? "text-[var(--accent)]" : "text-white/30"
                    }`}
                  >
                    {p.code}
                  </span>
                  <span
                    className={`truncate text-[12px] tracking-tight ${
                      p.live ? "text-white" : "text-white/45"
                    }`}
                  >
                    {p.name}
                  </span>
                  <span className="ml-auto flex shrink-0 items-center gap-1.5">
                    <span
                      className={`block h-1 w-1 rounded-full ${
                        p.live
                          ? "bg-[#8fd8c8] shadow-[0_0_8px_rgba(143,216,200,0.8)]"
                          : "bg-white/15"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`text-[8px] font-medium uppercase tracking-[0.2em] ${
                        p.live ? "text-[#8fd8c8]" : "text-white/25"
                      }`}
                    >
                      {p.live ? "live" : "planned"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] leading-relaxed text-white/35">
              Status as of the current repository —{" "}
              <span className="text-white/55">earthquake_coseismic</span> and{" "}
              <span className="text-white/55">tsunami_ocean_evidence</span> are
              implemented; the rest are scaffolded pipelines on the roadmap, each
              with its own manifest, fetch layer and status vocabulary.
            </p>
          </div>
        </div>
      </section>

      {/* chapter VI — the finale */}
      <section
        ref={finaleRef}
        aria-labelledby="finale-heading"
        className="relative overflow-hidden bg-[#04070d]"
        style={{ ["--accent" as string]: THEMES.finale.accent }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: "url(/landscapes/descent.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center 62%",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04070d]/70 via-transparent to-[#04070d]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
          <p data-reveal className="chapter-kicker">
            {FINALE.kicker}
          </p>
          <h2
            data-reveal
            id="finale-heading"
            className="mt-5 font-display text-5xl font-light leading-[1.05] text-white sm:text-6xl"
          >
            {FINALE.heading}
          </h2>
          <p
            data-reveal
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#a5b3c7] sm:text-base"
          >
            {FINALE.body}
          </p>
          <div data-reveal className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={FINALE.primary.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a1220] transition-all duration-300 hover:bg-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {FINALE.primary.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </a>
            <a
              href={FINALE.secondary.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/30 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 transition-all duration-300 hover:border-[var(--accent)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {FINALE.secondary.label}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
