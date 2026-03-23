import { useState, useRef, useEffect } from 'react'

const styles = {
  wrapper: { position: 'relative' },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '15px',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
    background: '#fff', border: '1px solid #d1d5db', borderTop: 'none',
    borderRadius: '0 0 6px 6px', maxHeight: '200px', overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  option: {
    padding: '8px 12px', fontSize: '14px', cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  optionHover: { background: '#eff6ff' },
  loading: { padding: '8px 12px', fontSize: '13px', color: '#888' },
}

export default function CityAutocomplete({ value, onChange, disabled, country }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  const timerRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(text) {
    setQuery(text)
    // Clear the actual value — only set it when a suggestion is selected
    onChange('')

    if (timerRef.current) clearTimeout(timerRef.current)
    if (text.length < 3) { setSuggestions([]); setOpen(false); return }

    timerRef.current = setTimeout(() => fetchSuggestions(text), 400)
  }

  async function fetchSuggestions(q) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q, format: 'json', addressdetails: '1', limit: '8',
        featuretype: 'city',
      })
      if (country === 'us') params.set('countrycodes', 'us')
      if (country === 'world') params.set('exclude_place_ids', '')

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'Accept-Language': 'en' },
      })
      const data = await res.json()

      const results = data.map(place => {
        const addr = place.address || {}
        const city = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || ''
        if (!city) return null

        if (country === 'us') {
          const state = addr.state || ''
          return state ? `${city}, ${state}` : city
        } else {
          const countryName = addr.country || ''
          return countryName ? `${city}, ${countryName}` : city
        }
      }).filter(Boolean)

      // Deduplicate
      const unique = [...new Set(results)]
      setSuggestions(unique)
      setOpen(unique.length > 0)
      setHoveredIdx(-1)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(item) {
    setQuery(item)
    onChange(item)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHoveredIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHoveredIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && hoveredIdx >= 0) {
      e.preventDefault()
      handleSelect(suggestions[hoveredIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const isSelected = value && value === query

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <input
        style={{ ...styles.input, ...(isSelected ? { borderColor: '#16a34a', background: '#f0fdf4' } : query && !isSelected ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}) }}
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a city name and select from results..."
      />
      {query && !isSelected && <div style={{ fontSize: '11px', color: '#d97706', marginTop: '3px' }}>Please select a location from the search results</div>}
      {open && (
        <div style={styles.dropdown}>
          {loading && <div style={styles.loading}>Searching...</div>}
          {suggestions.map((item, i) => (
            <div
              key={i}
              style={{ ...styles.option, ...(i === hoveredIdx ? styles.optionHover : {}) }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseDown={() => handleSelect(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
