import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center text-ink-muted mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm text-ink-muted mb-4">{title}</p>
      {action}
    </div>
  );
}
