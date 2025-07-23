import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Management | Admin Dashboard",
  description: "Manage store items and pricing",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
