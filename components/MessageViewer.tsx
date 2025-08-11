'use client';

import { formatDate } from '@/lib/format';
import type { MessageDetail } from '@/lib/providers/types';
import { Button } from './ui';

interface MessageViewerProps {
  message: MessageDetail | null;
  mailbox: any;
  onClose?: () => void;
}

export default function MessageViewer({ message, mailbox, onClose }: MessageViewerProps) {
  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-sm">Select a message to view</div>
      </div>
    );
  }

  const handleAttachmentDownload = async (attachment: any) => {
    try {
      const qs = new URLSearchParams({
        mailbox: JSON.stringify({
          id: mailbox?.id,
          address: mailbox?.address,
          provider: mailbox?.provider,
          createdAt: mailbox?.createdAt,
          meta: mailbox?.meta ? { id: mailbox.meta.id } : undefined,
        }),
      }).toString();
      
      const response = await fetch(`/api/attachments/${attachment.id}?${qs}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold break-words pr-4">
            {message.subject || '(no subject)'}
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="shrink-0 text-lg"
              aria-label="Close message"
            >
              ×
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><strong>From:</strong> {message.from}</div>
          <div><strong>Date:</strong> {formatDate(message.date)}</div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {message.html ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: message.html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {message.text || '(no content)'}
          </pre>
        )}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <footer className="border-t border-border p-4">
          <h3 className="text-sm font-medium mb-2">Attachments ({message.attachments.length})</h3>
          <div className="space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{attachment.filename}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(attachment.size / 1024)} KB
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAttachmentDownload(attachment)}
                  className="shrink-0 ml-2 text-xs px-2 py-1"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
