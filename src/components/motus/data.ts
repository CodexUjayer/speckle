/**
 * MOTUS — cinematic landing page content, themes & integration map.
 *
 * All hazard-pipeline facts below are extracted verbatim from the
 * Dancing_With_SARs repository (engine/pipelines/…/manifest.yaml) so the
 * landing page never claims a module that does not exist.
 */

import { TL } from "./scroll";

export const REPO_URL = "https://github.com/Tech-Doomsday/Dancing_With_SARs";

/**
 * Entry point of the real application (the hazard console built with the
 * engine). When this landing page is merged into the repository, set
 * NEXT_PUBLIC_MOTUS_APP_URL to the deployed app-ui entry (e.g. "/console").
 * Until then the repository itself is the honest destination.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_MOTUS_APP_URL?.trim() || REPO_URL;

export const LINKS = {
  app: APP_URL,
  earthquakes: APP_URL,
  hurricanes: `${REPO_URL}/tree/main/engine/pipelines/flood_inundation`,
  erosion: `${REPO_URL}/tree/main/engine/pipelines/river_erosion`,
  architecture: `${REPO_URL}/blob/main/docs/ARCHITECTURE.md`,
  repo: REPO_URL,
  spaceapps: "https://www.spaceappschallenge.org/",
  nasaVisibleEarth: "https://visibleearth.nasa.gov/",
} as const;

/* ------------------------------------------------------------------ */
/* Chapter themes — each chapter grades the whole page                 */
/* ------------------------------------------------------------------ */

export interface ChapterTheme {
  /** accent for kickers, rails, ticks and focus rings */
  accent: string;
  /** deep background the 3D fog fades toward */
  bg: string;
  label: string;
}

export const THEMES: Record<string, ChapterTheme> = {
  space: { accent: "#a9bfd6", bg: "#04070d", label: "A world seen from space" },
  move: { accent: "#a9bfd6", bg: "#04070d", label: "The planet begins to move" },
  descent: { accent: "#b8c8d4", bg: "#05080e", label: "Descending into the landscape" },
  quake: { accent: "#d9a066", bg: "#0d0a08", label: "When the ground shifts" },
  water: { accent: "#7fc4c9", bg: "#060d12", label: "When water reshapes the land" },
  river: { accent: "#9ab87a", bg: "#070c09", label: "Where rivers redraw the land" },
  evidence: { accent: "#c2cdd9", bg: "#050810", label: "From observation to evidence" },
  engine: { accent: "#c2cdd9", bg: "#050810", label: "The engine" },
  finale: { accent: "#a9bfd6", bg: "#04070d", label: "Enter MOTUS" },
};

/** theme key → story progress ranges over the pinned Earth room (kept in sync with TL) */
export const THEME_TRACK: { key: string; start: number; end: number }[] = [
  { key: "space", start: 0, end: TL.ch2.start },
  { key: "move", start: TL.ch2.start, end: TL.ch3.start },
  { key: "descent", start: TL.ch3.start, end: 1.01 },
];

/* ------------------------------------------------------------------ */
/* Story copy                                                          */
/* ------------------------------------------------------------------ */

export const HERO = {
  eyebrow: "NASA Space Apps Challenge 2026 · Dancing with the SARs",
  title: "MOTUS",
  subtitle: "Earth is always changing.",
  body: "Discover the changes shaping our planet, observed from space.",
  cue: "Scroll to begin",
} as const;

export const CHAPTER_2 = {
  kicker: "Chapter II — The planet begins to move",
  heading: "A changing planet leaves evidence.",
  body: "Turn the globe and the record appears — coasts drift, ground lifts, rivers wander. Satellite radar reads that record even through cloud and darkness.",
} as const;

export const CHAPTER_3 = {
  kicker: "Chapter III — Descending into the landscape",
  heading: "Every landscape tells a different story.",
  body: "Leave orbit and fall toward the surface — from a whole planet to a single ridge, a single shoreline, a single river bend.",
} as const;

export const CHAPTER_4_INTRO = {
  kicker: "Chapter IV — The changing systems",
  heading: "Discover the Earth’s changing systems.",
  body: "The land below is the engine’s field of view. Keep scrolling — the terrain itself will carry you between them.",
  cue: "Continue the descent",
} as const;

/* ------------------------------------------------------------------ */
/* Sectors (status reflects the actual engine/pipelines state)         */
/* ------------------------------------------------------------------ */

export type SectorStatus = "live" | "planned";

export interface Sector {
  id: string;
  index: string;
  kicker: string;
  heading: string;
  body: string;
  image: string;
  imageAlt: string;
  status: SectorStatus;
  cta: { label: string; href: string };
  meta: string[];
  align: "left" | "right";
  theme: ChapterTheme;
  /** heightmap derivation: invert luminance, displacement strength */
  height: { invert: boolean; strength: number; bias: number };
}

export const SECTORS: Sector[] = [
  {
    id: "system-earthquakes",
    index: "01",
    kicker: "Ground deformation",
    heading: "When the ground shifts.",
    body: "Earthquakes rearrange the surface in seconds. Radar measures the displacement between passes — and physics checks whether the answer holds together.",
    image: "/landscapes/earthquake.webp",
    imageAlt:
      "Aerial view of a rugged arid landscape cut by a visible geological fault line.",
    status: "live",
    cta: { label: "Explore earthquakes", href: LINKS.earthquakes },
    meta: [
      "earthquake_coseismic · 3.01",
      "Physics — Okada85 + consistency screen",
      "Status — implemented",
    ],
    align: "left",
    theme: THEMES.quake,
    height: { invert: false, strength: 1.0, bias: 0.0 },
  },
  {
    id: "system-hurricanes",
    index: "02",
    kicker: "Water & storm",
    heading: "When water reshapes the land.",
    body: "Storms rewrite coastlines and floodplains. Mapping water where it shouldn’t be is a different question from ground movement — and never mistaken for it.",
    image: "/landscapes/delta.webp",
    imageAlt:
      "Aerial view of a river delta meeting the ocean, dark landmasses against bright reflective water.",
    status: "planned",
    cta: { label: "Explore hurricanes", href: LINKS.hurricanes },
    meta: [
      "flood_inundation · 3.07 — in development",
      "tropical_cyclone · 3.13 — in development",
      "Event feeds — ComCat · IBTrACS, live",
    ],
    align: "right",
    theme: THEMES.water,
    height: { invert: true, strength: 0.72, bias: -0.04 },
  },
  {
    id: "system-erosion",
    index: "03",
    kicker: "Sediment & shifting channels",
    heading: "Where rivers redraw the land.",
    body: "Rivers are patient sculptors — eroding here, depositing there, decade after decade. Geometry and statistics trace the changes along the corridor.",
    image: "/landscapes/river_alt.webp",
    imageAlt:
      "Aerial view of a winding river meandering through a dense forest landscape.",
    status: "planned",
    cta: { label: "Explore river erosion", href: LINKS.erosion },
    meta: [
      "river_erosion · 3.10 — in development",
      "Geometry + statistics",
      "River corridors — S11 buffer, water occurrence",
    ],
    align: "left",
    theme: THEMES.river,
    height: { invert: false, strength: 0.85, bias: 0.05 },
  },
];

/* ------------------------------------------------------------------ */
/* The engine watchlist — real pipeline catalog from the repository     */
/* ------------------------------------------------------------------ */

export interface PipelineRow {
  code: string;
  name: string;
  live: boolean;
}

export const PIPELINES: PipelineRow[] = [
  { code: "3.01", name: "earthquake_coseismic", live: true },
  { code: "3.02", name: "land_subsidence", live: false },
  { code: "3.03", name: "volcanic_deformation", live: false },
  { code: "3.04", name: "landslide", live: false },
  { code: "3.05", name: "glacier_ice_flow", live: false },
  { code: "3.06", name: "permafrost_thaw", live: false },
  { code: "3.07", name: "flood_inundation", live: false },
  { code: "3.08", name: "deforestation", live: false },
  { code: "3.09", name: "wildfire_burn_scar", live: false },
  { code: "3.10", name: "river_erosion", live: false },
  { code: "3.11", name: "coastal_erosion", live: false },
  { code: "3.12", name: "urban_damage", live: false },
  { code: "3.13", name: "tropical_cyclone", live: false },
  { code: "3.14", name: "tsunami_inundation", live: false },
  { code: "3.15", name: "oil_spill", live: false },
  { code: "3.16", name: "iceberg_calving_drift", live: false },
  { code: "3.17", name: "tsunami_ocean_evidence", live: true },
];

/* ------------------------------------------------------------------ */
/* Evidence — the engine's real verdict vocabulary (engine/verdict)     */
/* ------------------------------------------------------------------ */

export const VERDICT_TIERS: { label: string; note: string; tone: string }[] = [
  { label: "supported by evidence", note: "the signal survives its consistency screens", tone: "ok" },
  { label: "candidate / possible", note: "worth a closer look — not yet conclusive", tone: "mid" },
  { label: "not supported by evidence", note: "the observations argue against it", tone: "off" },
  { label: "not enough evidence", note: "the archive is genuinely young", tone: "dim" },
  { label: "did not apply here", note: "the pipeline itself said “not for this tile”", tone: "dim" },
  { label: "not modelled yet", note: "honestly absent, not silently skipped", tone: "dim" },
];

export const EVIDENCE = {
  kicker: "Chapter V — From observation to evidence",
  heading: "Observe. Compare. Investigate.",
  body: "A satellite image is an observation, not a conclusion. An algorithm produces an estimate. Scientific interpretation requires evidence — and an honest account of uncertainty.",
  stages: [
    {
      n: "01",
      title: "Observe",
      body: "Satellites watch the same ground again and again. Radar adds what eyes cannot get through — cloud, darkness, and motion at millimetre scale.",
    },
    {
      n: "02",
      title: "Compare",
      body: "Algorithms compare observations across time — coherence, backscatter, phase — and turn the difference into an estimate, with its uncertainty attached. Drag the divider: the terrain behind it answers.",
    },
    {
      n: "03",
      title: "Investigate",
      body: "A human reads the evidence. Every verdict names its tier and never a number it hasn’t earned: no calibrated probabilities until labelled histories exist — by design.",
    },
  ],
  compareLabels: {
    left: "Optical — what sunlight shows",
    right: "SAR — what radar shows",
    hint: "Drag to compare",
  },
  engineKicker: "The engine",
  engineHeading: "Seventeen watchers. One honest verdict.",
  engineBody:
    "The MOTUS engine runs every detector that could apply to a scene — sixteen hazard types, seventeen independent pipelines. No pipeline reads another’s output; every answer carries its evidence with it.",
  footnote:
    "Scenes above are illustrative examples of observation types — not measurement results from a specific event.",
} as const;

export const FINALE = {
  kicker: "Chapter VI — Enter MOTUS",
  heading: "The story is written on Earth.",
  body: "Explore the observations. Investigate the changes. Understand what the evidence can tell us.",
  primary: { label: "Start exploring", href: LINKS.app },
  secondary: { label: "How MOTUS works", href: LINKS.architecture },
} as const;

export const FOOTER = {
  blurb:
    "An Earth-observation story built for NASA Space Apps Challenge 2026 — Dancing with the SARs.",
  disclaimer:
    "A Space Apps challenge project. Not affiliated with or endorsed by NASA.",
  credits:
    "Earth imagery: NASA Visible Earth — Blue Marble & city lights. Landscape scenes are editorial photography.",
} as const;
