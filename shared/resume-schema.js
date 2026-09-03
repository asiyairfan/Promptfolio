export const RESUME_SCHEMA = {
  type: "object",
  required: ["name", "title", "summary", "contact", "experience", "education", "skills", "projects"],
  properties: {
    name: { type: "string", description: "Full name" },
    title: { type: "string", description: "Professional title / headline" },
    summary: { type: "string", description: "Short professional summary" },
    contact: {
      type: "object",
      properties: {
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        website: { type: "string" },
        avatarUrl: { type: "string" }
      }
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          organization: { type: "string" },
          dates: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          dates: { type: "string" },
          details: { type: "string" }
        }
      }
    },
    skills: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          link: { type: "string" }
        }
      }
    }
  }
};

export function emptyResume() {
  return {
    name: "",
    title: "",
    summary: "",
    contact: { email: "", phone: "", location: "", website: "", avatarUrl: "" },
    experience: [],
    education: [],
    skills: [],
    projects: []
  };
}

function ensureString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  return [];
}

function coerceObject(value, defaults) {
  if (!value || typeof value !== "object") return defaults;
  return defaults;
}

export function coerceResume(raw) {
  const warnings = [];
  const input = raw && typeof raw === "object" ? raw : {};

  const contact = {
    email: ensureString(input.contact?.email),
    phone: ensureString(input.contact?.phone),
    location: ensureString(input.contact?.location),
    website: ensureString(input.contact?.website),
    avatarUrl: ensureString(input.contact?.avatarUrl)
  };

  const experience = ensureArray(input.experience).map((item, idx) => {
    if (!item || typeof item !== "object") {
      warnings.push(`experience[${idx}] was not an object and was skipped`);
      return null;
    }
    return {
      role: ensureString(item.role),
      organization: ensureString(item.organization),
      dates: ensureString(item.dates),
      description: ensureString(item.description)
    };
  }).filter(Boolean);

  const education = ensureArray(input.education).map((item, idx) => {
    if (!item || typeof item !== "object") {
      warnings.push(`education[${idx}] was not an object and was skipped`);
      return null;
    }
    return {
      degree: ensureString(item.degree),
      institution: ensureString(item.institution),
      dates: ensureString(item.dates),
      details: ensureString(item.details)
    };
  }).filter(Boolean);

  const skills = ensureArray(input.skills).map((s, idx) => {
    const str = ensureString(s);
    if (!str) warnings.push(`skills[${idx}] was empty and was skipped`);
    return str;
  }).filter(Boolean);

  const projects = ensureArray(input.projects).map((item, idx) => {
    if (!item || typeof item !== "object") {
      warnings.push(`projects[${idx}] was not an object and was skipped`);
      return null;
    }
    return {
      name: ensureString(item.name),
      description: ensureString(item.description),
      link: ensureString(item.link)
    };
  }).filter(Boolean);

  const data = {
    name: ensureString(input.name),
    title: ensureString(input.title),
    summary: ensureString(input.summary),
    contact,
    experience,
    education,
    skills,
    projects
  };

  if (!data.name) warnings.push("Name was missing");
  if (!data.title && !data.summary) warnings.push("Title and summary were both missing");

  return { data, warnings };
}

export function schemaAsJson() {
  return JSON.stringify(RESUME_SCHEMA, null, 2);
}
