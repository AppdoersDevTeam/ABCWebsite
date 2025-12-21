import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlowingButton } from '../../components/UI/GlowingButton';

export const Login = () => {
  const [email, setEmail] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
    navigate('/dashboard'); 
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-24 md:pt-32">
      <div className="max-w-md w-full space-y-8 glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-bold text-charcoal">Member Login</h2>
          <p className="mt-2 text-sm text-neutral">
            Access the directory, roster, and prayer wall.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
          </div>

          <div>
            <GlowingButton 
                type="submit" 
                fullWidth 
                disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </GlowingButton>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
             <GlowingButton type="button" variant="outline" fullWidth onClick={() => alert("Google Auth Placeholder")}>
                Google
             </GlowingButton>
          </div>
        </form>
      </div>
    </div>
  );
};