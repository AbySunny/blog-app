"use client";

import React, { useEffect, useState } from "react";

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
      <div className="prose max-w-none">
        <iframe  dangerouslySetInnerHTML={{
          __html: html
        }}></iframe>
      </div>
    </div>
  );
}
