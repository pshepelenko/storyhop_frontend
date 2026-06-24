import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button, Card, SettingsRow } from '@/components/ui';
import { getChannelUserId, getUiLanguage, setUiLanguage } from '@/lib/ui-language';

const SOUND_KEY = 'storyhop_soundEffects';
const BGM_KEY = 'storyhop_bgm';
const AUTOPLAY_KEY = 'storyhop_autoplayNext';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-sh-forest' : 'bg-sh-border'}`}
    >
      <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [language, setLanguage] = useState<'english' | 'russian'>(getUiLanguage());
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('8');
  const [languageLevel, setLanguageLevel] = useState('A1');
  const [ttsVoice, setTtsVoice] = useState('bm_lewis');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Standard');
  const [availableChapters, setAvailableChapters] = useState<number | null>(null);
  const [hasSeasons, setHasSeasons] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [soundEffects, setSoundEffects] = useState(true);
  const [bgm, setBgm] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);

  useEffect(() => {
    setSoundEffects(localStorage.getItem(SOUND_KEY) !== 'false');
    setBgm(localStorage.getItem(BGM_KEY) === 'true');
    setAutoplayNext(localStorage.getItem(AUTOPLAY_KEY) !== 'false');
    setTtsVoice(localStorage.getItem('ttsVoice') || 'bm_lewis');

    const load = async () => {
      const userId = getChannelUserId();
      try {
        const [settingsRes, homeRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/settings`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/home-summary`),
        ]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          localStorage.setItem('userId', s.userId);
          setChildName(s.childName || '');
        }
        if (homeRes.ok) {
          const h = await homeRes.json();
          setHasSeasons(h.hasSeasons);
          if (h.seasons?.[0]) setChildName((n) => n || h.seasons[0].childName);
        }
        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/subscription`);
        if (subRes.ok) {
          const sub = await subRes.json();
          setSubscriptionPlan(sub.plan || 'Standard');
          setAvailableChapters(sub.limit ?? 20);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const saveSettings = async () => {
    setUiLanguage(language);
    localStorage.setItem('uiLanguage', language);
    localStorage.setItem('ttsVoice', ttsVoice);
    localStorage.setItem(SOUND_KEY, String(soundEffects));
    localStorage.setItem(BGM_KEY, String(bgm));
    localStorage.setItem(AUTOPLAY_KEY, String(autoplayNext));
    const userId = getChannelUserId();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, narratives: [], subchallenges: [] }),
      });
      setSaveMsg('Settings saved.');
    } catch {
      setSaveMsg('Could not save settings.');
    }
  };

  return (
    <AppShell showBottomNav hasSeasons={hasSeasons} maxWidth="default">
      <h1 className="text-xl font-bold mb-6 font-story">Settings</h1>

      <Card padding="none" className="overflow-hidden mb-4">
        <SettingsRow
          label="Interface language"
          description="Story language is always English"
          border
          trailing={
            <select
              className="border border-sh-border rounded-sh text-sm px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'english' | 'russian')}
            >
              <option value="english">English</option>
              <option value="russian">Russian</option>
            </select>
          }
        />
        <SettingsRow label="Child profile" description={`${childName || 'Not set'} · age ${childAge} · ${languageLevel}`} href="/seasons/new" />
        <SettingsRow label="Audio voice" description={ttsVoice} border={false} />
      </Card>

      <Card padding="none" className="overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-sh-border text-sm font-semibold">Playback</div>
        <SettingsRow
          label="Sound effects"
          trailing={<Toggle checked={soundEffects} onChange={setSoundEffects} />}
        />
        <SettingsRow label="Background music" trailing={<Toggle checked={bgm} onChange={setBgm} />} />
        <SettingsRow
          label="Auto-play next episode"
          border={false}
          trailing={<Toggle checked={autoplayNext} onChange={setAutoplayNext} />}
        />
      </Card>

      <Card padding="none" className="overflow-hidden mb-4">
        <SettingsRow label="Parent controls" description="Child-safe: no open chat, no ads" />
        <SettingsRow label="Privacy" description="Story data used only to personalize your season" border={false} />
      </Card>

      <Card padding="none" className="overflow-hidden mb-4">
        <SettingsRow label="Invite a friend" description="50% off + 50 crystals" href="/referral" />
        <SettingsRow label="Billing" description={`${subscriptionPlan} · ${availableChapters ?? '—'} chapters`} border={false} />
      </Card>

      <details className="mb-4">
        <summary className="text-sm text-sh-forest cursor-pointer">Edit child profile details</summary>
        <Card padding="md" className="mt-2 space-y-3">
          <label className="block text-sm">
            Name
            <input className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={childName} onChange={(e) => setChildName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Age
            <input className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
          </label>
          <label className="block text-sm">
            Voice
            <select className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)}>
              <option value="bm_lewis">Lewis (UK)</option>
              <option value="af_sarah">Sarah (US)</option>
              <option value="af_heart">Heart (US)</option>
            </select>
          </label>
        </Card>
      </details>

      <Button onClick={saveSettings} fullWidth>Save changes</Button>
      {saveMsg && <p className="text-sm text-center text-sh-forest mt-2">{saveMsg}</p>}
    </AppShell>
  );
}
