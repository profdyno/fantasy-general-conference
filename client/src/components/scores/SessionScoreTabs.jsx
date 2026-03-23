const styles = {
  tabs: {
    display: 'flex', gap: '4px', marginBottom: '20px', overflowX: 'auto',
    padding: '4px', background: '#e5e7eb', borderRadius: '8px',
  },
  tab: {
    padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'transparent',
    fontSize: '13px', fontWeight: 500, color: '#555', whiteSpace: 'nowrap',
  },
  activeTab: {
    background: '#fff', color: '#1e3a5f', fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
}

export default function SessionScoreTabs({ sessions, activeSession, onSelect }) {
  return (
    <div style={styles.tabs}>
      <button
        style={{ ...styles.tab, ...(activeSession === null ? styles.activeTab : {}) }}
        onClick={() => onSelect(null)}
      >
        Overall
      </button>
      {sessions.map(s => (
        <button
          key={s.id}
          style={{ ...styles.tab, ...(activeSession === s.id ? styles.activeTab : {}) }}
          onClick={() => onSelect(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  )
}
