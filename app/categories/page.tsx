"use client";

import React, { useEffect, useState } from "react";
import TiptapViewer from "@/components/TiptapViewer";

export default function FeaturedSection() {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const savedHTML = localStorage.getItem("blog-content");
    if (savedHTML) {
      setHtml(savedHTML);
    }
  }, []);

  return (
    <div className="p-6">
      <TiptapViewer html={html} />
    </div>
  );
}

