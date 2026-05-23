import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function AdminPageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Start exit animation
      setTransitionStage('exit');

      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 200); // match exit duration
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location]);

  return (
    <>
      <style>{`
        .admin-page-transition {
          animation: adminFadeSlideIn 0.3s ease-out both;
        }

        .admin-page-transition.exit {
          animation: adminFadeSlideOut 0.2s ease-in both;
        }

        @keyframes adminFadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes adminFadeSlideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-8px);
          }
        }
      `}</style>
      <div
        key={displayLocation.pathname}
        className={`admin-page-transition ${transitionStage === 'exit' ? 'exit' : ''}`}
      >
        {children}
      </div>
    </>
  );
}
