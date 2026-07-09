import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { VeriHireAuthProvider } from "@/components/auth-provider";
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const isClerkReady = publishableKey && publishableKey.length > 30 && !publishableKey.includes("placeholder") && !publishableKey.includes("Y2xlYW4tc2Fhcy04MC");

  const layoutContent = (
    <html lang="en" className="dark">
      <body className="antialiased bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-sans">
        <VeriHireAuthProvider required={true}>
          {children}
        </VeriHireAuthProvider>
      </body>
    </html>
  );

  if (isClerkReady) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        {layoutContent}
      </ClerkProvider>
    );
  }

  return layoutContent;
}
