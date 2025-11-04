
"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div
      className="
        min-h-screen flex flex-col relative overflow-hidden
        bg-gradient-to-br from-pink-100 via-rose-50 to-cream-100
        /* dark:bg-gradient-to-r dark:from-gray-900 dark:via-rose-900/80 dark:to-pink-900/80 */
        /* dark:backdrop-blur-xl dark:border-t dark:border-rose-900/40 */
        text-gray-800 /* dark:text-pink-100 */
      "
    >
      {/* Decorative background orbs */}
      <div className="
        absolute top-[-10rem] left-[-10rem] w-72 h-72
        rounded-full blur-3xl
        bg-pink-200/30 /* dark:bg-rose-900/40 */
        pointer-events-none
      "></div>
      <div className="
        absolute bottom-[-10rem] right-[-10rem] w-96 h-96
        rounded-full blur-3xl
        bg-rose-200/40 /* dark:bg-pink-900/40 */
        pointer-events-none
      "></div>

      <Navbar />
      {/* Add top padding equal to navbar height */}
      <main className="flex-1 pt-20 z-10 relative">{children}</main>
      <Footer />
    </div>
  );
}
