import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getChannelUserId } from '@/lib/ui-language';

type InviteFriendModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function InviteFriendModal({ open, onClose }: InviteFriendModalProps) {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const userId = getChannelUserId();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          const data = await res.json();
          setInviteLink(data.inviteLink || '');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  if (!open) return null;

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md" padding="lg">
        <h2 className="text-lg font-bold mb-2">Share StoryHop, earn rewards</h2>
        <p className="text-sm text-sh-muted mb-4">
          You and your friend each get 50% off one subscription month and +50 crystals.
        </p>
        <p className="text-xs text-sh-muted mb-2">
          Your friend will see a safe introduction to StoryHop and can start their own season.
        </p>
        {loading ? (
          <p className="text-sm text-sh-muted">Creating invite link...</p>
        ) : (
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 text-xs border border-sh-border rounded-sh px-2 py-2"
            />
            <Button onClick={copyLink} variant="secondary">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}
        <Button onClick={onClose} variant="ghost" fullWidth className="mt-4">
          Close
        </Button>
      </Card>
    </div>
  );
}
