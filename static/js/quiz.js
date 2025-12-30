// ===== 問題解答ページのスクリプト =====

let currentQuestion = null;
let selectedChoice = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestion();
    setupChoiceSelection();
});

// 問題を読み込む
async function loadQuestion() {
    const questionId = getUrlParameter('id');
    
    if (!questionId) {
        alert('問題IDが指定されていません');
        window.location.href = '/questions';
        return;
    }

    try {
        const response = await fetch('/api/questions');
        const questions = await response.json();
        currentQuestion = questions.find(q => q.id === questionId);

        if (!currentQuestion) {
            alert('問題が見つかりませんでした');
            window.location.href = '/questions';
            return;
        }

        displayQuestion();
    } catch (error) {
        console.error('問題の読み込みに失敗しました:', error);
        alert('問題の読み込みに失敗しました');
        window.location.href = '/questions';
    }
}

// 問題を表示
function displayQuestion() {
    // 問題番号
    const questionNumber = document.getElementById('questionNumber');
    if (questionNumber) {
        questionNumber.textContent = `No. ${currentQuestion.number}`;
    }

    // 年度
    const questionYear = document.getElementById('questionYear');
    if (questionYear) {
        questionYear.innerHTML = getYearName(currentQuestion.year);
    }

    // 分野
    const questionCategory = document.getElementById('questionCategory');
    if (questionCategory) {
        questionCategory.innerHTML = getCategoryName(currentQuestion.category);
    }

    // タイトル
    const questionTitle = document.getElementById('questionTitle');
    if (questionTitle) {
        questionTitle.innerHTML = currentQuestion.title;
    }

    // 問題文
    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.innerHTML = currentQuestion.text;
    }

    // 問題図（ある場合）
    const questionImage = document.getElementById('questionImage');
    if (questionImage && currentQuestion.image) {
        questionImage.innerHTML = currentQuestion.image;
    } else if (questionImage) {
        questionImage.style.display = 'none';
    }

    // 選択肢を表示
    displayChoices();
}

// 選択肢を表示
function displayChoices() {
    const choicesContainer = document.getElementById('choicesContainer');
    if (!choicesContainer) return;

    choicesContainer.innerHTML = '';

    currentQuestion.choices.forEach((choice, index) => {
        const choiceNumber = index + 1;
        const choiceItem = document.createElement('div');
        choiceItem.className = 'choice-item';
        choiceItem.dataset.choice = choiceNumber;
        choiceItem.innerHTML = `
            <div class="choice-number">${choiceNumber}</div>
            <div class="choice-text">${choice}</div>
        `;

        choicesContainer.appendChild(choiceItem);
    });
}

// 選択肢の選択をセットアップ
function setupChoiceSelection() {
    const choicesContainer = document.getElementById('choicesContainer');
    const submitButton = document.getElementById('submitAnswer');

    if (!choicesContainer || !submitButton) return;

    choicesContainer.addEventListener('click', (e) => {
        const choiceItem = e.target.closest('.choice-item');
        if (!choiceItem) return;

        // すべての選択肢から選択状態を解除
        choicesContainer.querySelectorAll('.choice-item').forEach(item => {
            item.classList.remove('selected');
        });

        // クリックした選択肢を選択状態にする
        choiceItem.classList.add('selected');
        selectedChoice = parseInt(choiceItem.dataset.choice);

        // 解答ボタンを有効化
        submitButton.disabled = false;
    });

    // 解答ボタンのクリックイベント
    submitButton.addEventListener('click', submitAnswer);
}

// 解答を送信
function submitAnswer() {
    if (!selectedChoice) return;

    const isCorrect = selectedChoice === currentQuestion.correctAnswer;
    
    // 解答を記録
    dataManager.recordAnswer(currentQuestion.id, selectedChoice, isCorrect);

    // 解説ページへ遷移
    window.location.href = `/explanation?id=${currentQuestion.id}&choice=${selectedChoice}`;
}
