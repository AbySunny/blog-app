"use client";

import React, { useRef, useState } from "react";

interface TagInputProps {
  maxTags: number;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagInput({ maxTags, tags, onTagsChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        onTagsChange([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={
            tags.length < maxTags ? "Add a tag..." : "Max tags reached"
          }
          className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2"
          disabled={tags.length >= maxTags}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {tags.length}/{maxTags} tags
        </p>
      </div>
    </div>
  );
}
