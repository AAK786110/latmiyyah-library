"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";
import LatmiyyahForm from "@/components/LatmiyyahForm";

export default function NewLatmiyyahPage() {
  const ready = useRequireAuth();
  if (!ready) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Latmiyyah</h1>
      <LatmiyyahForm />
    </div>
  );
}
