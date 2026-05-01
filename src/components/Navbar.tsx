"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton, useUser, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/tutors", label: "Find Tutors" },
    { href: "/students", label: "Find Students" },
  ];

  if (user) {
    navLinks.unshift({ href: "/dashboard", label: "Dashboard" });
  }

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
                className="w-8 h-8"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
                <div className="hidden sm:flex items-center gap-4">
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
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline text-sm font-medium text-steel-blue">
                    Welcome back! {user?.firstName}
                  </span>
                  <UserButton />
                </div>
              </Show>
            </ClerkLoaded>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-dark-navy hover:text-coral transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-steel-blue/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-4 text-sm font-medium text-steel-blue hover:text-dark-navy transition-colors border-b border-gray-50 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Show when="signed-out">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <SignInButton mode="modal">
                  <button className="py-3 text-sm font-medium text-steel-blue border border-steel-blue/20 rounded-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="py-3 text-sm font-bold text-white bg-dark-navy rounded-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      )}
    </nav>
  );
}
