import { useState, useEffect } from 'react';
import ChoicesChart from '../components/choices-chart';
import Link from 'next/link';

const UItext = {
  russian: {
    back: 'Назад',
    settingsTab: 'Настройки',
    chartTab: 'Ответы',
    loading: 'Загрузка настроек...',
    error: 'Не удалось загрузить настройки пользователя.',
    settings: 'Настройки',
    childNameLabel: 'Имя ребенка (или детей)',
    childNamePlaceholder: 'Пример: Оля и Аня',
    narrativesLabel: 'Ценности для включения в истории',
    addNarrativePlaceholder: 'Добавить нарратив',
    addNarrative: 'Добавить',
    subchallengesLabel: 'Сложная ситуация для проработки',
    subchallengesList: 'Список вызовов для ребенка, которые мы будем прорабатывать в историях.',
    addSubchallengePlaceholder: 'Добавить вызов',
    addSubchallenge: 'Добавить',
    describeSituation: 'Впишите ситуацию, которую хотите проработать с ребенком. Например: "Развод родителей" или "Переезд в другую страну". Мы трансформируем ее в вызовы для ребенка, которые будем прорабатывать в историях, при этом их сюжет не будет однообразным.',
    describeSituationPlaceholder: 'Опишите сложную ситуацию',
    send: 'Отправить',
    sending: 'Отправка...',
    save: 'Сохранить изменения',
    saving: 'Сохранение...',
    saveSuccess: 'Настройки успешно сохранены!',
    saveError: 'Не удалось сохранить настройки. Попробуйте еще раз.',
    sendError: 'Не удалось отправить сложную ситуацию. Попробуйте еще раз.',
    chart: 'График',
  },
  english: {
    back: 'Back',
    settingsTab: 'Settings',
    chartTab: 'Answers',
    loading: 'Loading settings...',
    error: 'Failed to load user settings.',
    settings: 'Settings',
    childNameLabel: "Child's name(s)",
    childNamePlaceholder: 'Example: Olya and Anya',
    narrativesLabel: 'Values to include in stories',
    addNarrativePlaceholder: 'Add value',
    addNarrative: 'Add',
    subchallengesLabel: 'Difficult situation to work through',
    subchallengesList: 'List of challenges for the child that we will work through in the stories.',
    addSubchallengePlaceholder: 'Add challenge',
    addSubchallenge: 'Add',
    describeSituation: 'Enter a situation you want to work through with your child. For example: "Parents’ divorce" or "Moving to another country". We will transform it into challenges for the child to work through in the stories, and the plot will not be monotonous.',
    describeSituationPlaceholder: 'Describe a difficult situation',
    send: 'Send',
    sending: 'Sending...',
    save: 'Save changes',
    saving: 'Saving...',
    saveSuccess: 'Settings saved successfully!',
    saveError: 'Failed to save settings. Please try again.',
    sendError: 'Failed to send the situation. Please try again.',
    chart: 'Chart',
  },
};

const ParentSpace = () => {
  const [childName, setChildName] = useState('');
  const [narratives, setNarratives] = useState<string[]>([]);
  const [subchallenges, setSubchallenges] = useState<string[]>([]);
  const [newNarrative, setNewNarrative] = useState('');
  const [newSubchallenge, setNewSubchallenge] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'chart'>('settings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [language, setLanguage] = useState<'russian' | 'english'>('english');

  useEffect(() => {
    const lang = (localStorage.getItem('storyLanguage') as 'russian' | 'english') || 'english';
    setLanguage(lang);

    const fetchUserSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem('userId') || 'new-user';

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        localStorage.setItem('userId', data.userId);
        setChildName(data.childName || '');
        setNarratives(data.narratives || []);
        setSubchallenges(data.subchallenges || []);
      } catch (err) {
        console.error('Error fetching user settings:', err);
        setError(UItext[lang].error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, []);

  const addNarrative = () => {
    if (newNarrative.trim()) {
      setNarratives([...narratives, newNarrative.trim()]);
      setNewNarrative('');
    }
  };

  const removeNarrative = (index: number) => {
    setNarratives(narratives.filter((_, i) => i !== index));
  };

  const addSubchallenge = () => {
    if (newSubchallenge.trim()) {
      setSubchallenges([...subchallenges, newSubchallenge.trim()]);
      setNewSubchallenge('');
    }
  };

  const removeSubchallenge = (index: number) => {
    setSubchallenges(subchallenges.filter((_, i) => i !== index));
  };

  const sendChallenge = async (challenge: string) => {
    setIsSubmittingChallenge(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stories/subchallenges/${encodeURIComponent(challenge.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubchallenges([...subchallenges, ...data]);
      setNewSubchallenge('');
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert(UItext[language].sendError);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const saveUserSettings = async () => {
    setIsSavingSettings(true);
    try {
      const userId = localStorage.getItem('userId') || 'new-user';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          channel: 'web-app',
          narratives,
          subchallenges,
          childName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert(UItext[language].saveSuccess);
    } catch (error) {
      console.error('Error saving user settings:', error);
      alert(UItext[language].saveError);
    } finally {
      setIsSavingSettings(false);
      localStorage.setItem('lastMainCharacterName', childName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-10 max-w-lg">
      <Link href="/" className="flex w-full text-blue-500 items-center mb-10">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.7069 4.23276C8.99256 3.93281 9.46729 3.92123 9.76724 4.2069C10.0672 4.49256 10.0788 4.9673 9.7931 5.26724L6 9.25H15.75C16.1642 9.25 16.5 9.58579 16.5 10C16.5 10.4142 16.1642 10.75 15.75 10.75H6L9.7931 14.7328C10.0788 15.0327 10.0672 15.5074 9.76724 15.7931C9.46729 16.0788 8.99256 16.0672 8.7069 15.7672L3.7069 10.5172C3.43103 10.2276 3.43103 9.77242 3.7069 9.48276L8.7069 4.23276Z"
            fill="#3B82F6"
          />
        </svg>
        {UItext[language].back}
      </Link>
      <div className="flex justify-center mb-10">
        <button
          className={`px-4 py-2 rounded-l-lg ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          {UItext[language].settingsTab}
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${activeTab === 'chart' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => setActiveTab('chart')}
        >
          {UItext[language].chartTab}
        </button>
      </div>

      {loading && <p>{UItext[language].loading}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{UItext[language].settings}</h2>

          <div className="mb-4">
            <label className="block font-semibold mb-2">{UItext[language].childNameLabel}</label>
            <input
              type="text"
              placeholder={UItext[language].childNamePlaceholder}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">{UItext[language].narrativesLabel}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {narratives.map((narrative, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-500 px-3 py-1 rounded-lg flex items-center gap-2"
                >
                  {narrative}
                  <button onClick={() => removeNarrative(index)} className="text-red-500">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2  mt-4 ">
              <input
                type="text"
                placeholder={UItext[language].addNarrativePlaceholder}
                value={newNarrative}
                onChange={(e) => setNewNarrative(e.target.value)}
                className="flex-grow p-2 border rounded"
              />
              <button onClick={addNarrative} className="bg-blue-500 text-white px-4 py-2 rounded">
                {UItext[language].addNarrative}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">{UItext[language].subchallengesLabel}</label>

            {subchallenges.length > 0 ? (
              <>
                <div>
                  {UItext[language].subchallengesList}
                </div>
                <div className="flex flex-wrap gap-2 mb-2 mt-4">
                  {subchallenges.map((subchallenge, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-black-500 px-3 py-1 rounded-lg flex items-center gap-2"
                    >
                      {subchallenge}
                      <button onClick={() => removeSubchallenge(index)} className="text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder={UItext[language].addSubchallengePlaceholder}
                    value={newSubchallenge}
                    onChange={(e) => setNewSubchallenge(e.target.value)}
                    className="flex-grow p-2 border rounded"
                  />
                  <button onClick={addSubchallenge} className="bg-blue-500 text-white px-4 py-2 rounded">
                    {UItext[language].addSubchallenge}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div>
                  {UItext[language].describeSituation}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder={UItext[language].describeSituationPlaceholder}
                    value={newSubchallenge}
                    onChange={(e) => setNewSubchallenge(e.target.value)}
                    className="flex-grow p-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      if (newSubchallenge.trim()) {
                        sendChallenge(newSubchallenge);
                      }
                    }}
                    className={`px-4 py-2 rounded ${
                      isSubmittingChallenge ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white'
                    }`}
                    disabled={isSubmittingChallenge}
                  >
                    {isSubmittingChallenge ? UItext[language].sending : UItext[language].send}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-10">
            <button
              onClick={saveUserSettings}
              className={`bg-green-500 text-white px-4 py-2 rounded ${
                isSavingSettings ? 'bg-gray-400 cursor-not-allowed' : ''
              }`}
              disabled={isSavingSettings}
            >
              {isSavingSettings ? UItext[language].saving : UItext[language].save}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{UItext[language].chart}</h2>
          <ChoicesChart />
        </div>
      )}
    </div>
  );
};

export default ParentSpace;