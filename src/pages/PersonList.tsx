import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Person } from '../types';
import { getPersons } from '../lib/storage';
import { PersonCard } from '../components/PersonCard';
import { Twinkles } from '../components/Twinkles';

export function PersonList() {
  const [persons, setPersons] = useState<Person[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedPersons = getPersons();
    if (loadedPersons.length === 0) {
      navigate('/', { replace: true });
    } else {
      setPersons(loadedPersons);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="magic-gradient px-6 pt-12 pb-20 relative overflow-hidden">
        <Twinkles count={15} />

        {/* Home button */}
        <Link
          to="/"
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          title="Home"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        <h1 className="font-display text-2xl font-bold text-white text-center relative z-10">
          Verlanglijstjes
        </h1>
        <p className="text-white/80 text-center mt-1 relative z-10">
          {persons.length} {persons.length === 1 ? 'persoon' : 'personen'}
        </p>
      </div>

      {/* Content */}
      <div className="px-4 -mt-12 pb-24 relative z-10">
        <div className="max-w-lg mx-auto space-y-3">
          {persons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <Link
        to="/create"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-lg
                   flex items-center justify-center text-white
                   hover:bg-primary-light transition-colors active:scale-95
                   safe-bottom z-20"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
