// ===== 問題一覧ページのスクリプト =====

let allQuestions = [];
let filteredQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    setupFilters();
    // 初期表示はr07年度のみ
    applyFilters();
});

// 問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        allQuestions = await response.json();
        filteredQuestions = [...allQuestions];
        console.log('✅ クイズデータ読み込み成功:', allQuestions.length, '問');
        // 年度別問題数を表示
        const r07Questions = allQuestions.filter(q => q.year === 'r07');
        const r06Questions = allQuestions.filter(q => q.year === 'r06');
        const r05Questions = allQuestions.filter(q => q.year === 'r05');
        const r04Questions = allQuestions.filter(q => q.year === 'r04');
        const r03Questions = allQuestions.filter(q => q.year === 'r03');
        console.log('r07問題数:', r07Questions.length, '問（問題1-50）');
        console.log('r06問題数:', r06Questions.length, '問（問題1-50）');
        console.log('r05問題数:', r05Questions.length, '問（問題1-50）');
        console.log('r04問題数:', r04Questions.length, '問（問題1-50）');
        console.log('r03問題数:', r03Questions.length, '問（問題1-50）');
    } catch (error) {
        console.error('問題データの読み込みに失敗しました:', error);
        allQuestions = [];
        filteredQuestions = [];
    }
}

// フィルターをセットアップ
function setupFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');

    yearFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
}

// フィルターを適用
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    filteredQuestions = allQuestions.filter(question => {
        // 年度フィルター
        if (yearFilter !== 'all' && question.year !== yearFilter) {
            return false;
        }

        // 分野フィルター
        if (categoryFilter !== 'all' && question.category !== categoryFilter) {
            return false;
        }

        // 学習状況フィルター
        if (statusFilter !== 'all') {
            const answer = dataManager.getAnswerStatus(question.id);
            if (statusFilter === 'unanswered' && answer) {
                return false;
            }
            if (statusFilter === 'correct' && (!answer || !answer.isCorrect)) {
                return false;
            }
            if (statusFilter === 'incorrect' && (!answer || answer.isCorrect)) {
                return false;
            }
        }

        // 検索フィルター
        if (searchText) {
            const questionText = question.title.toLowerCase() + ' ' + question.text.toLowerCase();
            if (!questionText.includes(searchText)) {
                return false;
            }
        }

        return true;
    });

    displayQuestions();
}

// 問題を表示
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    const displayCount = document.getElementById('displayCount');
    const totalCount = document.getElementById('totalCount');

    if (!questionsList) return;

    // 表示数を更新
    displayCount.textContent = filteredQuestions.length;
    totalCount.textContent = allQuestions.length;

    // 問題リストをクリア
    questionsList.innerHTML = '';

    if (filteredQuestions.length === 0) {
        questionsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p><ruby>該当<rt>がいとう</rt>する問題<rt>もんだい</rt>が見<rt>み</rt>つかりませんでした</ruby></p>
            </div>
        `;
        return;
    }

    // 問題を表示
    filteredQuestions.forEach(question => {
        const answer = dataManager.getAnswerStatus(question.id);
        let statusIcon = '';
        let statusClass = 'status-unanswered';

        if (answer) {
            if (answer.isCorrect) {
                statusIcon = '<i class="fas fa-check-circle status-icon status-correct"></i>';
                statusClass = 'status-correct';
            } else {
                statusIcon = '<i class="fas fa-times-circle status-icon status-incorrect"></i>';
                statusClass = 'status-incorrect';
            }
        } else {
            statusIcon = '<i class="far fa-circle status-icon status-unanswered"></i>';
        }

        const questionItem = document.createElement('a');
        questionItem.href = `/quiz?id=${question.id}`;
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <div class="question-item-header">
                <div class="question-item-meta">
                    <span class="badge badge-number">No. ${question.number}</span>
                    <span class="badge badge-year">${getYearName(question.year)}</span>
                    <span class="badge badge-category">${getCategoryName(question.category)}</span>
                </div>
                ${statusIcon}
            </div>
            <div class="question-item-title">${question.title}</div>
        `;

        questionsList.appendChild(questionItem);
    });
}
