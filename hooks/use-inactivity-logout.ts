import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

export function useInactivityLogout(timeoutMs = 5 * 60 * 1000) {
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        toast({
          title: "Logged out",
          description: "You were logged out due to inactivity.",
          variant: "destructive",
        });
        signOut({ callbackUrl: "/auth/signin" });
      }, timeoutMs);
    };

    const events = [
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs, toast]);
}
