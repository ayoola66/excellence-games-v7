"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { resetPasswordAction } from "@/lib/actions";

export function ResetPasswordForm({ code }: { code?: string }) {
  const { toast } = useToast();
  const [state, dispatch] = useFormState(resetPasswordAction, undefined);

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

  if (!code) {
    return (
      <div className="text-center text-sm text-red-500">
        Invalid reset link. Please request a new one.
      </div>
    );
  }

  if (state?.message) {
    return (
      <div className="text-center">
        <div className="text-sm text-green-500">{state.message}</div>
        <Link href="/auth/signin" className="underline text-sm">
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={dispatch} className="grid gap-4">
      <input type="hidden" name="code" value={code} />
      <div className="grid gap-2">
        <Input
          id="password"
          name="password"
          placeholder="New password"
          type="password"
          required
        />
        <Input
          id="passwordConfirmation"
          name="passwordConfirmation"
          placeholder="Confirm new password"
          type="password"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>
      {pending ? "Resetting..." : "Reset Password"}
    </Button>
  );
}
