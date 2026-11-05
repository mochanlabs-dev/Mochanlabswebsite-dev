// Shown only on Vercel preview builds (the dev site and branch previews), so a
// test site is never mistaken for the real one. Renders nothing in production
// and when running locally.
export default function DevBadge() {
  if (process.env.VERCEL_ENV !== "preview" && process.env.DEV_SITE !== "1") return null;
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg">
      {process.env.DEV_SITE === "1" || branch === "dev" ? "Dev site" : `Preview${branch ? ` · ${branch}` : ""}`}
    </div>
  );
}
