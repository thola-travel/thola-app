import { getIcon } from "../lib/icons";

interface AppIconProps {
  id: string;
  size?: number;
  className?: string;
}

/**
 * Renders an icon glyph in the app's watercolor style (muted ink, soft
 * hand-painted edge via the global #watercolor SVG filter). Decorative —
 * hidden from screen readers.
 */
export function AppIcon({ id, size = 20, className }: AppIconProps) {
  const Glyph = getIcon(id);
  return (
    <Glyph
      size={size}
      strokeWidth={1.9}
      aria-hidden
      className={className ? `wicon ${className}` : "wicon"}
    />
  );
}
