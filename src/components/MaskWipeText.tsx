"use client";

/**
 * MaskWipeText — premium left-to-right reveal (Apple / Stripe style), CSS-only.
 *
 * The text stays static while a clip mask wipes across it from left to right,
 * uncovering it cleanly. One calm sweep — driven by the `animate-mask-wipe`
 * keyframe in landing-animations.css.
 */
export function MaskWipeText({
  text,
  className = "",
  delay = 0.35,
  duration = 1,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <span
      className={`inline-block animate-mask-wipe ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      {text}
    </span>
  );
}

export default MaskWipeText;
