import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { MessageSquare, Copy, Camera } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'text' | 'whatsapp' | 'screenshot') => void;
}

export function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
  const handleExport = (format: 'text' | 'whatsapp' | 'screenshot') => {
    onExport(format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Roster</DialogTitle>
          <DialogDescription>Choose how you want to send the roster.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <button
            onClick={() => handleExport('text')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Copy as Text</div>
              <div className="text-sm text-gray-500">Copy roster to clipboard</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('whatsapp')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-300 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Send via WhatsApp</div>
              <div className="text-sm text-gray-500">Open WhatsApp with pre-filled message</div>
            </div>
          </button>

          <button
            onClick={() => handleExport('screenshot')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Take Screenshot</div>
              <div className="text-sm text-gray-500">Capture a screenshot of the roster</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}