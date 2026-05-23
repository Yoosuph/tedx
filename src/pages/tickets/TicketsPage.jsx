import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { useSiteData } from '../../context/SiteDataContext';
import Layout from '../../components/shared/Layout';

const styles = `
  .tickets-page {
    background: radial-gradient(circle at 50% 0%, rgba(235, 0, 40, 0.08) 0%, var(--black) 50%, var(--black) 100%);
    min-height: 100vh;
    color: var(--white);
    overflow: hidden;
  }

  .tickets-hero {
    text-align: center;
    padding: 8rem 2rem 4rem;
    position: relative;
  }

  .tickets-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(circle, rgba(235, 0, 40, 0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  .tickets-hero h1 {
    font-size: clamp(3rem, 7vw, 5rem);
    font-weight: 900;
    margin: 0 0 1rem;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--white) 30%, var(--gray-400) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 80px rgba(255, 255, 255, 0.1);
  }

  .tickets-hero p {
    font-size: 1.25rem;
    color: var(--gray-400);
    max-width: 650px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .booking-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    max-width: 500px;
    margin: 2rem auto 4rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 100px;
    backdrop-filter: blur(10px);
  }

  .progress-step {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-step.active {
    color: var(--ted-red);
  }

  .progress-step.completed {
    color: var(--white);
  }

  .progress-line {
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.08);
    position: relative;
    border-radius: 2px;
  }

  .progress-line::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0%;
    background: var(--ted-red);
    transition: width 0.4s ease;
  }

  .progress-line.fill::after {
    width: 100%;
  }

  .tickets-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 8rem;
    position: relative;
    z-index: 2;
  }

  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 2.5rem;
    margin-bottom: 4rem;
  }

  .tier-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 32px;
    padding: 3rem 2.5rem;
    position: relative;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 520px;
    backdrop-filter: blur(20px);
  }

  .tier-card:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  }

  .tier-card.selected {
    border-color: var(--ted-red);
    background: rgba(235, 0, 40, 0.03);
    box-shadow: 
      0 0 0 1px var(--ted-red),
      0 20px 40px rgba(235, 0, 40, 0.1);
  }

  .tier-card.vip.selected {
    border-color: var(--gold);
    background: rgba(255, 215, 0, 0.02);
    box-shadow: 
      0 0 0 1px var(--gold),
      0 20px 40px rgba(255, 215, 0, 0.05);
  }

  .tier-card.vvip.selected {
    border-color: #8B5CF6;
    background: rgba(139, 92, 246, 0.02);
    box-shadow: 
      0 0 0 1px #8B5CF6,
      0 20px 40px rgba(139, 92, 246, 0.05);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    right: 3rem;
    background: var(--ted-red);
    color: var(--white);
    padding: 0.5rem 1.25rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    box-shadow: 0 8px 16px rgba(235, 0, 40, 0.4);
  }

  .tier-header {
    margin-bottom: 2.5rem;
  }

  .tier-name {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--white);
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
  }

  .tier-tagline {
    font-size: 0.9375rem;
    color: var(--gray-400);
    margin: 0;
    line-height: 1.5;
  }

  .tier-pricing {
    margin-bottom: 2.5rem;
    display: flex;
    align-items: baseline;
  }

  .tier-price {
    font-size: 3.5rem;
    font-weight: 900;
    color: var(--white);
    margin: 0;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .tier-price span {
    font-size: 1rem;
    color: var(--gray-500);
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .tier-features {
    list-style: none;
    padding: 0;
    margin: 0 0 3rem;
    flex: 1;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tier-features li {
    padding: 1rem 0;
    color: var(--gray-300);
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tier-features li:last-child {
    border-bottom: none;
  }

  .feature-icon {
    color: var(--ted-red);
    flex-shrink: 0;
    margin-top: 0.125rem;
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 3;
    fill: none;
  }

  .tier-card.vip .feature-icon {
    color: var(--gold);
  }

  .tier-card.vvip .feature-icon {
    color: #8B5CF6;
  }

  .tier-footer {
    margin-top: auto;
  }

  .tier-button {
    width: 100%;
    padding: 1.125rem 2rem;
    background: transparent;
    color: var(--white);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .tier-card:hover .tier-button {
    border-color: var(--white);
  }

  .tier-card.selected .tier-button {
    background: var(--ted-red);
    border-color: var(--ted-red);
  }

  .tier-card.vip.selected .tier-button {
    background: var(--gold);
    color: var(--black);
    border-color: var(--gold);
  }

  .tier-card.vvip.selected .tier-button {
    background: #8B5CF6;
    border-color: #8B5CF6;
  }

  /* Form Section */
  .purchase-form {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 40px;
    padding: 4rem;
    margin-top: 4rem;
    backdrop-filter: blur(30px);
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .purchase-form h3 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 2.5rem;
    letter-spacing: -0.02em;
    text-align: center;
  }

  .selected-tier-banner {
    background: linear-gradient(135deg, rgba(235, 0, 40, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%);
    border: 1px solid rgba(235, 0, 40, 0.2);
    border-radius: 24px;
    padding: 2rem 2.5rem;
    margin-bottom: 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .selected-tier-banner.vip {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
    border-color: rgba(255, 215, 0, 0.2);
  }

  .selected-tier-banner.vvip {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .selected-tier-info h4 {
    color: var(--white);
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .selected-tier-info p {
    color: var(--gray-400);
    margin: 0;
    font-size: 0.9375rem;
  }

  .selected-tier-price {
    font-size: 2.75rem;
    font-weight: 900;
    color: var(--ted-red);
    letter-spacing: -0.02em;
  }

  .selected-tier-banner.vip .selected-tier-price { color: var(--gold); }
  .selected-tier-banner.vvip .selected-tier-price { color: #A78BFA; }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .form-group {
    margin: 0;
  }

  .form-group.full-width {
    grid-column: span 2;
  }

  .form-group label {
    display: block;
    color: var(--gray-400);
    margin-bottom: 0.75rem;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-group input {
    width: 100%;
    padding: 1.25rem 1.75rem;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .form-group input::placeholder {
    color: var(--gray-600);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--ted-red);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 20px rgba(235, 0, 40, 0.15);
  }

  .form-group.vip input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
  }

  .form-group.vvip input:focus {
    border-color: #8B5CF6;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
  }

  .error-message {
    background: rgba(235, 0, 40, 0.08);
    border: 1px solid rgba(235, 0, 40, 0.25);
    color: var(--ted-red-light);
    padding: 1.25rem 2rem;
    border-radius: 100px;
    margin-bottom: 2.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    text-align: center;
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  .pay-button {
    width: 100%;
    padding: 1.375rem 2.5rem;
    background: var(--ted-red);
    color: var(--white);
    border: none;
    border-radius: 100px;
    font-size: 1.125rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    box-shadow: 0 10px 30px rgba(235, 0, 40, 0.3);
  }

  .pay-button:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(235, 0, 40, 0.5);
  }

  .pay-button.vip {
    background: var(--gold);
    color: var(--black);
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
  }
  .pay-button.vip:hover:not(:disabled) {
    background: var(--gold-dark);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
  }

  .pay-button.vvip {
    background: #8B5CF6;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.25);
  }
  .pay-button.vvip:hover:not(:disabled) {
    background: #7C3AED;
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.45);
  }

  .pay-button:disabled {
    background: var(--gray-800);
    color: var(--gray-600);
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 992px) {
    .form-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .form-group.full-width {
      grid-column: span 1;
    }
  }

  @media (max-width: 768px) {
    .tickets-hero {
      padding: 6rem 1.5rem 3rem;
    }

    .booking-progress {
      margin-bottom: 3rem;
    }

    .tickets-content {
      padding: 0 1.5rem 6rem;
    }

    .tiers-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .tier-card {
      padding: 2.5rem 2rem;
      min-height: auto;
    }

    .purchase-form {
      padding: 2.5rem 1.5rem;
      border-radius: 30px;
    }

    .selected-tier-banner {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
      padding: 2rem 1.5rem;
    }
  }
`;

export default function TicketsPage() {
  const { ticketTiers, siteConfig } = useSiteData();
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Paystack public key from environment variables
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!publicKey || publicKey === 'pk_test_your_public_key_here') {
    console.error('Paystack public key not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in your .env file');
  }

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setError('');
    setTimeout(() => {
      const formElement = document.querySelector('.purchase-form');
      if (formElement) {
        const offset = formElement.offsetTop - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSuccess = (reference) => {
    navigate(`/tickets/verify?reference=${reference.reference}`, { 
      state: { ticketData: { ...formData, tier: selectedTier } } 
    });
  };

  const onClose = () => {
    setError('Payment cancelled');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return false;
    }
    return true;
  };

  const handleValidation = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('All fields are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const paystackProps = {
    email: formData.email,
    amount: selectedTier?.price * 100 || 0,
    publicKey,
    text: `Secure Pass • ₦${selectedTier?.price?.toLocaleString() || 0}`,
    onSuccess,
    onClose,
    metadata: {
      custom_fields: [
        { display_name: "Full Name", variable_name: "full_name", value: formData.name },
        { display_name: "Phone", variable_name: "phone", value: formData.phone },
        { display_name: "Ticket Tier", variable_name: "ticket_tier", value: selectedTier?.name },
      ]
    }
  };

  const activeThemeClass = selectedTier?.id?.toLowerCase() || '';

  return (
    <Layout>
      <style>{styles}</style>

      <div className="tickets-page">
        <section className="tickets-hero">
          <h1>Secure Your Spot</h1>
          <p>Join us for an unforgettable experience at {siteConfig.eventName}. Choose your ticket tier and be part of something extraordinary.</p>
        </section>

        <div className="tickets-content">
          {/* Progress Indicator */}
          <div className="booking-progress">
            <div className={`progress-step ${!selectedTier ? 'active' : 'completed'}`}>
              {!selectedTier ? '1. Select Pass' : '✓ Pass Selected'}
            </div>
            <div className={`progress-line ${selectedTier ? 'fill' : ''}`}></div>
            <div className={`progress-step ${selectedTier ? 'active' : ''}`}>
              2. Attendee Details
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="tiers-grid">
            {ticketTiers.map((tier) => {
              const isSelected = selectedTier?.id === tier.id;
              const tierClass = tier.id?.toLowerCase() || '';
              
              return (
                <div
                  key={tier.id}
                  className={`tier-card ${tierClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTierSelect(tier)}
                >
                  {tier.popular && <div className="popular-badge">Most Popular</div>}
                  
                  <div className="tier-header">
                    <h3 className="tier-name">{tier.name}</h3>
                    <p className="tier-tagline">{tier.tagline || `Experience TEDx as a ${tier.name} attendee`}</p>
                  </div>

                  <div className="tier-pricing">
                    <p className="tier-price">
                      ₦{tier.price.toLocaleString()}
                    </p>
                    <span>/ pass</span>
                  </div>

                  <ul className="tier-features">
                    {tier.features.map((feature, idx) => (
                      <li key={idx}>
                        <svg className="feature-icon" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="tier-footer">
                    <button
                      className={`tier-button ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          handleTierSelect(tier);
                        }
                      }}
                    >
                      {isSelected ? 'Pass Selected ✓' : `Select ${tier.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Purchase Checkout Form */}
          {selectedTier && (
            <div className="purchase-form">
              <h3>Attendee Information</h3>
              
              <div className={`selected-tier-banner ${activeThemeClass}`}>
                <div className="selected-tier-info">
                  <h4>{selectedTier.name} Access Pass</h4>
                  <p>{selectedTier.features[0]}</p>
                </div>
                <div className="selected-tier-price">₦{selectedTier.price.toLocaleString()}</div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-grid">
                <div className={`form-group ${activeThemeClass}`}>
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className={`form-group ${activeThemeClass}`}>
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={`form-group ${activeThemeClass} full-width`}>
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 800 000 0000"
                      required
                    />
                  </div>
                </div>
              </div>

              <PaystackButton
                {...paystackProps}
                className={`pay-button ${activeThemeClass}`}
                disabled={!validateForm()}
                onClick={(e) => {
                  if (!handleValidation()) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
