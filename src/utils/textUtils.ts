// src/utils/textUtils.ts

export const normalizeItem = (text: string): string => {
  if (!text) return "";

  let normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

  // Basic singularization rules
  if (normalized.endsWith("ies")) {
    normalized = normalized.slice(0, -3) + "y"; // e.g., berries -> berry
  } else if (normalized.endsWith("oes")) {
    normalized = normalized.slice(0, -2); // e.g., tomatoes -> tomato
  } else if (normalized.endsWith("sses")) {
    normalized = normalized.slice(0, -2); // e.g., glasses -> glass
  } else if (
    normalized.endsWith("ches") ||
    normalized.endsWith("shes") ||
    normalized.endsWith("xes")
  ) {
    normalized = normalized.slice(0, -2); // e.g., crunches -> crunch
  } else if (
    normalized.endsWith("s") &&
    !normalized.endsWith("ss") && // e.g., glass
    !normalized.endsWith("is") && // e.g., mantis
    !normalized.endsWith("us") // e.g., citrus
  ) {
    normalized = normalized.slice(0, -1); // e.g., green teas -> green tea
  }

  return normalized;
};
