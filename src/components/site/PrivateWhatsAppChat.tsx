import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, Send, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storeSettingsQuery } from "@/lib/store-settings";
import { privateWhatsAppLink, safeWhatsApp } from "@/lib/whatsapp";

export function PrivateWhatsAppChat() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { data: settings, isPending, isError, refetch } = useQuery(storeSettingsQuery);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const destination = safeWhatsApp(settings?.whatsapp_url);
  const href = privateWhatsAppLink(destination, message);

  if (path.startsWith("/admin")) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="fixed bottom-5 right-4 z-40 h-12 rounded-full px-4 shadow-button sm:right-6" aria-label="Chat pribadi dengan admin" title="Chat pribadi dengan admin">
          <MessageCircle /><span>Chat Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-lg border-border bg-card shadow-glow">
        <DialogHeader className="text-left">
          <div className="mb-2 flex items-center gap-2 text-primary-glow"><LockKeyhole className="h-5 w-5" /><span className="text-xs font-semibold">Private Message</span></div>
          <DialogTitle className="font-display text-xl">Chat Admin obsVerse</DialogTitle>
          <DialogDescription>Percakapan pribadi di WhatsApp.</DialogDescription>
        </DialogHeader>
        {isPending ? <p role="status" className="text-sm text-muted-foreground">Memuat kontak admin…</p> : isError ? (
          <div className="space-y-3"><p role="alert" className="text-sm text-muted-foreground">Kontak admin gagal dimuat.</p><Button variant="outline" onClick={() => refetch()}>Coba lagi</Button></div>
        ) : !destination ? <p role="status" className="text-sm text-muted-foreground">WhatsApp admin belum tersedia.</p> : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="private-message">Pesan untuk admin</Label>
              <Textarea id="private-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Halo admin, saya ingin bertanya…" className="min-h-32 resize-y bg-background" />
            </div>
            {href ? <Button variant="hero" className="w-full" asChild><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}><Send />Lanjut ke WhatsApp</a></Button> : <Button variant="hero" className="w-full" disabled><Send />Lanjut ke WhatsApp</Button>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}