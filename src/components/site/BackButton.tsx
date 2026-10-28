import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Routes a "Kembali" button may fall back to when there is no page to return to. */
type BackTo = "/" | "/admin";

type BackButtonProps = {
  /** Used when the visitor landed here directly (no page inside obsVerse to return to). */
  to?: BackTo;
  label?: string;
  className?: string;
};

/**
 * Returns the visitor to the page they actually came from. When they opened the
 * link directly (new tab, shared link), it falls back to the given route.
 */
export function BackButton({ to = "/", label = "Kembali", className }: BackButtonProps) {
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // TanStack Router stores its position in the history stack as `__TSR_index`;
    // 0 means the visitor landed here directly, so there is nothing to return to.
    const state = window.history.state as { __TSR_index?: number; idx?: number } | null;
    const pos = state?.__TSR_index ?? state?.idx;
    setCanGoBack(typeof pos === "number" ? pos > 0 : window.history.length > 1);
  }, []);


  const classes = cn(
    "mb-6 -ml-1 rounded-full border border-border bg-card px-4 text-secondary-foreground",
    "hover:border-primary/50 hover:bg-accent hover:text-primary-glow",
    className,
  );


  if (canGoBack) {
    return (
      <Button variant="ghost" className={classes} onClick={() => window.history.back()}>
        <ArrowLeft /> {label}
      </Button>
    );
  }

  return (
    <Button variant="ghost" asChild className={classes}>
      <Link to={to}>
        <ArrowLeft /> {label}
      </Link>
    </Button>
  );
}
