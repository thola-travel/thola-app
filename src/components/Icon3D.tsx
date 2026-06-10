import { getIconSrc } from "../lib/icons";

interface Icon3DProps {
  id: string;
  size?: number;
  className?: string;
}

/** Renders a Fluent Emoji 3D icon by id. Decorative — hidden from screen readers. */
export function Icon3D({ id, size = 20, className }: Icon3DProps) {
  return (
    <img
      src={getIconSrc(id)}
      width={size}
      height={size}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}
