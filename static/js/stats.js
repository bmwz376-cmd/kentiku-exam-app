// ===== 学習統計ページのスクリプト =====

let allQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    displayStatistics();
    displayCharts();
    displayWeakPoints();
    setupResetButton();
});

// 問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        allQuestions = await response.json();
    } catch (error) {
        console.error('問題データの読み込みに失敗しました:', error);
        allQuestions = [];
    }
}

// 統計を表示
function displayStatistics() {
    const stats = dataManager.getStatistics();

    const totalAnswered = document.getElementById('totalAnswered');
    if (totalAnswered) {
        totalAnswered.textContent = stats.totalAnswered;
    }

    const accuracyRate = document.getElementById('accuracyRate');
    if (accuracyRate) {
        accuracyRate.textContent = `${stats.accuracy}%`;
    }

    const currentStreak = document.getElementById('currentStreak');
    if (currentStreak) {
        currentStreak.textContent = stats.currentStreak;
    }

    const maxStreak = document.getElementById('maxStreak');
    if (maxStreak) {
        maxStreak.textContent = stats.maxStreak;
    }
}

// チャートを表示
function displayCharts() {
    displayCategoryChart();
    displayYearChart();
}

// 分野別チャート
function displayCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const categoryStats = dataManager.getCategoryStatistics(allQuestions);
    
    const labels = [];
    const accuracyData = [];
    const answeredData = [];

    const categoryNames = {
        'architecture': '建築学',
        'structure': '構造',
        'construction': '施工',
        'management': '施工管理法',
        'law': '法規'
    };

    Object.keys(categoryStats).forEach(category => {
        const stat = categoryStats[category];
        labels.push(categoryNames[category] || category);
        
        const accuracy = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
        accuracyData.push(accuracy);
        
        const answeredPercentage = Math.round((stat.answered / stat.total) * 100);
        answeredData.push(answeredPercentage);
    });

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '正答率 (%)',
                    data: accuracyData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2
                },
                {
                    label: '学習進捗 (%)',
                    data: answeredData,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// 年度別チャート
function displayYearChart() {
    const canvas = document.getElementById('yearChart');
    if (!canvas) return;

    const yearStats = dataManager.getYearStatistics(allQuestions);
    
    const labels = [];
    const totalData = [];
    const answeredData = [];
    const correctData = [];

    const yearOrder = ['r03', 'r04', 'r05', 'r06', 'r07'];
    const yearNames = {
        'r07': '令和7年度',
        'r06': '令和6年度',
        'r05': '令和5年度',
        'r04': '令和4年度',
        'r03': '令和3年度'
    };

    yearOrder.forEach(year => {
        if (yearStats[year]) {
            const stat = yearStats[year];
            labels.push(yearNames[year] || year);
            totalData.push(stat.total);
            answeredData.push(stat.answered);
            correctData.push(stat.correct);
        }
    });

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '総問題数',
                    data: totalData,
                    borderColor: 'rgba(100, 116, 139, 1)',
                    backgroundColor: 'rgba(100, 116, 139, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: '解答済み',
                    data: answeredData,
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: '正解数',
                    data: correctData,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// 苦手分野を表示
function displayWeakPoints() {
    const weakPointsList = document.getElementById('weakPointsList');
    if (!weakPointsList) return;

    const categoryStats = dataManager.getCategoryStatistics(allQuestions);
    const weakPoints = [];

    const categoryNames = {
        'architecture': '建築学',
        'structure': '構造',
        'construction': '施工',
        'management': '施工管理法',
        'law': '法規'
    };

    Object.keys(categoryStats).forEach(category => {
        const stat = categoryStats[category];
        if (stat.answered >= 3) {
            const accuracy = Math.round((stat.correct / stat.answered) * 100);
            if (accuracy < 70) {
                weakPoints.push({
                    category: categoryNames[category] || category,
                    accuracy: accuracy,
                    answered: stat.answered,
                    correct: stat.correct
                });
            }
        }
    });

    weakPoints.sort((a, b) => a.accuracy - b.accuracy);

    if (weakPoints.length === 0) {
        weakPointsList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-smile" style="font-size: 3rem; margin-bottom: 15px; color: var(--success-color);"></i>
                <p><ruby>苦手<rt>にがて</rt>分野<rt>ぶんや</rt>はありません！素晴<rt>すば</rt>らしいです！</ruby></p>
            </div>
        `;
        return;
    }

    weakPointsList.innerHTML = '';

    weakPoints.forEach(weak => {
        const weakItem = document.createElement('div');
        weakItem.className = 'weak-point-item';
        weakItem.innerHTML = `
            <h4>${weak.category}</h4>
            <p><ruby>正答<rt>せいとう</rt>率<rt>りつ</rt></ruby>: ${weak.accuracy}% (${weak.correct}/${weak.answered}<ruby>問<rt>もん</rt></ruby>)</p>
            <p><ruby>この分野<rt>ぶんや</rt>を重点的<rt>じゅうてんてき</rt>に復習<rt>ふくしゅう</rt>しましょう</ruby></p>
        `;
        weakPointsList.appendChild(weakItem);
    });
}

// リセットボタンをセットアップ
function setupResetButton() {
    const resetButton = document.getElementById('resetProgress');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            dataManager.resetAllData();
        });
    }
}
