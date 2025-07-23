"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import adminApiClient from "@/lib/admin-api-client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface StoreItem {
  id: number;
  attributes: {
    name: string;
    description: string;
    price: number;
    status: "active" | "inactive";
    image?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export default function StoreItemsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["store-items"],
    queryFn: async () => {
      const response = await adminApiClient.get("/store-items");
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApiClient.delete(`/store-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      toast({
        title: "Success",
        description: "Store item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete store item",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: StoreItem) => (
            <TableRow key={item.id}>
              <TableCell>{item.attributes.name}</TableCell>
              <TableCell>{item.attributes.description}</TableCell>
              <TableCell>{formatCurrency(item.attributes.price)}</TableCell>
              <TableCell>{item.attributes.status}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    // TODO: Implement edit functionality
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this item?"
                      )
                    ) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
