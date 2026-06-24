import { useEffect, useState } from 'react';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { Button, Card } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import { getChannelUserId } from '@/lib/ui-language';

export default function ReferralPage() {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasSeasons, setHasSeasons] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = getChannelUserId();
        const [refRes, homeRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/home-summary`),
        ]);
        if (refRes.ok) {
          const data = await refRes.json();
          setInviteLink(data.inviteLink || '');
        }
        if (homeRes.ok) {
          const home = await homeRes.json();
          setHasSeasons(home.hasSeasons);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell showBottomNav hasSeasons={hasSeasons} maxWidth="default">
      <h1 className="text-2xl font-bold font-story mb-2">Invite a friend</h1>
      <p className="text-sm text-sh-muted mb-6">Share StoryHop and both families get rewards.</p>

      <div className="relative h-48 rounded-sh overflow-hidden mb-6">
        <Image src={imageAssets.referral.inviteKids} alt="" fill className="object-cover" sizes="100vw" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Card padding="md" className="text-center">
          <div className="relative h-24 mx-auto mb-2 rounded-sh overflow-hidden">
            <Image src={imageAssets.referral.chest} alt="" fill className="object-cover" sizes="200px" />
          </div>
          <p className="font-semibold text-sm">+50 crystals</p>
          <p className="text-xs text-sh-muted">For you and your friend</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="text-3xl font-bold text-sh-forest my-6">50%</p>
          <p className="font-semibold text-sm">Off one month</p>
          <p className="text-xs text-sh-muted">Subscription discount</p>
        </Card>
      </div>

      <Card padding="md" className="mb-4">
        <p className="text-sm font-medium mb-2">Your invite link</p>
        {loading ? (
          <p className="text-sm text-sh-muted">Creating link...</p>
        ) : (
          <div className="flex gap-2">
            <input readOnly value={inviteLink} className="flex-1 text-xs border border-sh-border rounded-sh px-2 py-2" />
            <Button onClick={copyLink} variant="secondary">{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
        )}
      </Card>

      <Card padding="md">
        <p className="text-sm font-medium mb-2">What your friend sees</p>
        <p className="text-xs text-sh-muted">
          A safe introduction to StoryHop — sample chapter, parent trust message, and a path to create their first season. No open chat, no ads.
        </p>
      </Card>

      <Button href="/settings" variant="ghost" fullWidth className="mt-6">Back to settings</Button>
    </AppShell>
  );
}
