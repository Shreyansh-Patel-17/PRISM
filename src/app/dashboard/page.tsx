"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

type SkillScoresResponse = {
  skillScores: Record<string, number>; // 0–100
};

type SkillScore = {
  skill: string;
  score: number;
};

export default function Dashboard() {
  // ---- hooks always declared first ----
  const { data: session, status } = useSession();
  const router = useRouter();

  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Fetch skill scores whenever session becomes authenticated
  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const fetchScores = async () => {
      try {
        setLoadingScores(true);
        const res = await fetch("/api/skill-scores");
        if (!res.ok) {
          console.warn("Failed to load skill scores");
          if (!cancelled) setSkillScores([]);
          return;
        }
        const data: SkillScoresResponse = await res.json();
        const entries = Object.entries(data.skillScores || {});
        const mapped: SkillScore[] = entries.map(([skill, score]) => ({
          skill,
          score: typeof score === "number" ? score : Number(score) || 0,
        }));
        if (!cancelled) setSkillScores(mapped);
      } catch (e) {
        console.error("Error loading skill scores:", e);
        if (!cancelled) setSkillScores([]);
      } finally {
        if (!cancelled) setLoadingScores(false);
      }
    };

    fetchScores();

    return () => {
      cancelled = true;
    };
  }, [status]);

  // Redirect unauthenticated users (effect declared after hooks — fine)
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  // Derived values — also declared here so hooks order is stable
  const sortedByScoreDesc = useMemo(
    () => [...skillScores].sort((a, b) => b.score - a.score),
    [skillScores]
  );

  const bestSkills = useMemo(() => sortedByScoreDesc.slice(0, 3), [sortedByScoreDesc]);
  const weakestSkills = useMemo(() => [...sortedByScoreDesc].reverse().slice(0, 3), [sortedByScoreDesc]);

  const overallScore = useMemo(() => {
    if (!skillScores.length) return 0;
    const sum = skillScores.reduce((acc, s) => acc + s.score, 0);
    return sum / skillScores.length;
  }, [skillScores]);

  const totalSkills = skillScores.length;

  // ---- early returns after all hooks are declared ----
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
    return null; // navigation handled by effect
  }

  // ---- render UI (unchanged layout) ----
  return (
    <LayoutWrapper>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-pink-50 via-rose-50 to-white py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header / Hero Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-pink-600 tracking-tight">
                Welcome back, {session?.user?.name || "User"}! 🎉
              </h1>
              <p className="mt-2 text-gray-600 max-w-xl">
                Here&apos;s a quick overview of your interview readiness based on your
                resume skills and recent interview responses.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/interview")}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:opacity-90 transition-all text-sm md:text-base"
              >
                Let&apos;s Start Again
              </button>
            </div>
          </div>

          {/* If no scores yet */}
          {!loadingScores && !skillScores.length && (
            <div className="mt-6 rounded-2xl border border-dashed border-pink-200 bg-white/70 p-6 text-center">
              <p className="text-gray-700 font-medium">No skill insights yet. 👀</p>
              <p className="text-gray-500 mt-1">
                Take your first AI-powered interview to see which skills are your
                superpowers and which ones need more practice.
              </p>
              <button
                onClick={() => router.push("/interview")}
                className="mt-4 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
              >
                Start Interview
              </button>
            </div>
          )}

          {/* Main dashboard content */}
          {loadingScores && (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="h-32 rounded-2xl bg-white/70 shadow animate-pulse" />
              <div className="h-32 rounded-2xl bg-white/70 shadow animate-pulse" />
              <div className="h-32 rounded-2xl bg-white/70 shadow animate-pulse" />
            </div>
          )}

          {!!skillScores.length && (
            <>
              {/* Top stats cards */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Overall readiness */}
                <div className="rounded-2xl bg-white/80 border border-pink-100 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Overall Readiness</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-500 font-semibold">Interview Score</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-pink-600">
                        {overallScore.toFixed(1)}
                        <span className="text-base text-gray-400"> / 100</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Based on your evaluated skills so far.</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-pink-100 opacity-60" />
                      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-inner">
                        <span className="text-sm font-semibold text-pink-600">{Math.round(overallScore)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total skills */}
                <div className="rounded-2xl bg-white/80 border border-pink-100 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Skills Evaluated</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-emerald-600">{totalSkills}</div>
                    <p className="text-xs text-gray-500 mt-1">From your resume and interview responses.</p>
                  </div>
                </div>

                {/* Highlight suggestion */}
                <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-medium opacity-90">Highlight This In Your Resume</div>
                    {bestSkills.length ? (
                      <div className="mt-3 space-y-1">
                        {bestSkills.map((s) => (
                          <div key={s.skill} className="flex items-center justify-between text-sm">
                            <span>{s.skill}</span>
                            <span className="font-semibold">{s.score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm opacity-90">Take an interview to see your strongest skills.</p>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] opacity-80">These are the skills where you performed best. Make sure they are clearly visible in your resume and LinkedIn.</p>
                </div>
              </div>

              {/* Bottom: Chart + weakest/best sections */}
              <div className="grid gap-8 lg:grid-cols-3 mt-6">
                {/* Skill chart (2 columns wide) */}
                <div className="lg:col-span-2 rounded-2xl bg-white/80 border border-pink-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Skill Strength Chart</h2>
                      <p className="text-xs text-gray-500">Each bar shows your current score out of 100 for that skill.</p>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-pink-50 text-pink-500 font-medium">Higher bar = stronger skill</span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {sortedByScoreDesc.map(({ skill, score }) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{skill}</span>
                          <span className="text-gray-500">{score.toFixed(1)} / 100</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-pink-50 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400" style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak skills card */}
                <div className="rounded-2xl bg-white/80 border border-pink-100 shadow-sm p-6 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800">Skills Needing Attention</h2>
                  <p className="text-xs text-gray-500 mt-1">Focus here to improve your overall interview performance.</p>

                  <div className="mt-4 space-y-3 flex-1">
                    {weakestSkills.map(({ skill, score }) => (
                      <div key={skill} className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2">
                        <div>
                          <div className="text-sm font-semibold text-rose-600">{skill}</div>
                          <div className="text-[11px] text-rose-500">Current score: {score.toFixed(1)} / 100</div>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-white text-rose-500 font-medium">Practice more</span>
                      </div>
                    ))}
                    {!weakestSkills.length && <p className="text-xs text-gray-500">Once you complete interviews, we&apos;ll show which skills need improvement.</p>}
                  </div>

                  <div className="mt-3 text-[11px] text-gray-500">Tip: Choose one weak skill and practice 2–3 questions on it before your next interview.</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
