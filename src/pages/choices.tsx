import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Choices() {
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any>(null);

  // Predefined options with Russian translations
  const predefinedOptions = [
    { key: 'Risk-taking', label: 'Рискованность' },
    { key: 'Caution', label: 'Осторожность' },
    { key: 'Creativity', label: 'Креативность' },
    { key: 'Empathy', label: 'Эмпатия' },
    { key: 'Pragmatism', label: 'Прагматизм' },
    { key: 'Curiosity', label: 'Любознательность' },
    { key: 'Persistence', label: 'Настойчивость' },
    { key: 'Adaptability', label: 'Адаптивность' },
  ];

  const fetchChoices = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/choices/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChoices(data);

      // Prepare chart data
      const labels = predefinedOptions.map((option) => option.label); // Russian labels
      const frequencies = predefinedOptions.map((option) => data[option.key] || 0); // Default to 0 if not in data

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Частота ответов',
            data: frequencies,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      console.error('Error fetching choices info:', err);
    }
  };

  useEffect(() => {
    fetchChoices();
  }, []);

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
          <div className="font-bold text-center mb-10">Информация о профиле ответов пользователя</div>
          <div>
            {chartData ? (
              <Radar
                data={chartData}
                options={{
                  responsive: true,
                  scales: {
                    r: {
                      angleLines: {
                        display: true,
                      },
                      ticks: {
                        stepSize: 1, // Set step size to 1
                      },
                      suggestedMin: 0,
                      suggestedMax: Math.max(...Object.values(choices)) + 1, // Dynamically adjust max value
                    },
                  },
                }}
              />
            ) : (
              <p>Загрузка данных...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
