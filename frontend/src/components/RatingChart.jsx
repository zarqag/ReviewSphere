import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

// ─── Bar Chart — Rating Breakdown ─────────────────────
export function RatingBarChart({ data, type }) {
  const collegeLabels = [
    "Faculty",
    "Placements",
    "Infrastructure",
    "Campus Life",
  ];
  const companyLabels = [
    "Work Culture",
    "Salary",
    "Learning",
    "Work-Life Balance",
  ];
  const labels = type === "college" ? collegeLabels : companyLabels;

  const collegeValues = [
    data.avgFaculty,
    data.avgPlacements,
    data.avgInfrastructure,
    data.avgCampusLife,
  ];
  const companyValues = [
    data.avgWorkCulture,
    data.avgSalary,
    data.avgLearning,
    data.avgWorkLifeBalance,
  ];
  const values = type === "college" ? collegeValues : companyValues;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Average Rating",
        data: values.map((v) => Number(v || 0).toFixed(1)),
        backgroundColor: [
          "rgba(251, 146, 60, 0.8)",
          "rgba(251, 146, 60, 0.6)",
          "rgba(251, 146, 60, 0.4)",
          "rgba(251, 146, 60, 0.3)",
        ],
        borderColor: "rgba(251, 146, 60, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} / 5`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

// ─── Doughnut Chart — Sentiment Distribution ──────────
export function SentimentChart({ positive, neutral, negative }) {
  const total = positive + neutral + negative;
  if (total === 0)
    return (
      <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
    );

  const chartData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [positive, neutral, negative],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(156, 163, 175, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 16, font: { size: 12 } },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
