export function getDataSource(): "mock" | "firebase" {
  if (typeof process === "undefined") return "mock";
  const use = process.env.NEXT_PUBLIC_USE_FIREBASE === "true";
  const has =
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return use && has ? "firebase" : "mock";
}
