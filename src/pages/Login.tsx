import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Twinkles } from '../components/Twinkles';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const result = await registerUser(username, password, displayName);
        if (result.success) {
          setUser({ username: username.toLowerCase().trim(), displayName: displayName.trim() });
          navigate('/');
        } else {
          setError(result.error || 'Registratie mislukt');
        }
      } else {
        const result = await loginUser(username, password);
        if (result.success) {
          const user = { username: username.toLowerCase().trim(), displayName: '' };
          setUser(user);
          navigate('/');
        } else {
          setError(result.error || 'Inloggen mislukt');
        }
      }
    } catch (err) {
      setError('Er ging iets mis. Probeer het opnieuw.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Twinkles count={20} />

      {/* Logo */}
      <div className="relative mb-6 z-10">
        <div className="w-24 h-24 rounded-2xl magic-gradient flex items-center justify-center shadow-2xl">
          <svg
            className="w-12 h-12 text-gold"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-bold text-primary mb-2 text-center z-10">
        DutchGiving
      </h1>
      <p className="text-gray-600 text-center mb-8 z-10">
        {isRegister ? 'Maak een account aan' : 'Log in om verder te gaan'}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 z-10">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Gebruikersnaam
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="bijv. jan123"
              className="input-field"
              required
              autoComplete="username"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Weergavenaam
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="bijv. Jan de Vries"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Dit zien andere gebruikers</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full btn-primary mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Even geduld...
            </span>
          ) : isRegister ? (
            'Account aanmaken'
          ) : (
            'Inloggen'
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-primary hover:text-primary-light"
          >
            {isRegister ? 'Al een account? Log in' : 'Nog geen account? Registreer'}
          </button>
        </div>
      </form>
    </div>
  );
}
