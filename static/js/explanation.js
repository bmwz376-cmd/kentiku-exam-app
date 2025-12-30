// ===== 解答・解説ページのスクリプト =====

let currentQuestion = null;
let userChoice = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestion();
    displayExplanation();
    setupActions();
});

// 問題を読み込む
async function loadQuestion() {
    const questionId = getUrlParameter('id');
    userChoice = parseInt(getUrlParameter('choice'));

    if (!questionId || !userChoice) {
        alert('問題情報が不足しています');
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
    } catch (error) {
        console.error('問題の読み込みに失敗しました:', error);
        alert('問題の読み込みに失敗しました');
        window.location.href = '/questions';
    }
}

// 解説を表示
function displayExplanation() {
    const isCorrect = userChoice === currentQuestion.correctAnswer;

    // 結果バナーを表示
    displayResultBanner(isCorrect);

    // 問題情報を表示
    displayQuestionInfo();

    // 解答結果を表示
    displayAnswerResult(isCorrect);

    // 詳細解説を表示
    displayDetailedExplanation();

    // 各選択肢の解説を表示
    displayChoicesExplanation();

    // 参考図表を表示
    displayReferenceImages();

    // 関連法令・基準を表示
    displayLawReferences();

    // ワンポイントアドバイスを表示
    displayTip();
}

// 結果バナーを表示
function displayResultBanner(isCorrect) {
    const resultBanner = document.getElementById('resultBanner');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');

    if (!resultBanner || !resultIcon || !resultText) return;

    if (isCorrect) {
        resultBanner.className = 'result-banner correct';
        resultIcon.className = 'fas fa-check-circle result-icon';
        resultText.innerHTML = '<ruby>正解<rt>せいかい</rt>です！</ruby>';
    } else {
        resultBanner.className = 'result-banner incorrect';
        resultIcon.className = 'fas fa-times-circle result-icon';
        resultText.innerHTML = '<ruby>不正解<rt>ふせいかい</rt>です</ruby>';
    }
}

// 問題情報を表示
function displayQuestionInfo() {
    const questionNumber = document.getElementById('questionNumber');
    if (questionNumber) {
        questionNumber.textContent = `No. ${currentQuestion.number}`;
    }

    const questionYear = document.getElementById('questionYear');
    if (questionYear) {
        questionYear.innerHTML = getYearName(currentQuestion.year);
    }

    const questionCategory = document.getElementById('questionCategory');
    if (questionCategory) {
        questionCategory.innerHTML = getCategoryName(currentQuestion.category);
    }

    const questionTitle = document.getElementById('questionTitle');
    if (questionTitle) {
        questionTitle.innerHTML = currentQuestion.title;
    }

    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.innerHTML = currentQuestion.text;
    }

    // 問題図（ある場合）
    const questionImage = document.getElementById('questionImage');
    if (questionImage && currentQuestion.image) {
        questionImage.innerHTML = currentQuestion.image;
        questionImage.style.display = 'block';
        
        // 画像読み込みエラーハンドリング
        const img = questionImage.querySelector('img');
        if (img) {
            img.onerror = function() {
                questionImage.style.display = 'none';
                console.log('画像が読み込めませんでした:', img.src);
            };
        }
    } else if (questionImage) {
        questionImage.style.display = 'none';
    }
}

// 解答結果を表示
function displayAnswerResult(isCorrect) {
    const userAnswer = document.getElementById('userAnswer');
    const correctAnswer = document.getElementById('correctAnswer');

    if (userAnswer) {
        userAnswer.textContent = userChoice;
        if (!isCorrect) {
            userAnswer.style.color = 'var(--error-color)';
        }
    }

    if (correctAnswer) {
        correctAnswer.textContent = currentQuestion.correctAnswer;
    }
}

// 詳細解説を表示
function displayDetailedExplanation() {
    const explanationContent = document.getElementById('explanationContent');
    if (!explanationContent) return;

    explanationContent.innerHTML = currentQuestion.explanation.main;
}

// 各選択肢の解説を表示
function displayChoicesExplanation() {
    const choicesExplanation = document.getElementById('choicesExplanation');
    if (!choicesExplanation) return;

    choicesExplanation.innerHTML = '';

    currentQuestion.explanation.choices.forEach((explanation, index) => {
        const choiceNumber = index + 1;
        const isCorrectChoice = choiceNumber === currentQuestion.correctAnswer;
        const isUserChoice = choiceNumber === userChoice;

        const choiceItem = document.createElement('div');
        choiceItem.className = `choice-explanation-item ${isCorrectChoice ? 'correct' : ''}`;
        
        let statusIcon = '';
        if (isCorrectChoice) {
            statusIcon = '<i class="fas fa-check-circle" style="color: var(--success-color);"></i>';
        } else {
            statusIcon = '<i class="fas fa-times-circle" style="color: var(--error-color);"></i>';
        }

        choiceItem.innerHTML = `
            <div class="choice-explanation-header">
                ${statusIcon}
                <ruby>選択<rt>せんたく</rt>肢<rt>し</rt></ruby> ${choiceNumber}
                ${isUserChoice ? '<span style="margin-left: 10px; color: var(--primary-color);">(<ruby>あなたの解答<rt>かいとう</rt></ruby>)</span>' : ''}
            </div>
            <div class="choice-explanation-text">${explanation}</div>
        `;

        choicesExplanation.appendChild(choiceItem);
    });
}

// 参考図表を表示
function displayReferenceImages() {
    const referenceSection = document.getElementById('referenceSection');
    const referenceImages = document.getElementById('referenceImages');

    if (!referenceSection || !referenceImages) return;

    // 詳細図解説明がある場合
    if (currentQuestion.explanation && currentQuestion.explanation.detailedDiagram) {
        referenceSection.style.display = 'block';
        referenceImages.innerHTML = `
            <div class="detailed-diagram-section" style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.8; color: #333;">
                ${currentQuestion.explanation.detailedDiagram}
            </div>
        `;
        return;
    }

    // 画像がある場合
    if (!currentQuestion.referenceImages || currentQuestion.referenceImages.length === 0) {
        referenceSection.style.display = 'none';
        return;
    }

    referenceImages.innerHTML = '';

    let hasValidImages = false;
    currentQuestion.referenceImages.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'reference-image-item';
        imageItem.innerHTML = `
            ${image.content}
            <p class="reference-image-caption">${image.caption}</p>
        `;
        referenceImages.appendChild(imageItem);
        
        // 画像読み込みエラーハンドリング
        const img = imageItem.querySelector('img');
        if (img) {
            img.onload = function() {
                hasValidImages = true;
            };
            img.onerror = function() {
                imageItem.style.display = 'none';
                console.log('参考画像が読み込めませんでした:', img.src);
                
                // すべての画像が読み込めない場合はセクションを非表示
                setTimeout(() => {
                    if (!hasValidImages) {
                        referenceSection.style.display = 'none';
                    }
                }, 100);
            };
        }
    });
}

// 関連法令・基準を表示
function displayLawReferences() {
    const lawSection = document.getElementById('lawSection');
    const lawContent = document.getElementById('lawContent');

    if (!lawSection || !lawContent) return;

    if (!currentQuestion.lawReferences || currentQuestion.lawReferences.length === 0) {
        lawSection.style.display = 'none';
        return;
    }

    lawContent.innerHTML = '';

    currentQuestion.lawReferences.forEach(law => {
        const lawItem = document.createElement('div');
        lawItem.style.marginBottom = '15px';
        lawItem.innerHTML = `
            <strong>${law.name}</strong><br>
            ${law.content}
        `;
        lawContent.appendChild(lawItem);
    });
}

// ワンポイントアドバイスを表示
function displayTip() {
    const tipSection = document.getElementById('tipSection');
    const tipContent = document.getElementById('tipContent');

    if (!tipSection || !tipContent) return;

    if (!currentQuestion.tip) {
        tipSection.style.display = 'none';
        return;
    }

    tipContent.textContent = currentQuestion.tip;
}

// アクションボタンをセットアップ
function setupActions() {
    const nextQuestion = document.getElementById('nextQuestion');
    const reviewAgain = document.getElementById('reviewAgain');

    if (nextQuestion) {
        nextQuestion.addEventListener('click', goToNextQuestion);
    }

    if (reviewAgain) {
        reviewAgain.addEventListener('click', () => {
            window.location.href = `/quiz?id=${currentQuestion.id}`;
        });
    }
}

// 次の問題へ
async function goToNextQuestion() {
    try {
        const response = await fetch('/api/questions');
        const questions = await response.json();
        
        const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
        const nextIndex = (currentIndex + 1) % questions.length;
        const nextQuestion = questions[nextIndex];

        window.location.href = `/quiz?id=${nextQuestion.id}`;
    } catch (error) {
        console.error('次の問題の読み込みに失敗しました:', error);
        window.location.href = '/questions';
    }
}
