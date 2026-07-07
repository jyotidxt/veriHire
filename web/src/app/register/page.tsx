"use client";

import React from "react";
import Link from "next/link";
import { Shield, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-brand-violet/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <span>VeriHire</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight mt-4">Create your account</h2>
          <p className="text-sm text-slate-500">Protect your job application process using AI evaluations.</p>
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-normal">
            By creating an account, you agree to our terms of service and acknowledge that analyses do not provide legal status certifications.
          </div>

          <Link href="/dashboard" className="block w-full">
            <Button className="w-full justify-center gap-1">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0B0F19] px-2 text-slate-400">Or sign up with Clerk SSO</span>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2 border border-slate-200 dark:border-slate-800">
            <Shield className="w-4 h-4 text-brand-violet" />
            Clerk Authentication Provider
          </Button>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-violet hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
