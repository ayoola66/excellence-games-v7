interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-xl text-muted-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
