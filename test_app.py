"""
アプリケーションの基本的なテスト
"""

import unittest
import json
from app import app


class TestApp(unittest.TestCase):
    """Flaskアプリケーションのテストケース"""

    def setUp(self):
        """テストのセットアップ"""
        self.app = app.test_client()
        self.app.testing = True

    def test_index_page(self):
        """トップページのテスト"""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'2級建築施工管理技士', response.data)

    def test_questions_page(self):
        """問題一覧ページのテスト"""
        response = self.app.get('/questions')
        self.assertEqual(response.status_code, 200)

    def test_quiz_page(self):
        """問題解答ページのテスト"""
        response = self.app.get('/quiz')
        self.assertEqual(response.status_code, 200)

    def test_explanation_page(self):
        """解説ページのテスト"""
        response = self.app.get('/explanation')
        self.assertEqual(response.status_code, 200)

    def test_stats_page(self):
        """統計ページのテスト"""
        response = self.app.get('/stats')
        self.assertEqual(response.status_code, 200)

    def test_api_questions(self):
        """問題API（全件取得）のテスト"""
        response = self.app.get('/api/questions')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # 最初の問題の構造を確認
        first_question = data[0]
        self.assertIn('id', first_question)
        self.assertIn('number', first_question)
        self.assertIn('year', first_question)
        self.assertIn('category', first_question)
        self.assertIn('title', first_question)
        self.assertIn('text', first_question)
        self.assertIn('choices', first_question)
        self.assertIn('correctAnswer', first_question)

    def test_api_question_by_id(self):
        """問題API（ID指定）のテスト"""
        # まず全問題を取得して最初の問題IDを取得
        response = self.app.get('/api/questions')
        data = json.loads(response.data)
        
        if len(data) > 0:
            question_id = data[0]['id']
            
            # 特定の問題を取得
            response = self.app.get(f'/api/questions/{question_id}')
            self.assertEqual(response.status_code, 200)
            
            question = json.loads(response.data)
            self.assertEqual(question['id'], question_id)

    def test_api_question_not_found(self):
        """存在しない問題のテスト"""
        response = self.app.get('/api/questions/invalid_id')
        self.assertEqual(response.status_code, 404)

    def test_api_health(self):
        """ヘルスチェックAPIのテスト"""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'ok')
        self.assertIn('version', data)

    def test_404_error(self):
        """404エラーのテスト"""
        response = self.app.get('/nonexistent-page')
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
