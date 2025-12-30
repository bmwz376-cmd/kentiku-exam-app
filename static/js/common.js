// ===== 共通関数・データ管理 =====

// LocalStorageのキー
const STORAGE_KEYS = {
    USER_ANSWERS: 'construction_exam_answers',
    STATISTICS: 'construction_exam_stats'
};

// データ管理クラス
class DataManager {
    constructor() {
        this.loadData();
    }

    // データの読み込み
    loadData() {
        const answersData = localStorage.getItem(STORAGE_KEYS.USER_ANSWERS);
        const statsData = localStorage.getItem(STORAGE_KEYS.STATISTICS);

        this.userAnswers = answersData ? JSON.parse(answersData) : {};
        this.statistics = statsData ? JSON.parse(statsData) : {
            totalAnswered: 0,
            correctCount: 0,
            incorrectCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            categoryStats: {},
            yearStats: {}
        };
    }

    // データの保存
    saveData() {
        localStorage.setItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(this.userAnswers));
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(this.statistics));
    }

    // 解答を記録（修正版）
    recordAnswer(questionId, userChoice, isCorrect) {
        const previousAnswer = this.userAnswers[questionId];
        
        // 解答を記録
        this.userAnswers[questionId] = {
            choice: userChoice,
            isCorrect: isCorrect,
            timestamp: Date.now()
        };

        // 統計を更新（同じ問題の再解答でも正しく処理）
        if (!previousAnswer) {
            // 初回解答の場合
            if (isCorrect) {
                this.statistics.currentStreak++;
                if (this.statistics.currentStreak > this.statistics.maxStreak) {
                    this.statistics.maxStreak = this.statistics.currentStreak;
                }
            } else {
                this.statistics.currentStreak = 0;
            }
        } else {
            // 再解答の場合
            // 前回と違う結果の場合のみ連続正解を更新
            if (previousAnswer.isCorrect !== isCorrect) {
                if (isCorrect) {
                    this.statistics.currentStreak++;
                    if (this.statistics.currentStreak > this.statistics.maxStreak) {
                        this.statistics.maxStreak = this.statistics.currentStreak;
                    }
                } else {
                    this.statistics.currentStreak = 0;
                }
            }
        }

        this.saveData();
    }

    // 問題の解答状態を取得
    getAnswerStatus(questionId) {
        return this.userAnswers[questionId] || null;
    }

    // 統計情報を取得（修正版）
    getStatistics() {
        const totalAnswered = Object.keys(this.userAnswers).length;
        const correctCount = Object.values(this.userAnswers).filter(a => a.isCorrect).length;
        const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

        // 連続正解を再計算（タイムスタンプ順に並べて計算）
        const sortedAnswers = Object.entries(this.userAnswers)
            .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
        
        let currentStreak = 0;
        for (let i = sortedAnswers.length - 1; i >= 0; i--) {
            if (sortedAnswers[i][1].isCorrect) {
                currentStreak++;
            } else {
                break;
            }
        }

        // maxStreakも再計算
        let maxStreak = 0;
        let tempStreak = 0;
        for (const [, answer] of sortedAnswers) {
            if (answer.isCorrect) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        return {
            totalAnswered,
            correctCount,
            incorrectCount: totalAnswered - correctCount,
            accuracy,
            currentStreak,
            maxStreak
        };
    }

    // データをリセット
    resetAllData() {
        if (confirm('すべての学習履歴を削除してもよろしいですか?\nこの操作は取り消せません。')) {
            localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS);
            localStorage.removeItem(STORAGE_KEYS.STATISTICS);
            this.loadData();
            location.reload();
        }
    }

    // 分野別統計を取得
    getCategoryStatistics(questions) {
        const categoryStats = {};
        
        questions.forEach(q => {
            if (!categoryStats[q.category]) {
                categoryStats[q.category] = {
                    total: 0,
                    answered: 0,
                    correct: 0
                };
            }
            
            categoryStats[q.category].total++;
            
            const answer = this.userAnswers[q.id];
            if (answer) {
                categoryStats[q.category].answered++;
                if (answer.isCorrect) {
                    categoryStats[q.category].correct++;
                }
            }
        });

        return categoryStats;
    }

    // 年度別統計を取得
    getYearStatistics(questions) {
        const yearStats = {};
        
        questions.forEach(q => {
            if (!yearStats[q.year]) {
                yearStats[q.year] = {
                    total: 0,
                    answered: 0,
                    correct: 0
                };
            }
            
            yearStats[q.year].total++;
            
            const answer = this.userAnswers[q.id];
            if (answer) {
                yearStats[q.year].answered++;
                if (answer.isCorrect) {
                    yearStats[q.year].correct++;
                }
            }
        });

        return yearStats;
    }
}

// グローバルなデータマネージャーインスタンス
const dataManager = new DataManager();

// ルビを適用する関数
function applyRuby(text) {
    // 既にrubyタグが含まれている場合はそのまま返す
    if (text.includes('<ruby>')) {
        return text;
    }
    return text;
}

// ルビタグを正しい形式に修正する関数
function fixRubyTags(html) {
    if (!html || typeof html !== 'string') {
        return html;
    }
    
    // 大きなrubyタグで囲まれた文章を個別のrubyタグに分割
    // <ruby>テキスト1<rt>ルビ1</rt>テキスト2<rt>ルビ2</rt>...</ruby> を分解
    
    let result = html;
    
    // 大きなrubyタグを見つけて処理
    const rubyRegex = /<ruby>([\s\S]*?)<\/ruby>/g;
    
    result = result.replace(rubyRegex, (match, content) => {
        // ruby内に複数のrtタグがあるかチェック
        const rtCount = (content.match(/<rt>/g) || []).length;
        
        if (rtCount <= 1) {
            // rtが1つ以下なら正常なのでそのまま返す
            return match;
        }
        
        // 複数のrtタグがある場合、分割して修正
        let fixed = '';
        let parts = content.split(/<rt>|<\/rt>/);
        
        // parts配列: [テキスト0, ルビ1, テキスト1, ルビ2, テキスト2, ...]
        for (let i = 0; i < parts.length; i++) {
            if (i === 0) {
                // 最初のテキスト部分（ルビなし）
                fixed += parts[i];
            } else if (i % 2 === 1) {
                // 奇数番目はルビ部分
                const rubyText = parts[i];
                const nextText = parts[i + 1] || '';
                
                // ルビ対象の単語を抽出（次のテキスト部分の先頭から取得）
                // 簡易的に、ルビテキストの長さ分を逆算
                // より精密には形態素解析が必要だが、ここでは近似的に処理
                
                // 前のテキストの末尾から単語を特定
                // ここでは簡易的にrtタグの前後関係から推測
                
                // 実際には、元のHTMLデータ修正が必要
                // JavaScript側での完全な修正は困難
            }
        }
        
        // 暫定的に元のHTMLを返す（データ修正が必要）
        return match;
    });
    
    return result;
}

// カテゴリー名を日本語に変換
function getCategoryName(category) {
    const categoryNames = {
        'architecture': '<ruby>建築<rt>けんちく</rt>学<rt>がく</rt></ruby>',
        'structure': '<ruby>構造<rt>こうぞう</rt></ruby>',
        'construction': '<ruby>施工<rt>せこう</rt></ruby>',
        'management': '<ruby>施工<rt>せこう</rt>管理<rt>かんり</rt>法<rt>ほう</rt></ruby>',
        'law': '<ruby>法規<rt>ほうき</rt></ruby>'
    };
    return categoryNames[category] || category;
}

// 年度を日本語に変換
function getYearName(year) {
    const yearMap = {
        'r07': '<ruby>令和<rt>れいわ</rt>7年<rt>ねん</rt>度<rt>ど</rt></ruby>',
        'r06': '<ruby>令和<rt>れいわ</rt>6年<rt>ねん</rt>度<rt>ど</rt></ruby>',
        'r05': '<ruby>令和<rt>れいわ</rt>5年<rt>ねん</rt>度<rt>ど</rt></ruby>',
        'r04': '<ruby>令和<rt>れいわ</rt>4年<rt>ねん</rt>度<rt>ど</rt></ruby>',
        'r03': '<ruby>令和<rt>れいわ</rt>3年<rt>ねん</rt>度<rt>ど</rt></ruby>'
    };
    return yearMap[year] || year;
}

// URLパラメータを取得
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// URLパラメータを設定
function setUrlParameter(name, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}
