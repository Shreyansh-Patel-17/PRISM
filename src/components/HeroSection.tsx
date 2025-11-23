"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeroSection() {
  const { data: session, status } = useSession();
  const target = status === "authenticated" ? "/interview" : "/signin";

  return (
    <>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg text-pink-600">
        Welcome to <span className="text-rose-500">PRISM</span>
      </h1>

      <p className="text-gray-700 mb-10 max-w-2xl text-lg md:text-xl leading-relaxed">
        Your personal{" "}
        <span className="font-semibold text-pink-600">
          AI-powered Interview Assistant.
        </span>
        Upload your resume, practice mock interviews, and get real-time
        AI-driven feedback to help you shine in your next opportunity.
      </p>
      <div className="flex gap-4">
        <Link
          href={target}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-md hover:opacity-90 transition"
        >
          Get Started
        </Link>
      </div>
    </>
  );
}
