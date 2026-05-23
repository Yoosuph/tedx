import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function Section({
  id,
  title,
  subtitle,
  dark = false,
  gray = false,
  hideHeader = false,
  children,
  className = '',
  headerAlign = 'center',
}) {
  const { ref, isVisible } = useScrollAnimation();

  const sectionClass = [
    'section',
    dark && 'section--dark',
    gray && 'section--gray',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={sectionClass}>
      <div className="container">
        {!hideHeader && (title || subtitle) && (
          <div
            ref={ref}
            className={`section-header animate-on-scroll ${isVisible ? 'visible' : ''}`}
            style={{ textAlign: headerAlign }}
          >
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
