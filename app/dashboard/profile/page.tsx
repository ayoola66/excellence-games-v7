"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.email?.includes("premium");

  const [formData, setFormData] = useState({
    displayName: "",
    email: session?.user?.email || "",
    notifications: {
      email: true,
      push: true,
      gameInvites: true,
      tournamentUpdates: true,
    },
    preferences: {
      theme: "light",
      language: "en",
      soundEffects: true,
      showTutorials: true,
    },
    gameSettings: {
      difficultyLevel: "medium",
      autoMatchmaking: false,
      showLeaderboard: true,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      email: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      push: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Game Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Receive game invitations
                </p>
              </div>
              <Switch
                checked={formData.notifications.gameInvites}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      gameInvites: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Tournament Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tournament notifications
                </p>
              </div>
              <Switch
                checked={formData.notifications.tournamentUpdates}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      tournamentUpdates: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.preferences.theme}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      theme: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.preferences.language}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      language: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Enable game sound effects
                </p>
              </div>
              <Switch
                checked={formData.preferences.soundEffects}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      soundEffects: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Tutorials</Label>
                <p className="text-sm text-muted-foreground">
                  Show game tutorials for new players
                </p>
              </div>
              <Switch
                checked={formData.preferences.showTutorials}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      showTutorials: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Matchmaking</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically find game matches
                  </p>
                </div>
                <Switch
                  checked={formData.gameSettings.autoMatchmaking}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      gameSettings: {
                        ...formData.gameSettings,
                        autoMatchmaking: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your position on leaderboards
                  </p>
                </div>
                <Switch
                  checked={formData.gameSettings.showLeaderboard}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      gameSettings: {
                        ...formData.gameSettings,
                        showLeaderboard: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
