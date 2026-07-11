import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Building2, Lock, Mail, User as UserIcon } from 'lucide-react';
import api from '../services/api';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Guest'); // 'Guest' or 'Vendor'
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    dispatch(setLoading(true));

    try {
      let response;
      if (mode === 'login') {
        response = await api.post('/auth/login', { email, password });
      } else {
        response = await api.post('/auth/register', { name, email, password, role });
      }

      const userData = response.data.user || response.data.data;
      dispatch(setUser(userData));
      navigate('/');
    } catch (err) {
      setLocalError(err);
      dispatch(setError(err.response?.data?.message || '[AUTH_ERROR] Connection failure.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1EDEA] flex items-center justify-center py-12 px-4 select-none">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-[#212121] no-underline">
            <div className="bg-[#212121] text-[#F1EDEA] p-1.5 border border-[#212121] shadow-[2px_2px_0px_#C84B31]">
              <Building2 size={24} />
            </div>
            <span className="font-mono font-bold text-2xl tracking-wider">
              STAYWISE.AI
            </span>
          </Link>
          <div className="font-mono text-xs uppercase text-[#C84B31] font-bold">
            Your home away from home
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex border-b-2 border-[#212121] mb-6 font-mono text-xs uppercase font-bold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer border-b-2 -mb-0.5 ${
                mode === 'login'
                  ? 'border-[#C84B31] text-[#C84B31]'
                  : 'border-transparent text-[#212121]/50 hover:text-[#212121]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer border-b-2 -mb-0.5 ${
                mode === 'register'
                  ? 'border-[#C84B31] text-[#C84B31]'
                  : 'border-transparent text-[#212121]/50 hover:text-[#212121]'
              }`}
            >
              Create Account
            </button>
          </div>

          {localError && (
            <ErrorBanner error={localError} className="mb-4" onClose={() => setLocalError(null)} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121] flex items-center gap-1">
                    <UserIcon size={14} className="text-[#C84B31]" />
                    <span>FULL NAME</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tadao Ando"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F1EDEA] border-2 border-[#212121] p-2.5 text-sm outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121] block mb-1">
                    Account Type
                  </label>
                  <div className="flex gap-6 border-2 border-[#212121] p-2.5 bg-[#F1EDEA]">
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                      <input
                        type="radio"
                        name="role"
                        value="Guest"
                        checked={role === 'Guest'}
                        onChange={() => setRole('Guest')}
                        className="accent-[#C84B31] cursor-pointer"
                      />
                      <span>Guest</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                      <input
                        type="radio"
                        name="role"
                        value="Vendor"
                        checked={role === 'Vendor'}
                        onChange={() => setRole('Vendor')}
                        className="accent-[#C84B31] cursor-pointer"
                      />
                      <span>Property Host</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121] flex items-center gap-1">
                <Mail size={14} className="text-[#C84B31]" />
                <span>Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="architect@staywise.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F1EDEA] border-2 border-[#212121] p-2.5 text-sm outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121] flex items-center gap-1">
                <Lock size={14} className="text-[#C84B31]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F1EDEA] border-2 border-[#212121] p-2.5 text-sm outline-none font-sans"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-6" disabled={submitting}>
              <span>
                {submitting
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#212121]/15 text-center">
            <Badge variant="default" className="text-[10px]">
              Secured with encrypted session cookies
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
