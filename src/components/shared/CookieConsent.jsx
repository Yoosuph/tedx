import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('tedx_cookie_consent');
    if (!consent) {
      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('tedx_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('tedx_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cookie-consent-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          z-index: 99999;
          width: 90%;
          max-width: 580px;
          background: rgba(18, 18, 18, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(235, 0, 40, 0.1);
          animation: slideUpCookie 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: 'Inter', sans-serif;
        }

        .cookie-consent-content {
          flex: 1;
        }

        .cookie-consent-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cookie-consent-title i {
          color: #EB0028;
          font-size: 1.1rem;
        }

        .cookie-consent-desc {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #b3b3b3;
          margin: 0;
        }

        .cookie-consent-desc a {
          color: #EB0028;
          text-decoration: none;
          font-weight: 600;
          transition: border-bottom 0.2s;
        }

        .cookie-consent-desc a:hover {
          border-bottom: 1px solid #EB0028;
        }

        .cookie-consent-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cookie-btn-decline {
          padding: 0.625rem 1.25rem;
          background: transparent;
          color: #a3a3a3;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .cookie-btn-decline:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .cookie-btn-accept {
          padding: 0.625rem 1.5rem;
          background: #EB0028;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(235, 0, 40, 0.2);
        }

        .cookie-btn-accept:hover {
          background: #c5001f;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(235, 0, 40, 0.3);
        }

        @keyframes slideUpCookie {
          from {
            transform: translateX(-50%) translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .cookie-consent-bar {
            flex-direction: column;
            align-items: stretch;
            bottom: 16px;
            padding: 1.25rem;
            gap: 1.25rem;
          }

          .cookie-consent-actions {
            justify-content: flex-end;
          }
          
          .cookie-btn-decline, .cookie-btn-accept {
            flex: 1;
            text-align: center;
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      <div className="cookie-consent-bar" role="alert" aria-live="polite">
        <div className="cookie-consent-content">
          <p className="cookie-consent-title">
            <i className="fa-solid fa-cookie-bite"></i> Cookie Preferences
          </p>
          <p className="cookie-consent-desc">
            We use cookies to optimize your ticket booking experience and secure the admin features. By accepting, you consent to our use of these tools.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button onClick={handleDecline} className="cookie-btn-decline">
            Decline
          </button>
          <button onClick={handleAccept} className="cookie-btn-accept">
            Accept Cookies
          </button>
        </div>
      </div>
    </>
  );
}
