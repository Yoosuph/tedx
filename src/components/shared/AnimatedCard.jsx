import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function AnimatedCard({
  children,
  direction = 'up', // up | left | right
  delay = 0,
  className = '',
  style = {},
}) {
  const { ref, isVisible } = useScrollAnimation();

  const dirClass = direction === 'left' ? 'from-left' : direction === 'right' ? 'from-right' : '';

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${dirClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
