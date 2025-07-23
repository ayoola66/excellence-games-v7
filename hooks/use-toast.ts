interface ToastOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    // For now, just console.log the toast
    console.log(
      `[Toast] ${options.variant || "default"}: ${options.title} - ${options.description}`
    );
  };

  return { toast };
}
