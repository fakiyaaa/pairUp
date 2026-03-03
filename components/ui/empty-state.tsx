import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-[13px] text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
