"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reports each page view to the analytics API (the pages themselves are static
// files, so the server never sees them). Skipped on localhost.
export default function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    try {
      const body = new Blob([JSON.stringify({ page: pathname })], { type: "application/json" });
      navigator.sendBeacon("/api/visit", body);
    } catch {
      // Analytics must never get in the way.
    }
  }, [pathname]);

  return null;
}
