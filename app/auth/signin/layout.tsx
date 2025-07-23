import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Elite Games Platform",
  description: "Sign in to the Elite Games Platform",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
