import Navbar from "@/components/Navbar";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function SignUpPage() {
  return (
    <LayoutWrapper>
      <section className="flex flex-col items-center justify-center flex-grow z-10 relative">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-pink-200/50 dark:border-rose-900/40 shadow-2xl rounded-2xl p-8 w-96 mt-12">
          <h2 className="text-3xl font-bold mb-2 text-center text-pink-600 dark:text-pink-300">Create Account</h2>
          <p className="text-center text-gray-600 dark:text-pink-100 mb-6 text-sm">
            Join{" "}
            <span className="font-semibold text-pink-500 dark:text-pink-300">Prism</span>
            {" "}and start your AI-powered interview journey!
          </p>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded-lg bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-rose-900 placeholder-gray-400 dark:placeholder-pink-100 text-gray-800 dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-rose-900 placeholder-gray-400 dark:placeholder-pink-100 text-gray-800 dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-rose-900 placeholder-gray-400 dark:placeholder-pink-100 text-gray-800 dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Sign Up
            </button>
          </form>
          <p className="text-gray-600 dark:text-pink-100 text-center mt-6 text-sm">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-pink-600 dark:text-pink-300 font-semibold cursor-pointer hover:underline"
            >
              Sign In
            </a>
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}
