"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoreItemsList from "@/components/admin/store/store-items-list";
import { AddStoreItemButton } from "@/components/admin/store/add-store-item-button";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export default function StorePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Store Management
          </h2>
          <AddStoreItemButton />
        </div>
        <div className="space-y-4">
          <StoreItemsList />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
