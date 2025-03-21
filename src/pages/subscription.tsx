import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Загрузка...');
  const [availableChapters, setAvailableChapters] = useState<number | null>(null);

  const fetchSubscriptionInfo = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
      if (!userId) {
        setSubscriptionPlan('Стандарт')
        setAvailableChapters(20)
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
      setError('Ошибка при загрузке информации о подписке.');
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
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
        // Redirect the user to the payment URL
        window.location.href = data.url;
      } else {
        throw new Error('Payment URL not found in the response');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError('Ошибка при инициации оплаты. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white text-black min-h-screen w-full text-center max-w-lg font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 row-start-2 items-center pt-20 px-4">
        <Link href="/" className="flex w-full text-blue-500 items-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.7069 4.23276C8.99256 3.93281 9.46729 3.92123 9.76724 4.2069C10.0672 4.49256 10.0788 4.9673 9.7931 5.26724L6 9.25H15.75C16.1642 9.25 16.5 9.58579 16.5 10C16.5 10.4142 16.1642 10.75 15.75 10.75H6L9.7931 14.7328C10.0788 15.0327 10.0672 15.5074 9.76724 15.7931C9.46729 16.0788 8.99256 16.0672 8.7069 15.7672L3.7069 10.5172C3.43103 10.2276 3.43103 9.77242 3.7069 9.48276L8.7069 4.23276Z" fill="#3B82F6" />
          </svg>
          Назад
        </Link>
        <div className="w-full">
          
          <div className='font-bold text-center mb-10'> Информация о подписке</div>
          <div>
            <div>Ваш тарифный план: {subscriptionPlan === 'free' || 'standart' ? 'Стандарт' : subscriptionPlan}</div>
            <div>Количество доступных глав: {availableChapters !== null ? availableChapters : 'Загрузка...'}</div>
          </div>
          <div className="border mt-4 p-2 rounded-lg flex flex-col items-center justify-center gap-2">
            <p>Добавить 200 глав</p>
            <p>Цена 745 руб</p>
            <p className="text-gray-400 text-xs">Самозанятый Шепеленко П.А. ИНН 770170701945</p>
            <button
              onClick={handlePayment}
              className="bg-blue-500 text-white p-4 rounded-full"
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Оплатить'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
