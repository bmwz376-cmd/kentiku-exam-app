"""
2級建築施工管理技士 第一次検定 過去問題集
Flask Webアプリケーション
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
import json
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # 日本語のJSON出力を有効化

# 静的ファイルのパス設定
STATIC_FOLDER = 'static'
QUESTIONS_FILE = os.path.join(STATIC_FOLDER, 'data', 'questions.json')


@app.route('/')
def index():
    """トップページ"""
    return render_template('index.html')


@app.route('/questions')
def questions():
    """問題一覧ページ"""
    return render_template('questions.html')


@app.route('/quiz')
def quiz():
    """問題解答ページ"""
    return render_template('quiz.html')


@app.route('/explanation')
def explanation():
    """解説ページ"""
    return render_template('explanation.html')


@app.route('/api/questions', methods=['GET'])
def get_questions():
    """問題データを取得するAPI"""
    try:
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return jsonify(questions)
    except FileNotFoundError:
        return jsonify({'error': '問題データが見つかりません'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/questions/<question_id>', methods=['GET'])
def get_question(question_id):
    """特定の問題を取得するAPI"""
    try:
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        question = next((q for q in questions if q['id'] == question_id), None)
        
        if question:
            return jsonify(question)
        else:
            return jsonify({'error': '問題が見つかりません'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """ヘルスチェックAPI"""
    return jsonify({
        'status': 'ok',
        'message': '2級建築施工管理技士 過去問題集 API',
        'version': '1.0.1'
    })


@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラー"""
    return render_template('index.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラー"""
    return jsonify({'error': 'Internal Server Error'}), 500


if __name__ == '__main__':
    # 開発環境用
    app.run(debug=True, host='0.0.0.0', port=5000)
