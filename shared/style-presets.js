export const LAYOUTS = {
  timeline: {
    id: "timeline",
    label: "Timeline",
    description: "Clean single-column flow. Great for narrative-driven resumes."
  },
  sidebar: {
    id: "sidebar",
    label: "Sidebar",
    description: "Left accent rail for contact and skills, content on the right."
  }
};

export const PRESETS = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "Navy, serif body, conservative — suits finance, law, operations.",
    tokens: {
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
      maxWidth: "820px"
    }
  },
  modern: {
    id: "modern",
    label: "Modern",
    description: "Indigo + Inter, neutral default that works for most tech roles.",
    tokens: {
      colorBg: "#ffffff",
      colorSurface: "#f5f7ff",
      colorText: "#111827",
      colorMuted: "#4b5563",
      colorAccent: "#4f46e5",
      colorAccentSoft: "#e0e7ff",
      fontDisplay: "\"Inter\", system-ui, sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      radius: "8px",
      spacing: "1.25rem",
      maxWidth: "860px"
    }
  },
  bold: {
    id: "bold",
    label: "Bold",
    description: "High contrast display type — design, creative, and marketing portfolios.",
    tokens: {
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
      maxWidth: "900px"
    }
  },
  warm: {
    id: "warm",
    label: "Warm",
    description: "Terracotta and serif warmth — academic, nonprofit, editorial.",
    tokens: {
      colorBg: "#fffaf5",
      colorSurface: "#fff1e6",
      colorText: "#2d1f16",
      colorMuted: "#6b5b4f",
      colorAccent: "#c2410c",
      colorAccentSoft: "#ffedd5",
      fontDisplay: "\"Source Serif 4\", Georgia, serif",
      fontBody: "\"Source Sans 3\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Source+Sans+3:wght@400;600&display=swap",
      radius: "4px",
      spacing: "1.3rem",
      maxWidth: "840px"
    }
  },
  mint: {
    id: "mint",
    label: "Forest & Brass",
    description: "Deep forest green with muted brass accents — matches the app chrome.",
    tokens: {
      colorBg: "#0F1A15",
      colorSurface: "#1A2E24",
      colorText: "#E8E4D9",
      colorMuted: "#A39E8F",
      colorAccent: "#D4AF37",
      colorAccentSoft: "rgba(212, 175, 55, 0.12)",
      fontDisplay: "\"Inter\", system-ui, sans-serif",
      fontBody: "\"Inter\", system-ui, sans-serif",
      fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      radius: "8px",
      spacing: "1.25rem",
      maxWidth: "860px"
    }
  }
};

export const DEFAULT_LAYOUT = "timeline";
export const DEFAULT_PRESET = "modern";

export function getPreset(id) {
  return PRESETS[id] || PRESETS[DEFAULT_PRESET];
}

export function getLayout(id) {
  return LAYOUTS[id] || LAYOUTS[DEFAULT_LAYOUT];
}
