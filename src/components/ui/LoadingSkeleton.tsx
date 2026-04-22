import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-primary-50 rounded-lg ${className}`} />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-adventure-border">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-9 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={`skel-col-${i + 1}`} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function BadgeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-adventure-border flex flex-col items-center gap-2">
      <Skeleton className="w-14 h-14 rounded-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}