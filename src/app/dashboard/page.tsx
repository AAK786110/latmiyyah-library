"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Latmiyyah } from "@/lib/types";

export default function DashboardPage() {
  const ready = useRequireAuth();
  const supabase = createClient();
  const [items, setItems] = useState<Latmiyyah[]>([]);
  const [query, setQuery] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [pendingEdits, setPendingEdits] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Latmiyyah | null>(null);

  async function load() {
    const { data } = await supabase.from("latmiyyahs").select("*").order("title");
    setItems(data || []);
    const { count: subCount } = await supabase
      .from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: editCount } = await supabase
      .from("edit_suggestions").select("*", { count: "exact", head: true }).eq("status", "pending");
    setPendingSubmissions(subCount || 0);
    setPendingEdits(editCount || 0);
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function togglePublish(item: Latmiyyah) {
    const nextStatus = item.status === "published" ? "draft" : "published";
    await supabase.from("latmiyyahs").update({ status: nextStatus }).eq("id", item.id);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("latmiyyahs").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  if (!ready) return null;

  const published = items.filter((i) => i.status === "published").length;
  const drafts = items.filter((i) => i.status === "draft").length;
  const filtered = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Creator Dashboard</h1>
        <Link href="/dashboard/new" className="rounded bg-accent px-4 py-2 text-sm text-accentFg">
          + New Latmiyyah
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Published" value={published} />
        <StatCard label="Drafts" value={drafts} />
        <Link href="/dashboard/submissions">
          <StatCard label="Pending Submissions" value={pendingSubmissions} />
        </Link>
        <Link href="/dashboard/edits">
          <StatCard label="Pending Edit Suggestions" value={pendingEdits} />
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your latmiyyahs..."
        className="mb-4 w-full rounded border border-border bg-surface px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-muted">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Reciter</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3">{item.title}</td>
                <td className="p-3 text-muted">{item.reciter}</td>
                <td className="p-3">
                  <span className={item.status === "published" ? "text-accent" : "text-muted"}>
                    {item.status}
                  </span>
                </td>
                <td className="space-x-3 p-3">
                  <Link href={`/latmiyyah/${item.slug}`} className="hover:underline">Preview</Link>
                  <Link href={`/dashboard/edit/${item.id}`} className="hover:underline">Edit</Link>
                  <button onClick={() => togglePublish(item)} className="hover:underline">
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-muted">No latmiyyahs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
            <p className="font-medium">Delete "{deleteTarget.title}"?</p>
            <p className="mt-1 text-sm text-muted">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded px-3 py-1.5 text-sm">Cancel</button>
              <button onClick={confirmDelete} className="rounded bg-red-500 px-3 py-1.5 text-sm text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
