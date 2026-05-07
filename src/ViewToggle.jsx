// Floating toggle that lets a user flip between the standard view and the workshop view.
// Lives outside both apps so neither needs to know about the other.

export default function ViewToggle({ current, onSwitch }) {
  const next = current === 'workshop' ? 'standard' : 'workshop'
  const label = current === 'workshop' ? 'Standard View' : 'Workshop View'
  const icon = current === 'workshop' ? 'dashboard' : 'co_present'
  return (
    <button
      className="view-toggle"
      onClick={() => onSwitch(next)}
      aria-label={`Switch to ${label}`}
      title={`Switch to ${label}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="view-toggle__label">{label}</span>
    </button>
  )
}
