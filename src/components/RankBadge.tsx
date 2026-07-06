import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  className?: string;
}

export default function RankBadge({ rank, className }: RankBadgeProps) {
  const colors: Record<string, string> = {
    S: "bg-purple-100 text-purple-800 border-purple-200",
    A: "bg-blue-100 text-blue-800 border-blue-200",
    B: "bg-green-100 text-green-800 border-green-200",
    C: "bg-gray-100 text-gray-800 border-gray-200",
    D: "bg-red-100 text-red-800 border-red-200",
    SS: "bg-indigo-100 text-indigo-800 border-indigo-200 font-bold",
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-xs font-medium border",
      colors[rank] || colors.C,
      className
    )}>
      Rank {rank}
    </span>
  );
}
