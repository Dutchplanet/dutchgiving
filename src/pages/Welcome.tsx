import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Twinkles } from '../components/Twinkles';
import { getPersons } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export function Welcome() {
  const [hasPersons, setHasPersons] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    async function checkPersons() {
      try {
        const persons = await getPersons();
        setHasPersons(persons.length > 0);
      } catch (error) {
        console.error('Error loading persons:', error);
      } finally {
        setLoading(false);
      }
    }
    checkPersons();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Twinkles count={30} />

      {/* User menu */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <span className="text-sm text-gray-600">{user?.displayName || user?.username}</span>
          <button
            onClick={logout}
            className="text-sm text-primary hover:text-primary-light font-medium"
          >
            Uitloggen
          </button>
        </div>
      </div>

      {/* Logo/Visual */}
      <div className="relative mb-8 animate-float z-10">
        <div className="w-32 h-32 rounded-full magic-gradient flex items-center justify-center shadow-2xl">
          <svg
            className="w-16 h-16 text-gold"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
        </div>
        {/* Decorative stars */}
        <div className="absolute -top-2 -right-2 text-gold animate-twinkle">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -left-3 text-gold animate-twinkle-delay">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-4xl font-bold text-primary mb-2 text-center text-shadow relative z-10">
        DutchGiving
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-xs relative z-10">
        Maak magische verlanglijstjes en deel ze met vrienden en familie
      </p>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-xs w-full relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Maak lijstjes</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Samenwerken</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">Deel eenvoudig</span>
        </div>
      </div>

      {/* CTA Button - changes based on whether user has lists */}
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent z-10" />
      ) : hasPersons ? (
        <Link to="/persons" className="btn-primary text-lg px-8 relative z-10">
          Bekijk verlanglijstjes
        </Link>
      ) : (
        <Link to="/create" className="btn-primary text-lg px-8 relative z-10">
          Maak je eerste verlanglijst
        </Link>
      )}

      {/* Decorative bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}
