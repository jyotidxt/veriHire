import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "VeriHire | AI Job Verification SaaS & Chrome Extension",
  description: "Navigate your job search with absolute trust. Analyze LinkedIn job postings, verify credentials, and apply safely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Safe fallback if Clerk envs are not yet set, letting the app compile and run locally.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder_key";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="dark">
        <body className="antialiased bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
