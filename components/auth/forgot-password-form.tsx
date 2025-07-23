"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { forgotPasswordAction } from "@/lib/actions";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [state, dispatch] = useFormState(forgotPasswordAction, undefined);

  React.useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: £${state.error}`,
      });
    }
    if (state?.message) {
      toast({
        title: "Success",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={dispatch} className="grid gap-4">
      <div className="grid gap-2">
        <Input
          id="email"
          name="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          required
        />
      </div>
      <SubmitButton />
      <div className="mt-4 text-center text-sm">
        Remember your password?{" "}
        <Link href="/auth/signin" className="underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>
      {pending ? "Sending..." : "Send Reset Link"}
    </Button>
  );
}
