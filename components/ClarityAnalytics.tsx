"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

let clarityInitialized = false;

export function ClarityAnalytics() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!projectId || clarityInitialized) {
      return;
    }

    clarity.init(projectId);
    clarityInitialized = true;
  }, []);

  return null;
}
