export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md', // sm | md | lg
  href,
  icon,
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'cta-btn',
    `cta-btn--${variant}`,
    size !== 'md' && `cta-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {icon && <i className={icon} />}
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {icon && <i className={icon} />}
      {children}
    </button>
  );
}
