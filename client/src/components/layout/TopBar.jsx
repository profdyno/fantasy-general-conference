import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getGame } from '../../api/client'

const styles = {
  bar: {
    background: '#1e3a5f',
    color: '#fff',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    color: '#93c5fd',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  activeLink: {
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
  },
}

export default function TopBar() {
  const location = useLocation()
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    getGame().then(g => setLocked(!!g.submissions_locked)).catch(() => {})
  }, [location.pathname])

  const linkStyle = (path) => ({
    ...styles.link,
    ...(location.pathname.startsWith(path) ? styles.activeLink : {}),
  })

  return (
    <div style={styles.bar}>
      <div style={styles.title}>Fantasy General Conference</div>
      <nav style={styles.nav}>
        {sessionStorage.getItem('playerSlug') && (
          <Link to={`/play/${sessionStorage.getItem('playerSlug')}`} style={linkStyle('/play')}>Play</Link>
        )}
        <Link to="/scores" style={linkStyle('/scores')}>Scoreboard</Link>
        {locked && <Link to="/penalties" style={linkStyle('/penalties')}>Penalties</Link>}
        <Link to="/help" style={linkStyle('/help')}>Help</Link>
        <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>
      </nav>
    </div>
  )
}
