"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GameLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export function GameLayout({ 
  children, 
  title = "Games", 
  showBackButton = true 
}: GameLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground"
              >
                ← Back
              </Button>
            )}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="text-sm text-muted-foreground">
                Playing as {session.user.name}
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
