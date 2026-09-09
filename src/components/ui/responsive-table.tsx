// src/components/ui/responsive-table.tsx
"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = "" }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <div className="min-w-[800px]">{children}</div>
    </div>
  );
}

// Mobile Card View Alternative
export function MobileCardList({
  children,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div className={`grid gap-4 sm:hidden ${className}`}>
      {children}
    </div>
  );
}

export function MobileCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h3 className="mb-3 font-semibold">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}