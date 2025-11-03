"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {/* Sign In Card */}
        <div className="bg-white/70 /* dark:bg-gray-900/70 */ backdrop-blur-xl border border-pink-200/50 /* dark:border-rose-900/40 */ shadow-2xl rounded-2xl p-8 w-96 mt-10">
          <h1 className="text-3xl font-bold text-center text-pink-600 /* dark:text-pink-300 */ mb-2">
            Welcome Back 💫
          </h1>
          <p className="text-center text-gray-600 /* dark:text-pink-100 */ mb-6 text-sm">
            Sign in to continue exploring{" "}
            <span className="font-semibold text-pink-500 /* dark:text-pink-300 */">
              Prism
            </span>
          </p>

          {error && (
            <p className="text-red-500 text-center text-sm mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-pink-50 /* dark:bg-gray-800 */ border border-pink-200 /* dark:border-rose-900 */ placeholder-gray-400 text-gray-800 /* dark:text-pink-100 */ focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-pink-50 /* dark:bg-gray-800 */ border border-pink-200 /* dark:border-rose-900 */ placeholder-gray-400 text-gray-800 /* dark:text-pink-100 */ focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-gray-600 /* dark:text-pink-100 */ text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-pink-600 /* dark:text-pink-300 */ font-semibold cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}
