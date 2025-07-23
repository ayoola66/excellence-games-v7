"use client";

import Link from "next/link";
import Image from "next/image";
import { UserSignUpForm } from "@/components/auth/user-signup-form";

export default function SignUpPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <UserSignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-12">
          <Link href="/" className="flex items-center space-x-4 mb-8">
            <Image
              src="/logo.png"
              alt="Elite Games Platform Logo"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
            <span className="text-4xl font-bold tracking-wider">
              Elite Games
            </span>
          </Link>
          <h2 className="text-3xl font-semibold mt-4 text-center">
            Join the Elite Games Community
          </h2>
          <p className="text-lg mt-4 text-indigo-100 max-w-md text-center">
            Create your account to start playing, competing, and climbing the
            leaderboards!
          </p>
        </div>
      </div>
    </div>
  );
}
