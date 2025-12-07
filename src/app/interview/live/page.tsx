"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type Question = {
  questionId?: string;
  text: string;
};

export default function LiveInterviewStyled() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [isMediaStarted, setIsMediaStarted] = useState(false);

  const { data: session } = useSession();

  // QUESTIONS
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // start camera & mic
  const startMedia = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.muted = true; // allow autoplay
        await videoRef.current.play().catch(() => {});
      }
      setMicOn(Boolean(s.getAudioTracks().length));
      setCamOn(Boolean(s.getVideoTracks().length));
      setIsMediaStarted(true);
    } catch (err) {
      console.error("media error", err);
      alert("Allow camera & microphone");
    }
  };

  // stop media
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMicOn(false);
    setCamOn(false);
    setIsMediaStarted(false);
  };

  // cleanup on unmount
  useEffect(() => {
    fetchQuestions(); // load questions once on mount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch questions from API (adjust endpoint if needed)
  async function fetchQuestions() {
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ /* optionally send userId or resumeId */ }),
      });
      if (!res.ok) {
        console.warn("Failed to fetch questions");
        return;
      }
      const data = await res.json();
      // assume data is an array of { questionId?, text }
      if (Array.isArray(data)) {
        setQuestions(data);
        setCurrentQuestionIdx(0);
      } else if (Array.isArray((data as any).questions)) {
        setQuestions((data as any).questions);
        setCurrentQuestionIdx(0);
      } else {
        console.warn("Unexpected questions response shape", data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  }

  // recording timer (visual only)
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // AUTO ADVANCE QUESTION
  useEffect(() => {
    if (!isRecording && questions.length > 0) {
      setCurrentQuestionIdx((i) => Math.min(i + 1, questions.length - 1));
    }
  }, [isRecording, questions.length]);

  // toggle camera
  const toggleCamera = async () => {
    if (!streamRef.current) {
      await startMedia();
      return;
    }
    const t = streamRef.current.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  // toggle mic
  const toggleMic = async () => {
    if (!streamRef.current) {
      await startMedia();
      return;
    }
    const t = streamRef.current.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  // start/stop recording (UI-only; integrate MediaRecorder as needed)
  const toggleRecording = async () => {
    if (!isMediaStarted) {
      await startMedia();
      // small delay to ensure tracks available
    }
    setIsRecording((r) => !r);
    // TODO: add MediaRecorder wiring to actually record
  };

  const endInterview = () => {
    const ok = confirm("End interview and save recordings?");
    if (!ok) return;
    stopMedia();
    if (typeof window !== "undefined") window.location.href = "/dashboard";
  };

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const prismAvatar = "/src/public/images/prism-avatar.jpg";

  // question navigation helpers
  const nextQuestion = () => {
    setCurrentQuestionIdx((i) => Math.min(i + 1, questions.length - 1));
  };
  const prevQuestion = () => {
    setCurrentQuestionIdx((i) => Math.max(i - 1, 0));
  };

  // replace inline SVGs with components
  const MicOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24" aria-hidden="true">
      <desc>Microphone ON 2 Streamline Icon</desc>
      <path fill="#ffffff" d="M17.113 15.5791 12 18.1357l-5.11304 -2.5566V3.81911L12 0.751312l5.113 3.067798V15.5791Z" strokeWidth="1"></path>
      <path fill="#bbd8ff" d="m17.1129 3.81909 -2.0452 1.5339v8.69221l-3.0678 1.5339 -3.06776 -1.5339 -2.0453 1.5339 5.11306 2.5565 5.113 -2.5565V3.81909Z" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M17.113 15.5791 12 18.1357l-5.11304 -2.5566V3.71691L12 0.751312l5.113 2.965598V15.5791Z" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M6.88696 7.90961h3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M3.81909 13.0226H20.1809" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M6.88696 5.86441h3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M17.113 5.86441h-3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M17.113 7.90961h-3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M6.88696 9.9548h3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M17.113 9.9548h-3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M3.81909 9.9548v6.5447L12 21.2035l8.1809 -4.6018V9.9548" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M12 21.2035v2.0452" strokeWidth="1"></path>
    </svg>
  );

  const MicOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24" aria-hidden="true">
      <desc>Microphone Mute Streamline Icon</desc>
      <path fill="#ffffff" d="M17.113 14.9656 12 17.5221l-5.11304 -2.5565V4.3304L12 1.2626l5.113 3.0678v10.6352Z" strokeWidth="1"></path>
      <path fill="#bbd8ff" d="m17.113 6.88699 -2.0452 2.0452v4.60171L12 15.0678l-2.04519 -1.0226 -1.7385 1.7384L12 17.6244l5.113 -2.5566V6.88699Z" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M0.751343 23.2487 23.2487 0.751312" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M12 20.1809v3.0678" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M4.84167 9.9548v6.1356" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m8.93225 18.647 3.06785 1.5339 7.1583 -3.5792V9.9548" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M16.4995 3.9214 12 1.2626 6.88696 4.2282v9.817" strokeWidth="1"></path>
      <path stroke="#092f63" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m10.6707 16.9085 1.3294 0.6136 5.113 -2.5565V9.9548" strokeWidth="1"></path>
    </svg>
  );

  // Camera icons (added)
  const CameraOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-6 h-6" aria-hidden="true">
      <desc>Webcam Video Circle (on)</desc>
      <g>
        <path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M7 13.5c3.5899 0 6.5 -2.9101 6.5 -6.5C13.5 3.41015 10.5899 0.5 7 0.5 3.41015 0.5 0.5 3.41015 0.5 7c0 3.5899 2.91015 6.5 6.5 6.5Z" strokeWidth="1"></path>
        <path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="m10.1348 5.24945 -1.51894 0.67327v-0.80793c0 -0.14285 -0.05675 -0.27985 -0.15776 -0.38086 -0.10101 -0.10101 -0.23801 -0.15776 -0.38086 -0.15776H4.03758c-0.14285 0 -0.27985 0.05675 -0.38086 0.15776 -0.10101 0.10101 -0.15776 0.23801 -0.15776 0.38086v3.77035c0 0.14285 0.05675 0.27985 0.15776 0.38086 0.10101 0.10101 0.23801 0.15776 0.38086 0.15776h4.03966c0.14285 0 0.27985 -0.05675 0.38086 -0.15776 0.10101 -0.10101 0.15776 -0.23801 0.15776 -0.38086v-0.80793l1.51894 0.67327c0.0409 0.0158 0.0851 0.02136 0.1287 0.01618 0.0436 -0.00518 0.0852 -0.02093 0.1214 -0.04589 0.0361 -0.02495 0.0655 -0.05836 0.0858 -0.0973 0.0202 -0.03895 0.0306 -0.08225 0.0303 -0.12614V5.5026c0.0003 -0.04389 -0.0101 -0.0872 -0.0303 -0.12614 -0.0203 -0.03894 -0.0497 -0.07235 -0.0858 -0.0973 -0.0362 -0.02496 -0.0778 -0.04071 -0.1214 -0.04589 -0.0436 -0.00518 -0.0878 0.00038 -0.1287 0.01618Z" strokeWidth="1"></path>
      </g>
    </svg>
  );

  const CameraOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-6 h-6" aria-hidden="true">
      <desc>Webcam Video Off</desc>
      <g>
        <path fill="#000000" fillRule="evenodd" d="M0.21967 1.28033c-0.2928931 -0.292893 -0.2928931 -0.767767 0 -1.06066 0.292893 -0.2928933 0.767767 -0.2928933 1.06066 0L3.06066 2H9c0.82843 0 1.5 0.67157 1.5 1.5v0.74173l2.1061 -0.90261c0.6598 -0.2828 1.3939 0.20123 1.3939 0.91915v5.48346c0 0.71787 -0.7341 1.20197 -1.3939 0.91917l-1.548 -0.66343 2.7222 2.72223c0.2929 0.2929 0.2929 0.7677 0 1.0606 -0.2929 0.2929 -0.7677 0.2929 -1.0606 0L0.21967 1.28033ZM0 3.5c0 -0.19925 0.0388484 -0.38942 0.109384 -0.56336L9.16389 11.9911C9.11007 11.997 9.05538 12 9 12H1.5C0.671573 12 0 11.3284 0 10.5v-7Z" clipRule="evenodd" strokeWidth="1"></path>
      </g>
    </svg>
  );

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-pink-600">Live Interview</h1>
              <p className="text-gray-600">Speak confidently — your session is being recorded and evaluated.</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="px-3 py-2 bg-white rounded-lg shadow text-sm font-semibold">10 mins</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: speaker card with avatar + waveform + question box */}
            <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-pink-100 shadow-xl p-8 flex items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <img src={prismAvatar} alt="Prism" className="w-16 h-16 rounded-full ring-2 ring-pink-200 object-cover" />
                  <div>
                    <div className="text-sm text-gray-500">PRISM</div>
                    <div className="text-lg font-semibold text-gray-800">Your AI Interviewer</div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 w-full">
                  <div className="flex-1">
                    <div className="text-2xl font-semibold text-gray-800 mb-2">Speaking...</div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-inner">
                        <img src={prismAvatar} alt="prism" className="w-16 h-16 rounded-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-end gap-1 h-14">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-pink-400 rounded-sm"
                              style={{
                                width: 6,
                                height: `${20 + ((i % 6) * 8)}px`,
                                opacity: 0.9,
                                transition: "height 250ms ease",
                                animation: `pulseWave 1.2s ${i * 40}ms infinite`,
                              }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          Time elapsed <span className="font-semibold text-gray-800 ml-2">{formatTime(seconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NEW: Small question box (now below the waveform) */}
                  <div className=" w-11/12 bg-white rounded-lg border border-pink-50 shadow p-4 mt-8 self-start">
                    <div className="text-xs text-gray-500 mb-2">Current Question</div>

                    <div className="min-h-[72px] text-sm text-gray-800">
                      {questions.length ? (
                        <p>{questions[currentQuestionIdx]?.text}</p>
                      ) : (
                        <p className="text-gray-400">No questions loaded. They will appear here.</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500">{questions.length ? `${currentQuestionIdx + 1} of ${questions.length}` : ""}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={prevQuestion}
                          disabled={currentQuestionIdx === 0}
                          className="px-2 py-1 text-xs rounded bg-white border shadow disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={nextQuestion}
                          disabled={currentQuestionIdx >= questions.length - 1}
                          className="px-2 py-1 text-xs rounded bg-pink-500 text-white shadow disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <button
                        onClick={fetchQuestions}
                        className="w-full text-xs py-1 rounded border border-dashed text-gray-600 hover:bg-gray-50"
                      >
                        Reload Questions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: curved live feed box (video surface) */}
            <div className="relative">
              <div
                className="relative overflow-hidden shadow-2xl flex items-center justify-center"
                style={{
                  borderRadius: "24px 24px",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,240,245,0.9))",
                  border: "1px solid rgba(245, 203, 219, 0.6)",
                  minHeight: 345,
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ borderRadius: "24px 24px" }}
                />

                <div className="absolute top-4 left-4 z-10">
                  <div className="text-xs text-gray-500">Software Developer</div>
                  <div className="text-lg font-semibold text-gray-800">{session?.user?.name || "User"}</div>
                </div>

                {/* CENTER-BOTTOM: only 4 buttons */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 flex items-center gap-3 bg-white/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/60">
                  {/* Mic On/Off */}
                  <button
                    onClick={toggleMic}
                    aria-label="Toggle microphone"
                    className="w-12 h-12 flex items-center justify-center rounded-full transition shadow bg-white"
                  >
                    {micOn ? <MicOnIcon /> : <MicOffIcon />}
                  </button>

                  {/* Video On/Off */}
                  <button
                    onClick={toggleCamera}
                    aria-label="Toggle camera"
                    className="w-12 h-12 flex items-center justify-center rounded-full transition shadow bg-white"
                  >
                    {camOn ? <CameraOnIcon /> : <CameraOffIcon />}
                  </button>

                  {/* Recording On/Off */}
                  <button
                    onClick={toggleRecording}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition shadow ${isRecording ? "bg-red-500 text-white" : "bg-white"}`}
                  >
                    {isRecording ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                    )}
                  </button>

                  {/* Hangup - redirect to dashboard */}
                  <button
                    onClick={endInterview}
                    aria-label="Hangup"
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:scale-105 transition shadow"
                  >
                    <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5V21a1 1 0 01-1.37.93A19.94 19.94 0 012 12 19.94 19.94 0 0119.63 2.07 1 1 0 0121 3v4.5z"/></svg>
                  </button>
                </div>

                <div className="absolute left-4 bottom-4 z-20 bg-white/80 px-3 py-1 rounded-md text-xs shadow">
                  <span className="font-semibold text-gray-800">{formatTime(seconds)}</span>
                </div>
              </div>
                {/* bottom floating stats (position inside relative parent) */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-28 w-max z-10">
                  <div className="bg-white rounded-full shadow-lg px-6 py-3 flex items-center gap-6 border border-pink-50">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold text-pink-600">10 MIN</div>
                    <div className="h-6 w-px bg-gray-100" />
                    <div className="text-xs text-gray-500">Avg Questions</div>
                    <div className="font-semibold">12</div>
                    <div className="h-6 w-px bg-gray-100" />
                    <div className="text-xs text-gray-500">Job Title</div>
                    <div className="font-semibold">Frontend Developer</div>
                  </div>
                </div>
              <div className="h-12" />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulseWave {
          0% { transform: scaleY(0.4); opacity: 0.6; }
          50% { transform: scaleY(1.1); opacity: 1; }
          100% { transform: scaleY(0.6); opacity: 0.7; }
        }
      `}</style>
    </LayoutWrapper>
  );
}
