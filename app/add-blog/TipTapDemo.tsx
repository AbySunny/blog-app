"use client";

import TagInput from "@/components/TagInput";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

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

  async function processImages(content: string): Promise<{
    processedContent: string;
    uploadedImages: string[];
  }> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img");
    const uploadedImageUrls: string[] = [];
    
    // Process images in parallel for better performance
    const uploadPromises = Array.from(images).map(async (img) => {
      const src = img.getAttribute("src");
      if (src && src.startsWith("blob:")) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
          
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", "blog/content");
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          
          if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err?.error || "Upload failed");
          }
          
          const uploadData = await uploadRes.json();
          img.setAttribute("src", uploadData.url);
          return uploadData.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw error;
        }
      } else if (src && src.startsWith("http")) {
        return src;
      }
      return null;
    });

    const results = await Promise.allSettled(uploadPromises);
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        uploadedImageUrls.push(result.value);
      }
    });

    return {
      processedContent: doc.body.innerHTML,
      uploadedImages: uploadedImageUrls,
    };
  }

  async function handleAddBlog() {
    setMessage(null);
    setError(null);
    setIsProcessing(true);

    try {
      const content = localStorage.getItem("blog-content") || "";
      if (!title.trim()) {
        setError("Please enter a title.");
        return;
      }
      if (!content.trim()) {
        setError("Please write some content in the editor.");
        return;
      }

      let finalCoverUrl = "";
      
      // Upload cover image if selected
      if (coverFile) {
        try {
          const fd = new FormData();
          fd.append("file", coverFile);
          fd.append("folder", "blog/cover");
          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error || "Cover upload failed");
          }
          finalCoverUrl = data.url;
        } catch (err: any) {
          throw new Error(err?.message || "Failed to upload cover image");
        }
      }

      // Process images with enhanced error handling
      const { processedContent, uploadedImages } = await processImages(content);

      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      const user_id = auth?.id || auth?.user_id || "00000000-0000-0000-0000-000000000000";

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          title: title.trim(),
          content_html: processedContent,
          cover_image_url: finalCoverUrl || null,
          is_public: isPublic,
          tags: tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create post.");
      }

      // Save inline images if any were uploaded
      if (uploadedImages.length > 0) {
        await fetch(`/api/posts/${data.post.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: uploadedImages }),
        });
      }

      setMessage("Blog post created successfully!");
      
      // Clear local storage and redirect
      localStorage.removeItem("blog-content");
      setTimeout(() => {
        window.location.href = `/posts/${data.post.slug}`;
      }, 1000);
      
    } catch (error: any) {
      console.error("Error creating blog:", error);
      setError(error.message || "An error occurred while creating the blog post.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="pt-16" style={{ ["--tt-toolbar-offset" as any]: "64px" }}>
      {/* Title + Cover + Public + Add button */}
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
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-end">
            <div className="flex items-end gap-3 flex-1">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Cover image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2"
                  disabled={isProcessing}
                />
                {coverPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-24 w-auto rounded border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                        setCoverUrl("");
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                      title="Remove cover image"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div>
                <TagInput tags={tags} onTagsChange={setTags} maxTags={4} />
              </div>
              <div className="flex items-center gap-2 self-end mb-[6px]">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  disabled={isProcessing}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black shadow transition-transform ${
                      isPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isPublic ? (
                      <svg
                        className="h-4 w-4 text-green-600 absolute left-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-red-600 absolute right-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                <span className="text-sm">
                  {isPublic ? "Public" : "Private"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddBlog}
                disabled={isProcessing || uploadingCover}
                className="h-10 px-4 rounded-md bg-foreground text-background font-medium whitespace-nowrap disabled:opacity-60"
              >
                {isProcessing
                  ? "Processing..."
                  : uploadingCover
                  ? "Uploading..."
                  : "Add Blog"}
              </button>
            </div>
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
