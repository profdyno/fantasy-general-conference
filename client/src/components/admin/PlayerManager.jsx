import { useState, useEffect } from 'react'
import { getPlayers, createPlayer, deletePlayer, updatePlayer } from '../../api/client'

const styles = {
  addForm: {
    background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '20px',
    border: '1px solid #e5e7eb',
  },
  addRow: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  input: {
    flex: 1, minWidth: '140px', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '14px',
  },
  select: {
    padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px',
  },
  addBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
  },
  card: {
    background: '#fff', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px',
    border: '1px solid #e5e7eb',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
  },
  name: { fontWeight: 500, fontSize: '15px' },
  email: { fontSize: '13px', color: '#555', marginTop: '2px' },
  noEmail: { fontSize: '13px', color: '#aaa', fontStyle: 'italic', marginTop: '2px', cursor: 'pointer' },
  url: { fontSize: '11px', color: '#888', marginTop: '2px', fontFamily: 'monospace' },
  roleBadge: {
    display: 'inline-block', fontSize: '11px', fontWeight: 700, padding: '2px 8px',
    borderRadius: '3px', marginLeft: '8px', verticalAlign: 'middle',
  },
  grandparent: { background: '#fef3c7', color: '#92400e' },
  parent: { background: '#dbeafe', color: '#1e40af' },
  child: { background: '#dcfce7', color: '#166534' },
  parentInfo: { fontSize: '12px', color: '#666', marginTop: '2px' },
  actions: { display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' },
  sendBtn: {
    background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  sendBtnDisabled: {
    background: '#f9fafb', color: '#999', border: '1px solid #e5e7eb',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: 'not-allowed',
  },
  copyBtn: {
    background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  removeBtn: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
  },
  feedback: { fontSize: '11px', color: '#16a34a', fontWeight: 500 },
  count: { fontSize: '13px', color: '#888', marginBottom: '12px' },
  editRow: {
    display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '8px',
    borderTop: '1px solid #f1f5f9', alignItems: 'center', flexWrap: 'wrap',
  },
  editInput: {
    flex: 1, minWidth: '120px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px',
  },
  editSelect: {
    padding: '6px 10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px',
  },
  editBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px',
    padding: '5px 12px', fontSize: '12px', fontWeight: 500,
  },
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

const ROLES = [
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
]

export default function PlayerManager() {
  const [players, setPlayers] = useState([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('parent')
  const [newParent1, setNewParent1] = useState('')
  const [newParent2, setNewParent2] = useState('')
  const [feedback, setFeedback] = useState({})
  const [editing, setEditing] = useState(null) // player id
  const [editForm, setEditForm] = useState({})

  useEffect(() => { loadPlayers() }, [])

  async function loadPlayers() {
    const ps = await getPlayers()
    setPlayers(ps)
  }

  function showFeedback(id, msg) {
    setFeedback(prev => ({ ...prev, [id]: msg }))
    setTimeout(() => setFeedback(prev => { const next = { ...prev }; delete next[id]; return next }), 2500)
  }

  const parents = players.filter(p => p.role === 'parent' || p.role === 'grandparent')

  async function handleAdd() {
    if (!newName.trim()) return
    await createPlayer(
      newName.trim(),
      newEmail.trim() || undefined,
      newRole,
      newRole === 'child' && newParent1 ? Number(newParent1) : undefined,
      newRole === 'child' && newParent2 ? Number(newParent2) : undefined,
    )
    setNewName(''); setNewEmail(''); setNewRole('parent'); setNewParent1(''); setNewParent2('')
    loadPlayers()
  }

  async function handleRemove(id) {
    if (!confirm('Remove this player?')) return
    await deletePlayer(id)
    loadPlayers()
  }

  function handleCopy(player) {
    const url = `${window.location.origin}/play/${player.slug}`
    copyToClipboard(url)
    showFeedback(player.id, 'Copied!')
  }

  function handleSendLink(player) {
    if (!player.email) return
    const url = `${window.location.origin}/play/${player.slug}`
    const helpUrl = `${window.location.origin}/help`

    // Find children of this player
    const children = players.filter(p => p.role === 'child' && (p.parent1_id === player.id || p.parent2_id === player.id))

    let childrenSection = ''
    if (children.length > 0) {
      childrenSection = `\n\nYour children's game links:\n` +
        children.map(c => `${c.name}: ${window.location.origin}/play/${c.slug}`).join('\n') +
        `\n\nPlease share each child's link with them individually. Each link is private!`
    }

    const subject = encodeURIComponent('Fantasy General Conference - Your Game Link')
    const body = encodeURIComponent(
      `Hi ${player.name}!\n\nYou've been invited to play Fantasy General Conference!\n\nYour personal game link (keep this private!):\n${url}${childrenSection}\n\nHow to play:\n1. Open your link above\n2. Answer each prediction question before conference starts\n3. Click "Save Answers" at the bottom\n4. Watch the live scoreboard during conference to see how you're doing!\n\nFor full rules and scoring details, visit:\n${helpUrl}\n\nGood luck!`
    )
    window.open(`mailto:${player.email}?subject=${subject}&body=${body}`, '_self')
    showFeedback(player.id, 'Email opened!')
  }

  function startEdit(p) {
    setEditing(p.id)
    setEditForm({ email: p.email || '', role: p.role || 'parent', parent1_id: p.parent1_id || '', parent2_id: p.parent2_id || '' })
  }

  async function saveEdit(playerId) {
    await updatePlayer(playerId, {
      email: editForm.email || null,
      role: editForm.role,
      parent1_id: editForm.role === 'child' ? (editForm.parent1_id || null) : null,
      parent2_id: editForm.role === 'child' ? (editForm.parent2_id || null) : null,
    })
    setEditing(null)
    loadPlayers()
    showFeedback(playerId, 'Updated!')
  }

  function getParentNames(p) {
    if (p.role !== 'child') return null
    const names = []
    if (p.parent1_id) { const par = players.find(x => x.id === p.parent1_id); if (par) names.push(par.name) }
    if (p.parent2_id) { const par = players.find(x => x.id === p.parent2_id); if (par) names.push(par.name) }
    return names.length > 0 ? names.join(' & ') : null
  }

  return (
    <div>
      <div style={styles.addForm}>
        <div style={styles.addRow}>
          <input style={styles.input} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Player name" />
          <input style={styles.input} value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Email (optional)" type="email" />
          <select style={styles.select} value={newRole} onChange={e => setNewRole(e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button style={styles.addBtn} onClick={handleAdd}>Add Player</button>
        </div>
        {newRole === 'child' && (
          <div style={styles.addRow}>
            <select style={{ ...styles.select, flex: 1 }} value={newParent1} onChange={e => setNewParent1(e.target.value)}>
              <option value="">-- Mom/Dad 1 --</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={{ ...styles.select, flex: 1 }} value={newParent2} onChange={e => setNewParent2(e.target.value)}>
              <option value="">-- Mom/Dad 2 --</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={styles.count}>{players.length} players</div>

      {players.map(p => (
        <div key={p.id} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.name}>
                {p.name}
                <span style={{ ...styles.roleBadge, ...styles[p.role || 'parent'] }}>
                  {(p.role || 'parent').charAt(0).toUpperCase() + (p.role || 'parent').slice(1)}
                </span>
              </div>
              {p.email && <div style={styles.email}>{p.email}</div>}
              {!p.email && <div style={styles.noEmail} onClick={() => startEdit(p)}>No email - click to edit</div>}
              {getParentNames(p) && <div style={styles.parentInfo}>Parents: {getParentNames(p)}</div>}
              <div style={styles.url}>/play/{p.slug}</div>
            </div>
            <div style={styles.actions}>
              {feedback[p.id] ? (
                <span style={styles.feedback}>{feedback[p.id]}</span>
              ) : (
                <>
                  <button style={p.email ? styles.sendBtn : styles.sendBtnDisabled} onClick={() => handleSendLink(p)} title={p.email ? `Send to ${p.email}` : 'Add email first'}>Send Link</button>
                  <button style={styles.copyBtn} onClick={() => handleCopy(p)}>Copy URL</button>
                  <button style={styles.copyBtn} onClick={() => startEdit(p)}>Edit</button>
                </>
              )}
              <button style={styles.removeBtn} onClick={() => handleRemove(p.id)}>Remove</button>
            </div>
          </div>
          {editing === p.id && (
            <div style={styles.editRow}>
              <input style={styles.editInput} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" />
              <select style={styles.editSelect} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {editForm.role === 'child' && (
                <>
                  <select style={styles.editSelect} value={editForm.parent1_id} onChange={e => setEditForm(f => ({ ...f, parent1_id: e.target.value }))}>
                    <option value="">-- Mom/Dad 1 --</option>
                    {parents.filter(x => x.id !== p.id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <select style={styles.editSelect} value={editForm.parent2_id} onChange={e => setEditForm(f => ({ ...f, parent2_id: e.target.value }))}>
                    <option value="">-- Mom/Dad 2 --</option>
                    {parents.filter(x => x.id !== p.id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </>
              )}
              <button style={styles.editBtn} onClick={() => saveEdit(p.id)}>Save</button>
              <button style={{ ...styles.editBtn, background: '#6b7280' }} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
