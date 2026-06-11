import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <div className="text-6xl mb-4">⛔</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. If you expected access, sign in with an admin account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
          <Link
            href="/admin"
            className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
