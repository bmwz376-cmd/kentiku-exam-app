// ===== トップページのスクリプト =====

document.addEventListener('DOMContentLoaded', () => {
    updateStatistics();
});

function updateStatistics() {
    const stats = dataManager.getStatistics();
    
    // 解答済み数を更新
    const answeredCount = document.getElementById('answeredCount');
    if (answeredCount) {
        answeredCount.textContent = stats.totalAnswered;
    }
    
    // 正答率を更新
    const accuracy = document.getElementById('accuracy');
    if (accuracy) {
        accuracy.textContent = stats.accuracy;
    }
    
    // 連続正解を更新
    const streak = document.getElementById('streak');
    if (streak) {
        streak.textContent = stats.currentStreak;
    }
}
