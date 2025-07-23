"use client";

import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingFormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  isLoading?: boolean;
}

export function SettingFormSection({
  title,
  description,
  children,
  isLoading = false,
}: SettingFormSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
