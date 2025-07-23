import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const API_TOKEN =
  "9af075baca9fdd1d6ff1f4fc4000b92b33291b2636d24dc0f5331bfefd22ba2f29a1fd81d4c75ebf8f441dfcfadc9d28516fd1b433f09f5c98cf3624d993bc9b00ff0cab225a868425aa39deb00b64d20371910d496623e5cd8a9eca07d9ef871ec9e111f02dd615640c3d2ad70e3daeb4bf251a2e139357a4ac019afd637369";

export const getAuthHeader = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
});
