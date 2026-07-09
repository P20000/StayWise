import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { setUser } from '../store/slices/authSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Building2, Lock, Mail, User } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate stateless JWT authentication success
    dispatch(
      setUser({
        id: 'user_staywise_99',
        email: email || 'architect@staywise.ai',
        name: name || 'Architectural Guest',
        role: 'Guest',
      })
    );
    navigate('/');
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
            [ STATELSS JWT AUTHENTICATION GATEWAY ]
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
              [ SIGN IN ]
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer border-b-2 -mb-0.5 ${
                mode === 'register'
                  ? 'border-[#C84B31] text-[#C84B31]'
                  : 'border-transparent text-[#212121]/50 hover:text-[#212121]'
              }`}
            >
              [ RESERVE MEMBERSHIP ]
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121] flex items-center gap-1">
                  <User size={14} className="text-[#C84B31]" />
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
            )}

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121] flex items-center gap-1">
                <Mail size={14} className="text-[#C84B31]" />
                <span>EMAIL ADDRESS</span>
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
                <span>CREDENTIAL SECRET</span>
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

            <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
              <span>{mode === 'login' ? 'AUTHENTICATE & ENTER' : 'INITIALIZE CREDENTIALS'}</span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#212121]/15 text-center">
            <Badge variant="default" className="text-[10px]">
              Rule #5: HttpOnly Signed Cookie Pipeline
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
