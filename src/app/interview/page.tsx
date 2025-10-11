import LayoutWrapper from "@/components/LayoutWrapper";

export default function InterviewPage() {
  return (
    <LayoutWrapper>
      {/* Decorative background orbs */}
      <div className="absolute top-[-10rem] left-[-10rem] w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10rem] right-[-10rem] w-96 h-96 bg-rose-200/40 rounded-full blur-3xl"></div>

      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 z-10 relative">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 drop-shadow-lg text-pink-600">
          Interview Mode
        </h2>
        <p className="text-gray-700 /* dark:text-pink-100 */ mb-10 max-w-xl text-lg md:text-xl leading-relaxed">
          This is where your{" "}
          <span className="font-semibold text-pink-600 /* dark:text-pink-300 */">
            AI interview model
          </span>{" "}
          will be integrated later.
        </p>
        <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:opacity-90 transition-all duration-200">
          Start Interview
        </button>
      </section>
    </LayoutWrapper>
  );
}
