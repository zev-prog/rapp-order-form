/** Catalogue data for the order form — sizes. */

export const CUSTOM = "__custom__";

/** cm first, US name / inches in parentheses */
export const BED_SIZES = [
  '97 × 191 cm (Twin 38")',
  '122 × 191 cm (48")',
  '137 × 191 cm (Full 54")',
  '152 × 203 cm (Queen 60")',
  '193 × 203 cm (King 76")',
  "90 × 190 cm",
  "90 × 200 cm",
  "100 × 190 cm",
  "100 × 200 cm",
  "120 × 200 cm",
  "140 × 200 cm",
  "160 × 200 cm",
  "180 × 200 cm",
  "200 × 200 cm",
] as const;

export const FITTED_SHEET_SIZES = [
  '97 × 191 · H30 cm (Twin 38")',
  '122 × 191 · H30 cm (48")',
  '137 × 191 · H30 cm (Full 54")',
  '152 × 203 · H30 cm (Queen 60")',
  '193 × 203 · H30 cm (King 76")',
  "90 × 190 · H30 cm",
  "90 × 200 · H30 cm",
  "100 × 190 · H30 cm",
  "100 × 200 · H30 cm",
  "120 × 200 · H30 cm",
  "140 × 200 · H30 cm",
  "160 × 200 · H30 cm",
  "180 × 200 · H30 cm",
] as const;

export const DUVET_COVER_SIZES = [
  '240 × 230 cm (Queen)',
  '270 × 240 cm (King)',
  "140 × 200 cm",
  "150 × 200 cm",
  "160 × 200 cm",
  "200 × 220 cm",
  "240 × 220 cm",
] as const;

export const PILLOW_CASE_SIZES = [
  '50 × 70 cm (20" × 26")',
  '66 × 66 cm (26" × 26")',
  '30 × 51 cm (12" × 20")',
  "50 × 80 cm",
  "60 × 90 cm",
] as const;

/** Pillow insert sizes — same list as cases for matching */
export const PILLOW_FILL_SIZES = PILLOW_CASE_SIZES;

/** Duvet insert sizes — same list as covers for matching */
export const DUVET_FILL_SIZES = DUVET_COVER_SIZES;

