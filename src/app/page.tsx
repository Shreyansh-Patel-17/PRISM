export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Prism</h1>
      <p className="text-gray-600 mb-6">Your AI Interview Assistant</p>
      <a
        href="/signin"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Get Started
      </a>
    </main>
  );
}
