import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication Error - Elite Games Platform",
  description: "Authentication error occurred",
};

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-red-600">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            An error occurred during authentication. Please try again.
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/auth/signin"
            className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
