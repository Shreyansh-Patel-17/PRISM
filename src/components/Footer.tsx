
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-rose-900/80 to-pink-900/80 backdrop-blur-xl border-t border-rose-900/40 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-gray-400 text-sm text-center sm:text-left mt-4 sm:mt-0">  
          <p className="text-xs text-gray-400 mt-1">
            &copy; {new Date().getFullYear()} PRISM. All rights reserved.
          </p>
        </div>
        <div className="text-gray-200 text-lg font-medium text-center ">
          <p className="font-semibold text-rose-300">
            Made with ❤️ by Team PRISM
          </p>
          <p className="text-xs text-pink-200 mt-1 tracking-wide">
            Shreyansh • Shubhangi • Manaswi • Tejas • Suleman
          </p>
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a className="text-pink-300 hover:text-rose-300 hover:underline text-sm transition">Privacy</a>
          <a className="text-pink-300 hover:text-rose-300 hover:underline text-sm transition">Terms</a>
          <a href="#" className="text-pink-300 hover:text-rose-300 hover:underline text-sm transition">About Us</a>
        </div>
      </div>
    </footer>
  );
}
