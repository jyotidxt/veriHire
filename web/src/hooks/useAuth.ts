"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export function useAuth(required = true) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem("verihire_user");
        if (stored) {
          const parsed = JSON.parse(stored) as UserSession;
          setUser(parsed);
        } else if (required && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [required, router, pathname]);

  const loginSession = (email: string, name?: string) => {
    const formattedId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sessionUser: UserSession = {
      id: formattedId,
      email: email.toLowerCase(),
      name: name || email.split("@")[0]
    };
    localStorage.setItem("verihire_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    router.push("/dashboard");
  };

  const logoutSession = () => {
    localStorage.removeItem("verihire_user");
    setUser(null);
    router.push("/login");
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!user) return {};
    return {
      "x-user-id": user.id,
      "x-user-name": user.name,
      "x-user-email": user.email
    };
  };

  return {
    user,
    loading,
    loginSession,
    logoutSession,
    getAuthHeaders
  };
}
