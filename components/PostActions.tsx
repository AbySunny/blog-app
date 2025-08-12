"use client";

import { useState } from "react";

type Props = {
  postId: string;
  initialLikes?: number;
  initialShares?: number;
};

export default function PostActions({ postId, initialLikes = 0, initialShares = 0 }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [liking, setLiking] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function getUserId() {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();
    return data?.user?.id || null;
  }

  async function like() {
    const user_id = await getUserId();
    if (!user_id) return alert("Sign in first.");
    setLiking(true);
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      setLikes((n) => n + 1);
    } finally {
      setLiking(false);
    }
  }

  async function unlike() {
    const user_id = await getUserId();
    if (!user_id) return alert("Sign in first.");
    setLiking(true);
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      setLikes((n) => Math.max(0, n - 1));
    } finally {
      setLiking(false);
    }
  }

  async function share() {
    const user_id = await getUserId();
    if (!user_id) return alert("Sign in first.");
    setSharing(true);
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      setShares((n) => n + 1);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex items-center gap-3 mt-4">
      <button onClick={like} disabled={liking} className="rounded bg-foreground text-background px-3 py-1">
        {liking ? "Liking..." : `Like (${likes})`}
      </button>
      <button onClick={unlike} disabled={liking} className="rounded border px-3 py-1">
        {liking ? "…" : "Unlike"}
      </button>
      <button onClick={share} disabled={sharing} className="rounded border px-3 py-1">
        {sharing ? "Sharing..." : `Share (${shares})`}
      </button>
    </div>
  );
}
