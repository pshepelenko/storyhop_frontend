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
import { ChartData } from 'chart.js'; // Import ChartData type

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ChoicesChart = () => {
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<ChartData<'radar'> | null>(null); // Use ChartData type for radar chart

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
        <p>Загрузка данных...</p>
      )}
    </div>
  );
};

export default function Choices() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white text-black  w-full text-center max-w-lg font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 row-start-2 items-center  px-4">
        
        <div className="w-full">
          <div className="font-semibold text-center mb-10">Информация о профиле принятия решений ребенка на основе выбора возможностей развития сюжета</div>
          
          <ChoicesChart />
        </div>
      </main>
    </div>
  );
}
