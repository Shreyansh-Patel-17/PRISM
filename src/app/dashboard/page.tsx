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

  if (status === "loading") return <p>Loading...</p>;

  return (
    <LayoutWrapper>
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 z-10 relative">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {session?.user?.name || "User"} 👋
        </h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </section>
    </LayoutWrapper>
  );
}
