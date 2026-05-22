import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { useSiteData } from '../../context/SiteDataContext';
import Layout from '../../components/shared/Layout';

const styles = `
  .tickets-page {
    background: var(--dark);
    min-height: 100vh;
  }

  .tickets-hero {
    text-align: center;
    padding: 8rem 2rem 6rem;
    background: linear-gradient(180deg, var(--dark) 0%, var(--dark-surface) 100%);
  }

  .tickets-hero h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    color: var(--white);
    margin: 0 0 1.5rem;
    letter-spacing: -0.02em;
  }

  .tickets-hero p {
    font-size: 1.25rem;
    color: var(--gray-400);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .tickets-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem 8rem;
  }

  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 2.5rem;
    margin-bottom: 4rem;
  }

  .tier-card {
    background: var(--white);
    border-radius: 50px;
    padding: 3rem;
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 520px;
  }

  .tier-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .tier-card.selected {
    box-shadow: 0 0 0 3px var(--ted-red), 0 20px 60px rgba(235, 0, 40, 0.2);
  }

  .popular-badge {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: var(--ted-red);
    color: var(--white);
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .tier-header {
    margin-bottom: 2rem;
  }

  .tier-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--dark);
    margin: 0 0 0.5rem;
  }

  .tier-tagline {
    font-size: 0.9375rem;
    color: var(--gray-600);
    margin: 0;
    line-height: 1.5;
  }

  .tier-pricing {
    margin-bottom: 2.5rem;
  }

  .tier-price {
    font-size: 3rem;
    font-weight: 400;
    color: var(--dark);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .tier-price span {
    font-size: 1rem;
    color: var(--gray-600);
    font-weight: 500;
    margin-left: 0.5rem;
  }

  .tier-features {
    list-style: none;
    padding: 0;
    margin: 0 0 3rem;
    flex: 1;
  }

  .tier-features li {
    padding: 0.875rem 0;
    color: var(--gray-700);
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    border-bottom: 1px solid var(--gray-200);
  }

  .tier-features li:last-child {
    border-bottom: none;
  }

  .tier-features li::before {
    content: '✓';
    color: var(--ted-red);
    font-weight: 700;
    font-size: 1.125rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .tier-footer {
    margin-top: auto;
  }

  .tier-button {
    width: 100%;
    padding: 1.125rem 2rem;
    background: var(--ted-red);
    color: var(--white);
    border: none;
    border-radius: 50px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .tier-button:hover {
    background: var(--ted-red-dark);
    transform: scale(1.02);
  }

  .tier-button.selected {
    background: var(--gray-400);
    cursor: default;
  }

  .tier-button.selected:hover {
    transform: none;
  }

  .purchase-form {
    background: var(--dark-surface);
    border-radius: 50px;
    padding: 3.5rem;
    margin-top: 4rem;
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .purchase-form h3 {
    color: var(--white);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 2.5rem;
    letter-spacing: -0.02em;
  }

  .selected-tier {
    background: var(--dark);
    border-radius: 30px;
    padding: 2rem;
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .selected-tier-info h4 {
    color: var(--white);
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .selected-tier-info p {
    color: var(--gray-400);
    margin: 0;
    font-size: 0.9375rem;
  }

  .selected-tier-price {
    font-size: 2.5rem;
    font-weight: 400;
    color: var(--ted-red);
    letter-spacing: -0.02em;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .form-group {
    margin: 0;
  }

  .form-group label {
    display: block;
    color: var(--gray-300);
    margin-bottom: 0.75rem;
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .form-group input {
    width: 100%;
    padding: 1.125rem 1.5rem;
    background: var(--dark);
    border: 2px solid var(--gray-700);
    border-radius: 50px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-group input::placeholder {
    color: var(--gray-600);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 0 4px rgba(235, 0, 40, 0.1);
  }

  .error-message {
    background: rgba(235, 0, 40, 0.1);
    border: 2px solid rgba(235, 0, 40, 0.3);
    color: var(--ted-red-light);
    padding: 1.25rem;
    border-radius: 50px;
    margin-bottom: 2rem;
    font-size: 0.9375rem;
    font-weight: 500;
    animation: slideUp 0.3s ease-out;
  }

  .pay-button {
    width: 100%;
    padding: 1.25rem 2rem;
    background: var(--ted-red);
    color: var(--white);
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .pay-button:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(235, 0, 40, 0.4);
  }

  .pay-button:disabled {
    background: var(--gray-700);
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .tiers-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .tickets-hero {
      padding: 6rem 1.5rem 4rem;
    }

    .tickets-content {
      padding: 3rem 1.5rem 6rem;
    }

    .tier-card {
      padding: 2.5rem;
      min-height: auto;
    }

    .purchase-form {
      padding: 2.5rem;
    }

    .selected-tier {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
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

  // Validate that the key is set
  if (!publicKey || publicKey === 'pk_test_your_public_key_here') {
    console.error('Paystack public key not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in your .env file');
  }

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setError('');
    setTimeout(() => {
      const formElement = document.querySelector('.purchase-form');
      if (formElement) {
        const offset = formElement.offsetTop - 100;
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
    text: `Pay ₦${selectedTier?.price?.toLocaleString() || 0}`,
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

  return (
    <Layout>
      <style>{styles}</style>

      <div className="tickets-page">
        <section className="tickets-hero">
          <h1>Secure Your Spot</h1>
          <p>Join us for an unforgettable experience at {siteConfig.eventName}. Choose your ticket tier and be part of something extraordinary.</p>
        </section>

        <div className="tickets-content">
          <div className="tiers-grid">
            {ticketTiers.map((tier) => {
              const isSelected = selectedTier?.id === tier.id;
              
              return (
                <div
                  key={tier.id}
                  className={`tier-card ${isSelected ? 'selected' : ''}`}
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
                      <span>/ ticket</span>
                    </p>
                  </div>

                  <ul className="tier-features">
                    {tier.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
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
                      {isSelected ? 'Selected ✓' : `Select ${tier.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTier && (
            <div className="purchase-form">
              <h3>Complete Your Purchase</h3>
              
              <div className="selected-tier">
                <div className="selected-tier-info">
                  <h4>{selectedTier.name} Ticket</h4>
                  <p>{selectedTier.features[0]}</p>
                </div>
                <div className="selected-tier-price">₦{selectedTier.price.toLocaleString()}</div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
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

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
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

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
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

              <PaystackButton
                {...paystackProps}
                className="pay-button"
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
