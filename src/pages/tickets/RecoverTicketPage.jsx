import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { supabase } from '../../lib/supabase';


const styles = `
  .recover-container {
    padding: 6rem 2rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .recover-card {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    padding: 3rem 2rem;
  }

  .recover-card h1 {
    color: var(--white, #ffffff);
    font-size: 2rem;
    margin: 0 0 1rem;
    text-align: center;
  }

  .recover-card p {
    color: var(--gray-400, #9CA3AF);
    text-align: center;
    margin: 0 0 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    color: var(--gray-300, #D1D5DB);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md, 8px);
    color: var(--white, #ffffff);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--ted-red, #EB0028);
    background: rgba(255, 255, 255, 0.06);
  }

  .btn-primary {
    width: 100%;
    padding: 1rem 2rem;
    background: var(--ted-red, #EB0028);
    color: white;
    border: none;
    border-radius: var(--radius-lg, 12px);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    background: #C41E3A;
    transform: translateY(-2px);
  }

  .btn-primary:disabled {
    background: var(--gray-700, #374151);
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
    padding: 1rem;
    border-radius: var(--radius-md, 8px);
    margin-bottom: 1rem;
    text-align: center;
  }

  .success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #86EFAC;
    padding: 1rem;
    border-radius: var(--radius-md, 8px);
    margin-bottom: 1rem;
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-400, #9CA3AF);
    text-decoration: none;
    margin-bottom: 2rem;
    transition: color 0.3s ease;
  }

  .back-link:hover {
    color: var(--ted-red, #EB0028);
  }
`;

export default function RecoverTicketPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');

    try {
      // Query Supabase for tickets matching this email address
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('email', email.trim().toLowerCase());

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setStatus('success');
        setMessage(`Found ${data.length} ticket(s). Redirecting...`);

        setTimeout(() => {
          navigate(`/ticket/${data[data.length - 1].reference}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage('No tickets found for this email address');
      }
    } catch (error) {
      console.error('Error recovering tickets:', error);
      setStatus('error');
      setMessage('An error occurred while fetching your ticket. Please try again.');
    }
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="recover-container">
        <Link to="/tickets" className="back-link">
          ← Back to Tickets
        </Link>

        <div className="recover-card">
          <h1>Recover Your Ticket</h1>
          <p>Enter your email address to find your ticket</p>

          {status === 'error' && (
            <div className="error-message">{message}</div>
          )}

          {status === 'success' && (
            <div className="success-message">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Searching...' : 'Find My Ticket'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
