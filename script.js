// アンケート用データ
const questions = [
    { text: "あなたの体調チェック！", options: [""] },
    { text: "今日の体調は？", options: ["元気！", "だるい", "頭痛がする", "悪い", "その他"] },
    { text: "今日の痛みはどれくらい？", options: ["1", "2", "3", "4", "5"] },
    { text: "どんな痛み？", options: ["ズキズキ", "ガンガン", "ギュー", "〇〇", "△△"] },
    { text: "終了です！良い一日を！", options: [""] }
];

let index = 0;
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-btn");

// 質問表示
function showQuestion() {
    questionContainer.textContent = questions[index].text;
    optionsContainer.innerHTML = "";
    questions[index].options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("survey-option");
        optionsContainer.appendChild(btn);
    });
}

// 次へボタン
nextButton.addEventListener("click", () => {
    if (index < questions.length - 1) {
        index++;
        showQuestion();
    }
});

// 初期表示
showQuestion();

const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const targetPage = tab.dataset.target;
        if (!targetPage) {
            return;
        }
        document.querySelectorAll(".page").forEach(page => page.style.display = "none");
        document.getElementById(targetPage).style.display = "flex";
    });
});

let weatherChart;

async function fetchOpenWeatherData() {
  try {
    const API_KEY = '1090dd750a08df47d3fa763aab9c0c3b';
    const CITY_ID = '1850147';
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?id=${CITY_ID}&appid=${API_KEY}&units=metric&lang=ja`;

    const response = await fetch(WEATHER_API_URL);
    const data = await response.json();
    const parsedData = parseOpenWeatherData(data);
    updateChart(parsedData);
  } catch (error) {
    document.getElementById("update-time").textContent = "天気データ取得に失敗しました";
    console.error(error);
  }
}

function parseOpenWeatherData(data) {
  const labels = [];
  const temperatures = [];
  const pressures = [];

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    labels.push(`${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}時`);
    temperatures.push(item.main.temp);
    pressures.push(item.main.pressure);
  });

  return { labels, temperatures, pressures };
}

function updateChart(data) {
  const ctx = document.getElementById("weatherChart").getContext("2d");
  if (weatherChart) weatherChart.destroy();

  // グラデーションライン
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop(0, "#ff4444");
  gradient.addColorStop(0.5, "#ffaa00");
  gradient.addColorStop(1, "#00aaff");

  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "気温 (℃)",
          data: data.temperatures,
          borderColor: "#ff5555",
          backgroundColor: "rgba(255,85,85,0.2)",
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
          pointRadius: 0
        },
        {
          label: "気圧 (hPa)",
          data: data.pressures,
          borderColor: gradient,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, labels: { color: '#e6edf3' } } },
      scales: {
        x: { ticks: { color: '#9ba1a6' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ba1a6' }, grid: { color: 'rgba(255,255,255,0.1)' }, position: 'left' },
        y1: { ticks: { color: '#9ba1a6' }, grid: { drawOnChartArea: false }, position: 'right' }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });

  document.getElementById("update-time").textContent = "最終更新: " + new Date().toLocaleTimeString();
}

fetchOpenWeatherData();
setInterval(fetchOpenWeatherData, 12 * 60 * 60 * 1000);
