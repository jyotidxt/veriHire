"use client";

import { useVeriHireAuth } from "@/components/auth-provider";

export function useAuth(required = true) {
  return useVeriHireAuth();
}
