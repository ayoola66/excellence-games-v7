"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import adminApi from "@/lib/admin-api-client";
import { Game } from "@/types/game";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

const gameFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["STRAIGHT", "NESTED"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categories: z.array(z.string()).optional(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  initialData?: Game;
}

export function GameForm({ initialData }: GameFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "STRAIGHT",
      status: initialData?.status || "DRAFT",
      categories:
        initialData?.type === "NESTED" ? Array(5).fill("") : undefined,
    },
  });

  const gameType = form.watch("type");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview && !thumbnailPreview.startsWith("http")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const onSubmit = async (values: GameFormValues) => {
    setIsLoading(true);
    try {
      // Validate categories for nested games
      if (values.type === "NESTED") {
        if (
          !values.categories ||
          values.categories.length !== 5 ||
          values.categories.some((cat) => !cat)
        ) {
          throw new Error("Nested games require exactly 5 categories");
        }
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("type", values.type);
      formData.append("status", values.status);

      // Only append thumbnail if one is selected
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (values.type === "NESTED" && values.categories) {
        values.categories.forEach((category, index) => {
          formData.append(`categories[${index}]`, category);
        });
      }

      if (initialData) {
        await adminApi.updateGame(initialData.id, formData);
        toast({
          title: "Success",
          description: "Game updated successfully.",
        });
      } else {
        await adminApi.createGame(formData);
        toast({
          title: "Success",
          description: "Game created successfully.",
        });
      }

      router.push("/admin/games");
      router.refresh();
    } catch (error) {
      console.error("Error saving game:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter game title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter game description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset categories when switching game type
                  if (value === "NESTED") {
                    form.setValue("categories", Array(5).fill(""));
                  } else {
                    form.setValue("categories", undefined);
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="STRAIGHT">Straight</SelectItem>
                  <SelectItem value="NESTED">Nested</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {gameType === "NESTED" && (
          <div className="space-y-4">
            <FormLabel>Categories (5 required)</FormLabel>
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`categories.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category {index + 1}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter category ${index + 1} name`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <FormLabel>Thumbnail Image</FormLabel>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
            />
            {thumbnailPreview ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Saving...
              </>
            ) : (
              `${initialData ? "Update" : "Create"} Game`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
