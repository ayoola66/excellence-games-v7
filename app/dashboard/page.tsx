"use client";

import { useSession } from "next-auth/react";
import { useGameStats } from "@/hooks/use-dashboard-data";
import { useTheme } from "@/lib/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  const firstName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : session?.user?.email?.split("@")[0];

  const { data: stats } = useGameStats();

  const gamesPlayed = stats?.gamesPlayed ?? 0;
  const winRate = stats?.winRate ?? 0;
  const lastPlayedAt = stats?.lastPlayedAt
    ? new Date(stats.lastPlayedAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Never";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        Welcome back{firstName ? `, ${firstName}` : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Games Played</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFB800]">{gamesPlayed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFB800]">{winRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Time Played</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-[#FFB800]">{lastPlayedAt}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Recent Activity
        </h2>
        <Card>
          <CardContent>
            <div className="p-6 text-center text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
