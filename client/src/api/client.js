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
export function getAllGames() {
  return apiFetch('/admin/games');
}
export function createGame(name, year, season) {
  return apiFetch('/admin/game', { method: 'POST', body: JSON.stringify({ name, year, season }) });
}
export function updateGame(id, data) {
  return apiFetch(`/admin/game/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function activateGame(id) {
  return apiFetch(`/admin/game/${id}/activate`, { method: 'POST' });
}
export function deleteGame(id) {
  return apiFetch(`/admin/game/${id}`, { method: 'DELETE' });
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
export function createPlayer(name, email, role, parent1_id, parent2_id) {
  return apiFetch('/players', { method: 'POST', body: JSON.stringify({ name, email, role, parent1_id, parent2_id }) });
}
export function updatePlayer(id, data) {
  return apiFetch(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) });
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

export function getAllAnswers() {
  return apiFetch('/answers/all');
}

// Actuals
export function getActuals() {
  return apiFetch('/actuals');
}
export function submitActual(question_id, actual_value) {
  return apiFetch('/actuals', { method: 'POST', body: JSON.stringify({ question_id, actual_value }) });
}

// Scores
export function getScoreMatrix() {
  return apiFetch('/scores/matrix');
}
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

// Penalties
export function getPenalties() {
  return apiFetch('/penalties');
}
export function updatePenalty(player_id, penalty_type, count) {
  return apiFetch('/penalties', { method: 'POST', body: JSON.stringify({ player_id, penalty_type, count }) });
}
export function getAllowedPenalties(slug) {
  return apiFetch(`/penalties/allowed/${slug}`);
}
export function updatePenaltyAsPlayer(slug, target_player_id, penalty_type, count) {
  return apiFetch('/penalties/player', { method: 'POST', body: JSON.stringify({ slug, target_player_id, penalty_type, count }) });
}
