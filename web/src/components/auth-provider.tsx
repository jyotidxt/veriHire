"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  loginSession: (email: string, name?: string) => void;
  logoutSession: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clerk-enabled Inner Provider Component (Only rendered when valid Clerk keys are detected)
function ClerkAuthInner({ children, required }: { children: React.ReactNode; required?: boolean }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (isSignedIn && clerkUser) {
      const activeUser: UserSession = {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatarUrl: clerkUser.imageUrl || "",
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }) : "Recently"
      };
      setUser(activeUser);
      setLoading(false);
      localStorage.setItem("verihire_user", JSON.stringify(activeUser));
    } else {
      setUser(null);
      setLoading(false);
      if (required && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [clerkUser, isLoaded, isSignedIn, required, pathname, router]);

  const logoutSession = async () => {
    localStorage.removeItem("verihire_user");
    setUser(null);
    if (isSignedIn) {
      try {
        await signOut();
      } catch (e) {
        console.warn("Clerk signOut failed:", e);
      }
    }
    router.push("/");
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!user) return {};
    return {
      "x-user-id": user.id,
      "x-user-email": user.email,
      "x-user-name": user.name
    };
  };

  const loginSession = (email: string, name?: string) => {
    // Redirect / bypass logic for local checks
  };

  return (
    <AuthContext.Provider value={{ user, loading: loading || !isLoaded, loginSession, logoutSession, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

// Local Session-based Fallback Provider Component (Rendered for offline local development testing)
function LocalAuthInner({ children, required }: { children: React.ReactNode; required?: boolean }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("verihire_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
      if (required && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
        router.push("/login");
      }
    }
    setLoading(false);
  }, [required, pathname, router]);

  const loginSession = (email: string, name?: string) => {
    const formattedId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sessionUser: UserSession = {
      id: formattedId,
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      avatarUrl: "",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    };
    localStorage.setItem("verihire_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    router.push("/dashboard");
  };

  const logoutSession = async () => {
    localStorage.removeItem("verihire_user");
    setUser(null);
    router.push("/");
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!user) return {};
    return {
      "x-user-id": user.id,
      "x-user-email": user.email,
      "x-user-name": user.name
    };
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginSession, logoutSession, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

// Main Selector wrapper determining dynamic auth context layout structures
export function VeriHireAuthProvider({ children, required = true }: { children: React.ReactNode; required?: boolean }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const isClerkReady = !!(key && key.length > 30 && !key.includes("placeholder") && !key.includes("Y2xlYW4tc2Fhcy04MC"));

  if (isClerkReady) {
    return <ClerkAuthInner required={required}>{children}</ClerkAuthInner>;
  }

  return <LocalAuthInner required={required}>{children}</LocalAuthInner>;
}

export function useVeriHireAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useVeriHireAuth must be used within a VeriHireAuthProvider");
  }
  return context;
}
