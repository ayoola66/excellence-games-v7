"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInForm } from "@/components/auth/signin-form";

function SignInContent() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Try to preload the video
    const video = document.getElementById("bgVideo") as HTMLVideoElement;
    if (video) {
      video.addEventListener("loadeddata", () => {
        setIsVideoLoaded(true);
      });

      // Add error handling
      video.addEventListener("error", () => {
        console.error("Video failed to load");
        setIsVideoLoaded(false);
      });
    }
  }, []);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden bg-black">
          <video
            id="bgVideo"
            autoPlay
            loop
            muted
            playsInline
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>

          {/* Breathing Logo Placeholder */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isVideoLoaded ? "opacity-0" : "opacity-100"}`}
          >
            <div className="animate-breathe">
              <Image
                src="/images/Excellence-Games-Logo-Gold.png"
                alt="Excellence Games"
                width={200}
                height={200}
                className="w-40 h-40 object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/images/Excellence-Games-Logo-Gold.png"
            alt="Excellence Games"
            width={32}
            height={32}
            className="mr-2 h-8 w-8"
            priority
          />
          Excellence Games
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Experience the thrill of gaming like never before with our
              curated collection of exciting games.&rdquo;
            </p>
            <footer className="text-sm">Excellence Games Team</footer>
          </blockquote>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <SignInForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return <SignInContent />;
}
