"use server";

import { z } from "zod";
import axios from "axios";

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

interface FormState {
  message?: string;
  error?: string;
}

export async function forgotPasswordAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0],
    };
  }

  const { email } = validatedFields.data;

  try {
    await axios.post(`${strapiUrl}/api/auth/forgot-password`, { email });
    return {
      message: "A password reset link has been sent to your email address.",
    };
  } catch (error: any) {
    if (error.response) {
      return { error: error.response.data.error.message };
    }
    return { error: "An unexpected error occurred." };
  }
}

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    passwordConfirmation: z.string(),
    code: z.string().nonempty({ message: "Reset code is required." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export async function resetPasswordAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validatedFields = ResetPasswordSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error:
        fieldErrors.password?.[0] ||
        fieldErrors.passwordConfirmation?.[0] ||
        fieldErrors.code?.[0],
    };
  }

  const { password, passwordConfirmation, code } = validatedFields.data;

  try {
    await axios.post(`${strapiUrl}/api/auth/reset-password`, {
      password,
      passwordConfirmation,
      code,
    });
    return { message: "Your password has been reset successfully." };
  } catch (error: any) {
    if (error.response) {
      return { error: error.response.data.error.message };
    }
    return { error: "An unexpected error occurred." };
  }
}
