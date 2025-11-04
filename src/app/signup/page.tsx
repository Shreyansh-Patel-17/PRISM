"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");

  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!dob) {
      setError("Please select your date of birth");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, dob, skill }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Signup successful, but signin failed. Please sign in manually.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <section className="flex flex-col items-center justify-center flex-grow z-10 relative">
        <div className="bg-white/70 backdrop-blur-xl border border-pink-200/50 shadow-2xl rounded-2xl p-8 w-full max-w-md m-12">
          <h2 className="text-3xl font-bold mb-2 text-center text-pink-600 /* dark:text-pink-300 */">
          Create Account
          </h2>
          <p className="text-center text-gray-600 /* dark:text-pink-100 */ mb-6 text-sm">
          Join{" "}
          <span className="font-semibold text-pink-500 /* dark:text-pink-300 */">
          Prism
          </span>
          {" "}and start your AI-powered interview journey!
          </p>


          {error && <p className="text-red-500 text-center text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g., Narendra Modi"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g., primeminister@gmail.com"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            {/* Skills (Optional) */}
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Skills (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., React, Python, AI, ML"
                className="w-full p-3 rounded-lg border border-pink-200 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-6 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/signin")}
              className="text-pink-600 font-semibold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}
