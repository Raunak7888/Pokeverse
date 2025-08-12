import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500 to-indigo-500 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
        <p className="mt-4 text-lg">
          This is a simple example of a Next.js application.
        </p>
        <div className="flex flex-col items-center mt-6">
          <Link
            href="/auth"
            className="mt-6 inline-block bg-white text-indigo-500 px-4 py-2 rounded shadow hover:bg-gray-100 transition duration-200"
          >
            Go to Auth Page
          </Link>
          <Link
            href="/quiz"
            className="mt-6 inline-block bg-white text-indigo-500 px-4 py-2 rounded shadow hover:bg-gray-100 transition duration-200"
          >
            Go to Quiz Page
          </Link>
        </div>
      </div>
    </main>
  );
}
