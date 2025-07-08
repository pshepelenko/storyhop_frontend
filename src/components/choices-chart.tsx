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
import { ChartData } from 'chart.js';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const UItext = {
  russian: {
    chartTitle: 'Информация о профиле принятия решений ребенка на основе выбора возможностей развития сюжета',
    loading: 'Загрузка данных...',
    datasetLabel: 'Частота ответов',
    options: [
      { key: 'Risk-taking', label: 'Рискованность' },
      { key: 'Caution', label: 'Осторожность' },
      { key: 'Creativity', label: 'Креативность' },
      { key: 'Empathy', label: 'Эмпатия' },
      { key: 'Pragmatism', label: 'Прагматизм' },
      { key: 'Curiosity', label: 'Любознательность' },
      { key: 'Persistence', label: 'Настойчивость' },
      { key: 'Adaptability', label: 'Адаптивность' },
    ],
  },
  english: {
    chartTitle: "Child's decision-making profile based on story choices",
    loading: 'Loading data...',
    datasetLabel: 'Answer frequency',
    options: [
      { key: 'Risk-taking', label: 'Risk-taking' },
      { key: 'Caution', label: 'Caution' },
      { key: 'Creativity', label: 'Creativity' },
      { key: 'Empathy', label: 'Empathy' },
      { key: 'Pragmatism', label: 'Pragmatism' },
      { key: 'Curiosity', label: 'Curiosity' },
      { key: 'Persistence', label: 'Persistence' },
      { key: 'Adaptability', label: 'Adaptability' },
    ],
  },
};

const ChoicesChart = () => {
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<ChartData<'radar'> | null>(null);
  const [language, setLanguage] = useState<'russian' | 'english'>('english');

  useEffect(() => {
    const lang = (localStorage.getItem('storyLanguage') as 'russian' | 'english') || 'english';
    setLanguage(lang);
  }, []);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const userId = localStorage.getItem('userId');
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
        const labels = UItext[language].options.map((option) => option.label);
        const frequencies = UItext[language].options.map((option) => data[option.key] || 0);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: UItext[language].datasetLabel,
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

    fetchChoices();
  }, [language]);

  return (
    <div>
      {chartData ? (
        <Radar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              r: {
                angleLines: { display: true },
                ticks: { stepSize: 1 },
                suggestedMin: 0,
                suggestedMax: Math.max(...Object.values(choices)) + 1,
              },
            },
          }}
        />
      ) : (
        <p>{UItext[language].loading}</p>
      )}
    </div>
  );
};

export default function Choices() {
  const [language, setLanguage] = useState<'russian' | 'english'>('english');

  useEffect(() => {
    const lang = (localStorage.getItem('storyLanguage') as 'russian' | 'english') || 'english';
    setLanguage(lang);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white text-black  w-full text-center max-w-lg font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 row-start-2 items-center  px-4">
        <div className="w-full">
          <div className="font-semibold text-center mb-10">
            {UItext[language].chartTitle}
          </div>
          <ChoicesChart />
        </div>
      </main>
    </div>
  );
}
