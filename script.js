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
nextButton.addEventListener("click", () => {
    if (index < questions.length - 1) {
        index++;
        showQuestion();
    }
});
showQuestion();
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".page").forEach(page => page.style.display = "none");
        document.getElementById(tab.dataset.target).style.display = "flex";
    });
});
const CSV_URL = "https://www.data.jma.go.jp/obd/stats/data/mdrr/pre_rct/alltable.csv";
let weatherChart;
const API_KEY = '1090dd750a08df47d3fa763aab9c0c3b';
const CITY_ID = '1850147'; // 東京
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?id=${CITY_ID}&appid=${API_KEY}&units=metric&lang=ja`;

async function fetchOpenWeatherData() {
    try {
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
        const date = new Date(item.dt * 1000); // UNIX時間を通常の時間へ
        labels.push(`${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}時`);
        temperatures.push(item.main.temp);
        pressures.push(item.main.pressure);
    });

    return { labels, temperatures, pressures };
}
③ updateChartも気圧対応に変更
今の updateChart を少しパワーアップさせます。

javascript
コピーする
編集する
function updateChart(data) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    if (weatherChart) weatherChart.destroy();
    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: "気温 (℃)",
                    data: data.temperatures,
                    borderColor: "red",
                    fill: false,
                    yAxisID: 'y',
                },
                {
                    label: "気圧 (hPa)",
                    data: data.pressures,
                    borderColor: "blue",
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: "気温 (℃)" }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "気圧 (hPa)" }
                }
            }
        }
    });
    document.getElementById("update-time").textContent = "最終更新: " + new Date().toLocaleTimeString();
}

fetchOpenWeatherData();
setInterval(fetchOpenWeatherData, 12 * 60 * 60 * 1000); // 12時間ごとに更新

fetchWeatherData();
setInterval(fetchWeatherData, 12 * 60 * 60 * 1000);
