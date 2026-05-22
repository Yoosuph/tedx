import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';

const styles = `
  .login-page {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--dark);
  }

  .login-container {
    max-width: 480px;
    width: 100%;
  }

  .login-card {
    background: var(--dark-surface);
    border-radius: 50px;
    padding: 3.5rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
    animation: fadeUp 0.5s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .login-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .login-icon {
    width: 64px;
    height: 64px;
    background: var(--ted-red);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  .login-icon svg {
    width: 32px;
    height: 32px;
    stroke: white;
    stroke-width: 2;
    fill: none;
  }

  .login-header h1 {
    color: var(--white);
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .login-header p {
    color: var(--gray-400);
    margin: 0;
    font-size: 0.9375rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    color: var(--gray-300);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .form-input {
    width: 100%;
    padding: 1rem 1.25rem;
    background: var(--dark);
    border: 2px solid var(--gray-700);
    border-radius: 50px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-input::placeholder {
    color: var(--gray-600);
  }

  .form-input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 0 4px rgba(235, 0, 40, 0.1);
  }

  .login-button {
    width: 100%;
    padding: 1.125rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .login-button:hover:not(:disabled) {
    background: #C41E3A;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(235, 0, 40, 0.4);
  }

  .login-button:disabled {
    background: var(--gray-700);
    cursor: not-allowed;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
    padding: 1rem 1.25rem;
    border-radius: 50px;
    margin-bottom: 1.5rem;
    font-size: 0.9375rem;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .login-footer {
    text-align: center;
    margin-top: 2rem;
  }

  .login-footer a {
    color: var(--gray-400);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.3s ease;
  }

  .login-footer a:hover {
    color: var(--ted-red);
  }

  .demo-credentials {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #93C5FD;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    margin-top: 2rem;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .demo-credentials strong {
    color: #BFDBFE;
    display: block;
    margin-bottom: 0.5rem;
  }
`;

// Default admin credentials (in production, this would be a real backend)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'tedxdutse2026'
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (
        formData.username === ADMIN_CREDENTIALS.username &&
        formData.password === ADMIN_CREDENTIALS.password
      ) {
        // Store auth token (in production, this would be a JWT)
        localStorage.setItem('admin_auth', JSON.stringify({
          authenticated: true,
          username: formData.username,
          timestamp: Date.now()
        }));
        login(); // Update auth context
        navigate('/admin/tickets');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1>Admin Login</h1>
              <p>Access the TEDxDutse management dashboard</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="demo-credentials">
              <strong>Demo Credentials:</strong>
              Username: <code>admin</code><br />
              Password: <code>tedxdutse2026</code>
            </div>
          </div>

          <div className="login-footer">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
