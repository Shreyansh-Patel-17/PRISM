"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  if (status === "loading") {
    return (
      <LayoutWrapper>
        <section className="flex flex-col items-center justify-center flex-1 text-center px-6 z-10 relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </section>
      </LayoutWrapper>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  return (
    <LayoutWrapper>
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 z-10 relative">
        <h1 className="text-3xl font-bold mb-4 text-pink-600">
          Welcome back, {session?.user?.name || "User"}! 🎉
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          You're successfully logged in. Ready to start your AI-powered interview journey?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/interview")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Start Interview
          </button>
          <button
            onClick={() => signOut()}
            className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600 transition-all"
          >
            Sign Out
          </button>
        </div>
      </section>
    </LayoutWrapper>
  );
}
