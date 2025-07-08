import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Subscription() {
  const UItext = {
    russian: {
      back: 'Назад',
      subscriptionInfo: 'Информация о подписке',
      plan: 'Ваш тарифный план',
      standard: 'Стандарт',
      availableChapters: 'Количество доступных глав',
      addChapters: 'Добавить 200 глав',
      price: 'Цена 1500 руб',
      inn: 'Самозанятый Шепеленко П.А. ИНН 770170701945',
      pay: 'Оплатить',
      processing: 'Обработка...',
      language: 'Язык историй',
      russian: 'Русский',
      english: 'English',
      errorFetch: 'Ошибка при загрузке информации о подписке.',
      errorPayment: 'Ошибка при инициации оплаты. Попробуйте снова.',
    },
    english: {
      back: 'Back',
      subscriptionInfo: 'Subscription Information',
      plan: 'Your plan',
      standard: 'Standard',
      availableChapters: 'Available chapters',
      addChapters: 'Add 200 chapters',
      price: 'Price: 1500 RUB',
      inn: 'Self-employed: Shepelenko P.A. INN 770170701945',
      pay: 'Pay',
      processing: 'Processing...',
      language: 'Story language',
      russian: 'Russian',
      english: 'English',
      errorFetch: 'Error loading subscription info.',
      errorPayment: 'Error initiating payment. Please try again.',
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Загрузка...');
  const [availableChapters, setAvailableChapters] = useState<number | null>(null);
  const [language, setLanguage] = useState<'russian' | 'english'>('english');

  const fetchSubscriptionInfo = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setSubscriptionPlan('Стандарт');
        setAvailableChapters(20);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}/subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubscriptionPlan(data.plan || 'Неизвестно');
      setAvailableChapters(data.limit || 0);
    } catch (err) {
      console.error('Error fetching subscription info:', err);
      setError(UItext[language].errorFetch);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
    setLanguage((localStorage.getItem('storyLanguage') as 'russian' | 'english') || 'english');
    // eslint-disable-next-line
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          channel: 'web-app',
          plan: 'standard',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Payment URL not found in the response');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(UItext[language].errorPayment);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'russian' ? 'english' : 'russian';
    setLanguage(newLanguage);
    localStorage.setItem('storyLanguage', newLanguage);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white text-black min-h-screen w-full text-center max-w-lg font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 row-start-2 items-center pt-20 px-4">
        <Link href="/" className="flex w-full text-blue-500 items-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.7069 4.23276C8.99256 3.93281 9.46729 3.92123 9.76724 4.2069C10.0672 4.49256 10.0788 4.9673 9.7931 5.26724L6 9.25H15.75C16.1642 9.25 16.5 9.58579 16.5 10C16.5 10.4142 16.1642 10.75 15.75 10.75H6L9.7931 14.7328C10.0788 15.0327 10.0672 15.5074 9.76724 15.7931C9.46729 16.0788 8.99256 16.0672 8.7069 15.7672L3.7069 10.5172C3.43103 10.2276 3.43103 9.77242 3.7069 9.48276L8.7069 4.23276Z" fill="#3B82F6" />
          </svg>
          {UItext[language].back}
        </Link>
        <div className="w-full">
          <div className="font-bold text-center mb-10">{UItext[language].subscriptionInfo}</div>
          <div>
            <div>
              {UItext[language].plan}: {subscriptionPlan === 'free' || subscriptionPlan === 'standart' ? UItext[language].standard : subscriptionPlan}
            </div>
            <div>
              {UItext[language].availableChapters}: {availableChapters !== null ? availableChapters : '...'}
            </div>
          </div>
          <div className="border mt-4 p-2 rounded-lg flex flex-col items-center justify-center gap-2">
            <p>{UItext[language].addChapters}</p>
            <p>{UItext[language].price}</p>
            <p className="text-gray-400 text-xs">{UItext[language].inn}</p>
            <button
              onClick={handlePayment}
              className="bg-blue-500 text-white p-4 rounded-full"
              disabled={loading}
            >
              {loading ? UItext[language].processing : UItext[language].pay}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <div className="mt-10">
            <p className="font-semibold mb-4">{UItext[language].language}</p>
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-full ${language === 'russian' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              {UItext[language].russian}
            </button>
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-full ml-2 ${language === 'english' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              {UItext[language].english}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
