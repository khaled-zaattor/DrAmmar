import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>✂</div>
          <h1 style={s.brandName}>BarberShop</h1>
          <p style={s.brandSub}>Admin Dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>
            <span style={{ marginRight: 8 }}>⚠</span>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={s.group}>
            <label style={s.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div style={s.group}>
            <label style={s.label} htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={s.eyeBtn}
                tabIndex={-1}
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: 4 }}
          >
            {loading ? (
              <>
                <span style={s.btnSpinner} />
                Signing in…
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p style={s.hint}>
          Laravel Sanctum authentication
        </p>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e2a38 0%, #2d3f53 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  brand: {
    textAlign: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #4299e1, #3182ce)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    color: '#fff',
    margin: '0 auto 14px',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1e2a38',
    letterSpacing: '-0.5px',
  },
  brandSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  errorBox: {
    background: '#fff5f5',
    color: '#c53030',
    border: '1px solid #feb2b2',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 13,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
  },
  group: { marginBottom: 20 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: 6,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },
  btnSpinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
    marginRight: 8,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 24,
  },
};

export default Login;
