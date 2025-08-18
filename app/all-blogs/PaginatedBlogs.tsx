"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function firstParagraph(html: string): string {
  const match = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  const raw = match[1] || "";
  return raw.replace(/<[^>]+>/g, "").trim();
}

interface Tag {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  created_at: string;
  content_html: string;
  author_id: string;
  author_username: string;
  tags: Tag[];
}

interface PaginatedBlogsProps {
  initialPosts: Post[];
  totalPosts: number;
  me: any;
}

export default function PaginatedBlogs({ initialPosts, totalPosts, me }: PaginatedBlogsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const postsPerPage = 9;

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    initialPosts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [initialPosts]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);



  // Filter posts based on search query (including tags)
  const filteredPosts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return initialPosts;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return initialPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content_html.toLowerCase().includes(query) ||
      post.author_username.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(query))
    );
  }, [initialPosts, debouncedSearchQuery]);
  
  const totalFilteredPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalFilteredPosts / postsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Calculate the posts to display for current page
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md text-sm font-medium transition-colors ${
            currentPage === i
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold mb-4 sm:mb-0">All Blogs</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blogs or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full px-10"
          />
        </div>
      </div>
      
      {currentPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {debouncedSearchQuery 
            ? `No blogs found for "${debouncedSearchQuery}".` 
            : "No posts yet."}
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((p) => {
              const excerpt = firstParagraph(p.content_html || "");
              return (
                <div
                  key={p.id}
                  className="group rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 bg-card/50 flex flex-col"
                >
                  <Link
                    href={`/posts/${p.slug}`}
                    className="block flex-grow"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={p.cover_image_url || "/no-image.jpg"}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(p.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '/')}
                      </div>
                      <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {p.title}
                      </h3>
                      {excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {excerpt}
                        </p>
                      )}
                      <div className="inline-flex items-center text-primary font-medium group-hover:underline">
                        Read more
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{p.author_username}</div>
                      <FollowButton targetUserId={p.author_id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
