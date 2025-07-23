import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>
          <ResetPasswordForm code={searchParams.code} />
        </div>
      </div>
      <div className="hidden bg-muted lg:block" />
    </div>
  );
}
