"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import React, { useEffect, useRef, useState } from "react";

function TipTapDemo() {
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [toolbarOffset, setToolbarOffset] = useState<number>(64);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    // optional size check: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Max 5MB.");
      return;
    }
    setCoverFile(file);
    setCoverPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  }

  async function handleAddBlog() {
    setMessage(null);
    setError(null);

    const content = localStorage.getItem("blog-content") || "";
    if (!title.trim()) return setError("Please enter a title.");
    if (!content.trim()) return setError("Please write some content in the editor.");

    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    const user_id = auth?.id || auth?.user_id || "00000000-0000-0000-0000-000000000000";

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        title: title.trim(),
        content_html: content,
        cover_image_url: coverUrl || null,
        is_public: isPublic,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data?.error || "Failed to create post.");

    // save inline images
    await fetch(`/api/posts/${data.post.id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: editorImages }),
    });

    // redirect to the new post
    window.location.href = `/posts/${data.post.slug}`;
  }

  return (
    <div className="pt-16" style={{ ["--tt-toolbar-offset" as any]: "64px" }}>
      {/* Title + Cover + Public + Add button — make it a normal block (not sticky) */}
      <div className="z-[120] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          <div>
            <label
              htmlFor="blog-title"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Title
            </label>
            <input
              id="blog-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div className="flex items-end ">
            <div className="flex items-end gap-3 flex-1">
              <div className="">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Cover image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      setError("Please select an image file.");
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setError("Image too large. Max 5MB.");
                      return;
                    }
                    try {
                      setUploadingCover(true);
                      setError(null);
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("folder", "blog/cover");
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: fd,
                      });
                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data?.error || "Upload failed");
                      setCoverUrl(data.url); // use the Cloudinary URL returned by the API
                    } catch (err: any) {
                      setError(err?.message || "Upload failed");
                    } finally {
                      setUploadingCover(false);
                    }
                  }}
                  className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2"
                />
                {coverUrl && (
                  <div className="mt-2">
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="h-24 w-auto rounded border border-border object-cover"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 self-end mb-[6px]">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Public</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddBlog}
              disabled={uploadingCover}
              className="h-10 px-4 rounded-md bg-foreground text-background font-medium whitespace-nowrap disabled:opacity-60"
            >
              {uploadingCover ? "Uploading..." : "Add Blog"}
            </button>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
        </div>
      </div>

      {/* Editor */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <SimpleEditor
          onContentChange={(_, images) => setEditorImages(images)}
        />
      </div>
    </div>
  );
}

export default TipTapDemo;
