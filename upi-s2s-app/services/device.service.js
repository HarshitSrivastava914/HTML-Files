import UAParser from "ua-parser-js";

export const detectDevice = (userAgent = "") => {
  const parser = new UAParser(userAgent || "");

  const deviceType = parser.getDevice()?.type; // mobile / tablet / undefined
  const os = parser.getOS()?.name?.toLowerCase() || ""; // android / ios / windows
  const isMobile = deviceType === "mobile" || deviceType === "tablet";

  if (!isMobile) return "desktop";
  if (os.includes("android")) return "android";
  if (os.includes("ios")) return "ios";

  // fallback mobile
  return "mobile";
};
