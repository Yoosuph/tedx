/**
 * Alert — in-page alert region used by admin flows in place of `window.alert`.
 *
 * Props:
 *   - variant: 'error' | 'warning' | 'info' | 'success'   (default: 'info')
 *   - onDismiss: optional () => void; when provided, renders a dismiss button
 *   - message: optional string shown when no children are passed
 *   - children: alternative to `message`; rendered inside the alert body
 *   - className: optional extra class to append to the root
 *
 * Accessibility:
 *   - Root has role="alert"
 *   - aria-live="assertive" for `error`, "polite" for warning/info/success
 */
export default function Alert({
  variant = 'info',
  onDismiss,
  message,
  children,
  className = '',
  ...props
}) {
  const safeVariant = ['error', 'warning', 'info', 'success'].includes(variant)
    ? variant
    : 'info';

  const ariaLive = safeVariant === 'error' ? 'assertive' : 'polite';

  const classes = ['alert', `alert--${safeVariant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      className={classes}
      {...props}
    >
      <div className="alert__body">
        {children ?? message}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
