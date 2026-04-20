"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton, useUser, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";

export default function Navbar() {
  const { user } = useUser();
  return (
    <nav className="fixed top-0 z-50 w-full bg-off-white/80 backdrop-blur-md border-b border-steel-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Achieve Academy Logo"
                width={32}
                height={32}
                className="w-55 h-55"
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
              Features
            </Link>
            {user && <Link href="/dashboard" className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
              Dashboard
            </Link>}
            <Link href="/about" className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
              About
            </Link>
            <Link href="/tutors" className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
              Find Tutors
            </Link>
            <Link href="/students" className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
              Become a Tutor
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ClerkLoading>
              <div className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-9 w-28 bg-gray-200 rounded-sm"></div>
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2 text-sm font-bold text-off-white bg-dark-navy hover:bg-coral transition-colors rounded-sm">
                    Get Started
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <span className="text-sm font-medium text-steel-blue">
                  Welcome back! {user?.firstName}
                </span>
                <UserButton afterSignOutUrl="/" />
              </Show>
            </ClerkLoaded>
          </div>
        </div>
      </div>
    </nav>
  );
}
