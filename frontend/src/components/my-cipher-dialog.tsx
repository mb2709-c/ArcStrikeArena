import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BetPosition } from "@/types";

interface MyCipherDialogProps {
  position: BetPosition;
}

export function MyCipherDialog({ position }: MyCipherDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          View Cipher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encrypted Handle</DialogTitle>
          <DialogDescription>Store this ciphertext securely. It authenticates your wager for duel {position.duelId}.</DialogDescription>
        </DialogHeader>
        <Textarea value={position.cipherHandle} readOnly className="font-mono text-xs" />
      </DialogContent>
    </Dialog>
  );
}



