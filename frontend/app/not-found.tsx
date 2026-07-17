import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-slate-400">The requested AuraGen view is unavailable, but the experience is still ready to navigate.</p>
      <Link href="/dashboard" className="rounded-full bg-brand-600 px-4 py-2 text-sm text-white">
        Return to dashboard
      </Link>
    </div>
  );
}
