export const LAYOUTS = {
  studio: {
    id: "studio",
    label: "Studio",
    description: "Modern single-page portfolio with sticky nav, hero, and card sections."
  },
  creative: {
    id: "creative",
    label: "Creative",
    description: "Bold split hero with decorative shapes and high-contrast typography."
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Centered, airy layout with generous whitespace and elegant type."
  }
};

const BASE_TOKENS = {
  fontDisplayWeight: "600",
  headingTransform: "uppercase",
  headingLetterSpacing: "0.04em",
  bodyFontSize: "1rem",
  lineHeight: "1.6",
  heroStyle: "plain",
  sectionDivider: "line",
  skillStyle: "chip",
  heroBg: "#ffffff",
  avatarShape: "circle",
  accentGradient: "linear-gradient(135deg, var(--color-accent), transparent)"
};

function tokens(base, overrides = {}) {
  return { ...BASE_TOKENS, ...base, ...overrides };
}

export const PRESETS = {
  classic: {
    id: "classic",
    label: "Classic",
    family: "Professional",
    description: "Navy, serif body, conservative — suits finance, law, operations.",
    tokens: tokens({
      colorBg: "#ffffff",
      colorSurface: "#f8fafc",
      colorText: "#0f172a",
      colorMuted: "#475569",
      colorAccent: "#1e3a8a",
      colorAccentSoft: "#dbeafe",
      fontDisplay: "\"Playfair Display\", Georgia, serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap",
      radius: "0px",
      spacing: "1.35rem",
      maxWidth: "1040px"
    }, { headingLetterSpacing: "0.06em", avatarShape: "rounded" })
  },
  modern: {
    id: "modern",
    label: "Modern",
    family: "Professional",
    description: "Indigo + Inter, neutral default that works for most tech roles.",
    tokens: tokens({
      colorBg: "#ffffff",
      colorSurface: "#f5f7ff",
      colorText: "#111827",
      colorMuted: "#4b5563",
      colorAccent: "#4f46e5",
      colorAccentSoft: "#e0e7ff",
      fontDisplay: "\"Inter\", system-ui, sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      radius: "12px",
      spacing: "1.25rem",
      maxWidth: "1100px"
    }, { headingTransform: "none", fontDisplayWeight: "700", headingLetterSpacing: "0.02em", heroStyle: "banner", sectionDivider: "bar", heroBg: "#f5f7ff" })
  },
  bold: {
    id: "bold",
    label: "Bold",
    family: "Creative",
    description: "High contrast display type — design, creative, and marketing portfolios.",
    tokens: tokens({
      colorBg: "#0f0f11",
      colorSurface: "#1a1a1d",
      colorText: "#f3f4f6",
      colorMuted: "#9ca3af",
      colorAccent: "#f59e0b",
      colorAccentSoft: "#451a03",
      fontDisplay: "\"Space Grotesk\", system-ui, sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap",
      radius: "12px",
      spacing: "1.4rem",
      maxWidth: "1120px"
    }, { fontDisplayWeight: "700", headingLetterSpacing: "0.08em", bodyFontSize: "1.05rem", lineHeight: "1.45", heroStyle: "split", sectionDivider: "none", skillStyle: "outline", heroBg: "#1a1a1d", avatarShape: "square", accentGradient: "linear-gradient(135deg, #f59e0b, #ef4444)" })
  },
  warm: {
    id: "warm",
    label: "Warm",
    family: "Creative",
    description: "Terracotta and serif warmth — academic, nonprofit, editorial.",
    tokens: tokens({
      colorBg: "#fffaf5",
      colorSurface: "#fff1e6",
      colorText: "#2d1f16",
      colorMuted: "#6b5b4f",
      colorAccent: "#c2410c",
      colorAccentSoft: "#ffedd5",
      fontDisplay: "\"Source Serif 4\", Georgia, serif",
      fontBody: "\"Source Sans 3\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Source+Sans+3:wght@400;600&display=swap",
      radius: "8px",
      spacing: "1.3rem",
      maxWidth: "1080px"
    }, { headingTransform: "none", fontDisplayWeight: "600", headingLetterSpacing: "0.03em", lineHeight: "1.65", heroStyle: "centered", sectionDivider: "line", skillStyle: "chip", heroBg: "#fffaf5", avatarShape: "circle" })
  },
  mint: {
    id: "mint",
    label: "Forest & Brass",
    family: "Technical",
    description: "Deep forest green with muted brass accents — matches the app chrome.",
    tokens: tokens({
      colorBg: "#0F1A15",
      colorSurface: "#1A2E24",
      colorText: "#E8E4D9",
      colorMuted: "#A39E8F",
      colorAccent: "#D4AF37",
      colorAccentSoft: "rgba(212, 175, 55, 0.12)",
      fontDisplay: "\"Inter\", system-ui, sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      radius: "10px",
      spacing: "1.25rem",
      maxWidth: "1100px"
    }, { fontDisplayWeight: "700", headingLetterSpacing: "0.05em", bodyFontSize: "0.95rem", heroStyle: "banner", sectionDivider: "bar", heroBg: "#14261D", avatarShape: "circle" })
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    family: "Creative",
    description: "Bookish Baskerville, generous spacing, and warm paper tones.",
    tokens: tokens({
      colorBg: "#FDFCF8",
      colorSurface: "#F5F2EC",
      colorText: "#2A2520",
      colorMuted: "#7D756A",
      colorAccent: "#5A4D41",
      colorAccentSoft: "rgba(90, 77, 65, 0.12)",
      fontDisplay: "\"Libre Baskerville\", Georgia, serif",
      fontBody: "\"Libre Baskerville\", Georgia, serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
      radius: "6px",
      spacing: "1.4rem",
      maxWidth: "960px"
    }, { headingTransform: "none", fontDisplayWeight: "700", headingLetterSpacing: "0.01em", bodyFontSize: "1.05rem", lineHeight: "1.7", heroStyle: "centered", sectionDivider: "none", skillStyle: "outline", heroBg: "#FDFCF8", avatarShape: "none" })
  },
  terminal: {
    id: "terminal",
    label: "Terminal",
    family: "Technical",
    description: "Monospace, dark mode, green accent — a developer-native look.",
    tokens: tokens({
      colorBg: "#0c0c0c",
      colorSurface: "#141414",
      colorText: "#e2e2e2",
      colorMuted: "#6b7280",
      colorAccent: "#22c55e",
      colorAccentSoft: "rgba(34, 197, 94, 0.15)",
      fontDisplay: "\"JetBrains Mono\", monospace",
      fontBody: "\"JetBrains Mono\", monospace",
      fontUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",
      radius: "0px",
      spacing: "1.25rem",
      maxWidth: "1060px"
    }, { fontDisplayWeight: "700", headingLetterSpacing: "0.08em", bodyFontSize: "0.95rem", lineHeight: "1.55", heroStyle: "plain", sectionDivider: "line", skillStyle: "inline", heroBg: "#0c0c0c", avatarShape: "none" })
  },
  pastel: {
    id: "pastel",
    label: "Pastel",
    family: "Creative",
    description: "Soft lavender-pink with rounded cards and friendly type.",
    tokens: tokens({
      colorBg: "#FFF5F7",
      colorSurface: "#FFEAEE",
      colorText: "#4A3F42",
      colorMuted: "#9B858C",
      colorAccent: "#D489A6",
      colorAccentSoft: "rgba(212, 137, 166, 0.15)",
      fontDisplay: "\"Quicksand\", sans-serif",
      fontBody: "\"Quicksand\", sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap",
      radius: "22px",
      spacing: "1.3rem",
      maxWidth: "1100px"
    }, { headingTransform: "none", fontDisplayWeight: "700", headingLetterSpacing: "0.02em", lineHeight: "1.6", heroStyle: "banner", sectionDivider: "none", skillStyle: "chip", heroBg: "#FFEAEE", avatarShape: "circle" })
  },
  slate: {
    id: "slate",
    label: "Slate",
    family: "Professional",
    description: "Tight, uppercase headings on a cool gray canvas — corporate density.",
    tokens: tokens({
      colorBg: "#f8fafc",
      colorSurface: "#f1f5f9",
      colorText: "#0f172a",
      colorMuted: "#64748b",
      colorAccent: "#334155",
      colorAccentSoft: "#cbd5e1",
      fontDisplay: "\"Archivo\", sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap",
      radius: "6px",
      spacing: "1.15rem",
      maxWidth: "1100px"
    }, { fontDisplayWeight: "800", headingLetterSpacing: "0.1em", bodyFontSize: "0.95rem", lineHeight: "1.45", heroStyle: "plain", sectionDivider: "bar", skillStyle: "outline", heroBg: "#f1f5f9", avatarShape: "rounded" })
  }
};

export const DEFAULT_LAYOUT = "studio";
export const DEFAULT_PRESET = "modern";

export function getPreset(id) {
  return PRESETS[id] || PRESETS[DEFAULT_PRESET];
}

export function getLayout(id) {
  return LAYOUTS[id] || LAYOUTS[DEFAULT_LAYOUT];
}
