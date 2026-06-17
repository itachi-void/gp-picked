"use client";

import React, { useState, useEffect, useMemo } from "react";

export const TypewriterText: React.FC = React.memo(function TypewriterText() {
  const words = useMemo(
    () => ["Recycle Smart", "Earn Rewards", "Save Planet", "Join Movement"],
    [],
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const word = words[currentWordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < word.length) {
            setDisplayText(word.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 500);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((currentWordIndex + 1) % words.length);
          }
        }
      },
      isDeleting ? 75 : 150,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, words]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-emerald-600">
      {displayText}
      <span
        className={`inline-block w-1 h-12 bg-emerald-600 ml-1 ${
          showCursor ? "opacity-100" : "opacity-0"
        } transition-opacity`}
      >
        |
      </span>
    </span>
  );
});
