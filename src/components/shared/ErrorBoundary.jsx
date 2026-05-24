import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #0a0a0a;
              color: #fff;
              font-family: 'Inter', sans-serif;
              text-align: center;
              padding: 2rem;
            }
            .error-boundary__code {
              font-size: 5rem;
              font-weight: 800;
              color: #EB0028;
              margin-bottom: 1rem;
            }
            .error-boundary__msg {
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
              color: #ccc;
            }
            .error-boundary__detail {
              font-size: 0.85rem;
              color: #666;
              margin-bottom: 2rem;
              max-width: 500px;
              font-family: monospace;
            }
            .error-boundary__btn {
              padding: 0.75rem 2rem;
              background: #EB0028;
              color: #fff;
              border-radius: 9999px;
              text-decoration: none;
              font-weight: 600;
              transition: background 0.2s;
            }
            .error-boundary__btn:hover {
              background: #c5001f;
            }
          `}</style>
          <div className="error-boundary">
            <div className="error-boundary__code">!</div>
            <p className="error-boundary__msg">Something went wrong</p>
            {this.state.error && (
              <p className="error-boundary__detail">{this.state.error.message}</p>
            )}
            <Link to="/" className="error-boundary__btn" onClick={() => this.setState({ hasError: false, error: null })}>
              Go Home
            </Link>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}