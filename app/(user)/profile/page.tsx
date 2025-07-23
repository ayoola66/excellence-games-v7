"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { format } from "date-fns";

// Define a type for the user profile data
interface UserProfile {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  user_profile: {
    id: number;
    membership: "Free" | "Premium";
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile data.");
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <LoadingSkeleton height={96} width={96} rounded className="mx-auto" />
            </div>
            <LoadingSkeleton height={32} width={200} className="mx-auto mb-2" />
            <LoadingSkeleton height={20} width={250} className="mx-auto" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton height={28} width={120} className="mx-auto mb-6" />
            <div className="mt-6 space-y-4">
              <LoadingSkeleton height={24} width={150} className="mb-4" />
              <LoadingSkeleton count={4} height={20} className="mb-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Terribly Sorry!</h3>
            <p className="text-muted-foreground">
              We're having a bit of trouble fetching your profile at the moment. {error}
              Please do give it another go in a moment.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No profile data found.</p>
      </div>
    );
  }

  const { username, email, user_profile } = profile;
  const membership = user_profile?.membership || "N/A";

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src="" alt={username} />
            <AvatarFallback className="text-3xl">
              {username?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{username}</CardTitle>
          <p className="text-muted-foreground">{email}</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Badge variant={membership === "Premium" ? "default" : "secondary"}>
              {membership} Membership
            </Badge>
          </div>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Profile Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Account Status</dt>
                <dd className="text-sm">
                  <Badge variant={profile.confirmed ? "success" : "destructive"}>
                    {profile.confirmed ? "Verified" : "Unverified"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Login Provider</dt>
                <dd className="text-sm capitalize">{profile.provider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
                <dd className="text-sm">{format(new Date(profile.createdAt), "do MMMM yyyy")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm">{format(new Date(profile.updatedAt), "do MMMM yyyy")}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
