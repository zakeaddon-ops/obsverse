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
    const state = window.history.state as { idx?: number } | null;
    setCanGoBack(typeof state?.idx === "number" ? state.idx > 0 : window.history.length > 1);
  }, []);

  const classes = cn(
    "-ml-3 mb-6 text-muted-foreground hover:bg-accent hover:text-primary-glow",
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
