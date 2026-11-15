import { Copy, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface SendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onSend: (method: 'copy' | 'whatsapp') => void;
}

export function SendDialog({ open, onOpenChange, text, onSend }: SendDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send roster</DialogTitle>
          <DialogDescription>
            This is the message that will be sent. The roster is marked as sent once you choose how.
          </DialogDescription>
        </DialogHeader>
        <pre
          aria-label="Roster message preview"
          className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
        >
          {text}
        </pre>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onSend('copy')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy text
          </button>
          <button
            type="button"
            onClick={() => onSend('whatsapp')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            <MessageSquare className="w-4 h-4" aria-hidden />
            Open WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
