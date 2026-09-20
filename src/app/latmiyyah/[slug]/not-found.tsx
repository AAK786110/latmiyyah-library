import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-semibold">Latmiyyah not found</h1>
      <p className="mt-2 text-muted">It may have been unpublished or moved.</p>
      <Link href="/search" className="mt-4 inline-block text-accent hover:underline">
        Back to Search
      </Link>
    </div>
  );
}
