export function formatValue(val) {
  if (!val) return val
  try {
    const parsed = JSON.parse(val)
    if (Array.isArray(parsed)) return parsed.join('; ')
  } catch {}
  return val
}
