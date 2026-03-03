import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-16 h-16 text-[18px]",
};

// Earthy, muted tones — not pastel rainbow, not dead gray either.
const palette: [string, string][] = [
  ["#f0d9b5", "#7a5020"], // amber
  ["#b8dbc2", "#2d6940"], // green
  ["#d4b8e0", "#6b3a82"], // violet
  ["#a9cee0", "#1e5f82"], // sky
  ["#e8c4a8", "#8b4c1a"], // terracotta
  ["#a8d9cd", "#1a6b5a"], // jade
];

function pickColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover",
          sizeStyles[size],
          className
        )}
      />
    );
  }

  const [bg, fg] = pickColor(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium tracking-tight",
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {getInitials(name)}
    </div>
  );
}
