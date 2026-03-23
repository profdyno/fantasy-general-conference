const { getDb } = require('../db/database');

function computeScore(question, actualValue, playerValue) {
  switch (question.scoring_type) {
    case 'boolean': {
      const match = playerValue.toLowerCase().trim() === actualValue.toLowerCase().trim();
      return { points: match ? question.points : 0, isCorrect: match };
    }

    case 'exact': {
      const match = playerValue.toLowerCase().trim() === actualValue.toLowerCase().trim();
      return { points: match ? question.points : 0, isCorrect: match };
    }

    case 'closest': {
      const actual = parseFloat(actualValue);
      const player = parseFloat(playerValue);
      if (isNaN(actual) || isNaN(player)) {
        return { points: 0, isCorrect: false };
      }
      const distance = Math.abs(player - actual);
      if (distance === 0) {
        return { points: question.points + (question.bonus_points || 0), isCorrect: true };
      }
      const tolerance = question.tolerance || 1;
      if (distance <= tolerance) {
        return { points: question.points, isCorrect: false };
      }
      const maxRange = tolerance * 3;
      if (distance >= maxRange) {
        return { points: 0, isCorrect: false };
      }
      const partial = question.points * (1 - (distance - tolerance) / (maxRange - tolerance));
      return { points: Math.round(partial * 10) / 10, isCorrect: false };
    }

    case 'contains': {
      const playerLower = playerValue.toLowerCase().trim();
      let acceptableAnswers;
      try {
        acceptableAnswers = JSON.parse(actualValue);
        if (!Array.isArray(acceptableAnswers)) acceptableAnswers = [actualValue];
      } catch {
        acceptableAnswers = [actualValue];
      }

      for (const ans of acceptableAnswers) {
        if (playerLower === ans.toLowerCase().trim()) {
          return { points: question.points, isCorrect: true };
        }
      }
      for (const ans of acceptableAnswers) {
        const ansLower = ans.toLowerCase().trim();
        if (playerLower.includes(ansLower) || ansLower.includes(playerLower)) {
          return { points: Math.round(question.points / 2), isCorrect: false };
        }
      }
      return { points: 0, isCorrect: false };
    }

    case 'custom_points': {
      // Admin scores these manually — don't auto-score
      return { points: 0, isCorrect: false };
    }

    default:
      return { points: 0, isCorrect: false };
  }
}

function scoreQuestion(questionId) {
  const db = getDb();
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
  if (!question) return;

  const actual = db.prepare('SELECT * FROM actuals WHERE question_id = ?').get(questionId);
  if (!actual) return;

  if (question.scoring_type === 'custom_points') return;

  const answers = db.prepare('SELECT * FROM answers WHERE question_id = ?').all(questionId);

  const upsert = db.prepare(`
    INSERT INTO scores (question_id, player_id, points_earned, is_correct, computed_at)
    VALUES (?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(question_id, player_id) DO UPDATE SET
      points_earned = excluded.points_earned,
      is_correct = excluded.is_correct,
      computed_at = excluded.computed_at
  `);

  const scoreBatch = db.transaction(() => {
    for (const ans of answers) {
      const { points, isCorrect } = computeScore(question, actual.actual_value, ans.answer_value);
      upsert.run(questionId, ans.player_id, points, isCorrect ? 1 : 0);
    }
  });

  scoreBatch();
}

function scoreAllQuestions(gameId) {
  const db = getDb();
  const questions = db.prepare('SELECT id FROM questions WHERE game_id = ?').all(gameId);
  for (const q of questions) {
    scoreQuestion(q.id);
  }
}

module.exports = { scoreQuestion, scoreAllQuestions, computeScore };
