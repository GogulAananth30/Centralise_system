import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center max-w-2xl border border-white/20">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600 dark:text-blue-400 drop-shadow-sm">Smart Student Hub</h1>
        <p className="mb-8 text-xl text-blue-900 dark:text-blue-200 font-medium">
          The ultimate centralized platform for managing your academic journey, achievements, and mentorship.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Login
          </Link>
          <Link href="/register" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full border-2 border-blue-600 hover:bg-blue-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
