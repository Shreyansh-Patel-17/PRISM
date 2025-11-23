"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleResumeUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resume) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("email", session?.user?.email || "");

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadSuccess(true);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = () => {
    if (!uploadSuccess) {
      alert("Please upload your resume first.");
      return;
    }
    // Navigate to actual interview page
    router.push("/interview/live");
  };

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
          Upload your resume to get started with your{" "}
          <span className="font-semibold text-pink-600 /* dark:text-pink-300 */">
            AI-powered interview
          </span>{" "}
          experience.
        </p>

        {/* Resume Upload Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-pink-200/50 shadow-2xl rounded-2xl p-8 w-full max-w-md mb-8">
          <h3 className="text-xl font-bold text-pink-600 mb-4">Upload Your Resume</h3>

          {uploadSuccess ? (
            <div className="text-green-600 font-medium mb-4">
              ✅ Resume uploaded successfully!
            </div>
          ) : (
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Resume (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  className="w-full p-3 text-sm text-gray-700 bg-pink-50 border border-pink-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  (max size 5MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={isUploading || !resume}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Resume"
                )}
              </button>
            </form>
          )}
        </div>

        <button
          onClick={handleStartInterview}
          disabled={!uploadSuccess}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Interview
        </button>
      </section>
    </LayoutWrapper>
  );
}
