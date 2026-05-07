// Small inline help affordance — an ⓘ icon that reveals a popover on hover/focus.
// Used liberally throughout the workshop view so first-time clients can self-orient
// without a consultant having to explain every label.

export default function HelpTip({ text, title, placement = 'bottom', size = 14 }) {
  return (
    <span
      className={`ws-tip ws-tip--${placement}`}
      tabIndex={0}
      aria-label={title ? `${title}: ${text}` : text}
    >
      <span
        className="material-symbols-outlined ws-tip__icon"
        style={{ fontSize: size }}
      >
        info
      </span>
      <span className="ws-tip__pop" role="tooltip">
        {title && <span className="ws-tip__title">{title}</span>}
        <span className="ws-tip__body">{text}</span>
      </span>
    </span>
  )
}
