"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  targetUserId: string;
}

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("FollowButton mounted with targetUserId:", targetUserId);
    
    // Get current user ID
    fetch("/api/me")
      .then(res => {
        console.log("/api/me response:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Current user data:", data);
        if (data?.user?.id) {
          setCurrentUserId(data.user.id);
          if (data.user.id !== targetUserId) {
            checkFollowingStatus(data.user.id);
          } else {
            console.log("Same user, hiding button");
            setChecking(false);
          }
        } else {
          console.log("No user logged in");
          setChecking(false);
        }
      })
      .catch(err => {
        console.error("Error fetching current user:", err);
        setChecking(false);
      });
  }, [targetUserId]);

  async function checkFollowingStatus(userId: string) {
    try {
      console.log("Checking follow status for:", userId, "->", targetUserId);
      const res = await fetch(`/api/users/${targetUserId}/follow/status?follower_id=${userId}`);
      console.log("Follow status response:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Follow status data:", data);
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setChecking(false);
    }
  }

  async function handleFollow() {
    if (!currentUserId) {
      alert("Please sign in to follow users");
      return;
    }

    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id: currentUserId }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      alert("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  }

  // Always render something for debugging
  if (checking) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!currentUserId || currentUserId === targetUserId) {
    return (
      <div className="text-xs text-gray-500">
        {currentUserId === targetUserId ? "This is you" : "Sign in to follow"}
      </div>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
