"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "STRAIGHT",
    description: "",
    status: "DRAFT",
    isActive: true,
    isPremium: false,
    categories: ["", "", "", "", ""], // For nested games
    thumbnail: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData to handle file upload
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("description", formData.description);
      submitData.append("status", formData.status);
      submitData.append("isActive", formData.isActive.toString());
      submitData.append("isPremium", formData.isPremium.toString());

      // Add categories for nested games
      if (formData.type === "NESTED") {
        formData.categories.forEach((category, index) => {
          if (category.trim()) {
            submitData.append(`category${index + 1}`, category.trim());
          }
        });
      }

      // Add thumbnail if provided
      if (formData.thumbnail) {
        submitData.append("thumbnail", formData.thumbnail);
      }

      const response = await fetch("/api/admin/games", {
        method: "POST",
        body: submitData, // Send FormData instead of JSON
      });

      if (!response.ok) throw new Error("Failed to create game");

      toast({
        title: "Success",
        description: "Game created successfully",
      });

      router.push("/admin/games");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6">
      <Link
        href="/admin/games"
        className="flex items-center text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Games
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Game Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter game title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Game Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRAIGHT">Straight</SelectItem>
                  <SelectItem value="NESTED">Nested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nested Game Categories */}
            {formData.type === "NESTED" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <Label className="text-base font-semibold">
                  Game Categories (5 required for nested games)
                </Label>
                {formData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`category-${index}`}>
                      Category {index + 1}
                    </Label>
                    <Input
                      id={`category-${index}`}
                      value={category}
                      onChange={(e) => {
                        const newCategories = [...formData.categories];
                        newCategories[index] = e.target.value;
                        setFormData({ ...formData, categories: newCategories });
                      }}
                      placeholder={`Enter category ${index + 1} name`}
                      required={formData.type === "NESTED"}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the game and its objectives"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Game Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, thumbnail: file });
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.thumbnail && (
                <p className="text-sm text-gray-600">
                  Selected: {formData.thumbnail.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active Game</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPremium: checked })
                }
              />
              <Label htmlFor="isPremium">Premium Game</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/games")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Game"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
