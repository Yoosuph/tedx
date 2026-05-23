import { Link } from 'react-router-dom';

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
    // Use React Router Link for internal routes (starts with /)
    const isInternal = href.startsWith('/') && !href.startsWith('//');
    if (isInternal) {
      return (
        <Link to={href} className={classes} onClick={onClick} {...props}>
          {icon && <i className={icon} />}
          {children}
        </Link>
      );
    }
    // External links or hash anchors stay as <a>
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
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
