export const formatLabel = (text) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
