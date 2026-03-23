const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const adminKey = sessionStorage.getItem('adminKey') || '';
  const playerSlug = sessionStorage.getItem('playerSlug') || '';

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey && { 'X-Admin-Key': adminKey }),
      ...(playerSlug && { 'X-Player-Slug': playerSlug }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Admin
export function adminLogin(password) {
  return apiFetch('/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
}
export function getGame() {
  return apiFetch('/admin/game');
}
export function createGame(name, year, season) {
  return apiFetch('/admin/game', { method: 'POST', body: JSON.stringify({ name, year, season }) });
}
export function updateGame(id, data) {
  return apiFetch(`/admin/game/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function lockSubmissions() {
  return apiFetch('/admin/lock', { method: 'POST' });
}
export function unlockSubmissions() {
  return apiFetch('/admin/unlock', { method: 'POST' });
}
export function getSessions() {
  return apiFetch('/admin/sessions');
}
export function saveSessions(sessions) {
  return apiFetch('/admin/sessions', { method: 'POST', body: JSON.stringify({ sessions }) });
}

// Questions
export function getQuestions() {
  return apiFetch('/questions');
}
export function createQuestion(data) {
  return apiFetch('/questions', { method: 'POST', body: JSON.stringify(data) });
}
export function updateQuestion(id, data) {
  return apiFetch(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteQuestion(id) {
  return apiFetch(`/questions/${id}`, { method: 'DELETE' });
}

// Players
export function getPlayers() {
  return apiFetch('/players');
}
export function getPlayerBySlug(slug) {
  return apiFetch(`/players/${slug}`);
}
export function createPlayer(name) {
  return apiFetch('/players', { method: 'POST', body: JSON.stringify({ name }) });
}
export function deletePlayer(id) {
  return apiFetch(`/players/${id}`, { method: 'DELETE' });
}

// Answers
export function getAnswers() {
  return apiFetch('/answers');
}
export function submitAnswer(question_id, answer_value) {
  return apiFetch('/answers', { method: 'POST', body: JSON.stringify({ question_id, answer_value }) });
}
export function submitAnswersBulk(answers) {
  return apiFetch('/answers/bulk', { method: 'POST', body: JSON.stringify({ answers }) });
}

// Actuals
export function getActuals() {
  return apiFetch('/actuals');
}
export function submitActual(question_id, actual_value) {
  return apiFetch('/actuals', { method: 'POST', body: JSON.stringify({ question_id, actual_value }) });
}

// Scores
export function getLeaderboard(session_id) {
  const params = session_id ? `?session_id=${session_id}` : '';
  return apiFetch(`/scores/leaderboard${params}`);
}
export function getPlayerScores(player_id) {
  return apiFetch(`/scores/detail/${player_id}`);
}
export function submitCustomScore(question_id, player_id, points_earned) {
  return apiFetch('/scores/custom', { method: 'POST', body: JSON.stringify({ question_id, player_id, points_earned }) });
}
export function recomputeScores() {
  return apiFetch('/scores/recompute', { method: 'POST' });
}
