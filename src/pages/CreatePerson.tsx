import { useNavigate, Link } from 'react-router-dom';
import { ProfileForm } from '../components/ProfileForm';
import { savePerson, getPersons } from '../lib/storage';
import { Twinkles } from '../components/Twinkles';

export function CreatePerson() {
  const navigate = useNavigate();
  const hasPersons = getPersons().length > 0;

  const handleSubmit = (data: {
    name: string;
    ageGroup: 'child' | 'teen' | 'adult';
    gender: 'male' | 'female' | 'other';
    interests: string[];
    photoUrl?: string;
    budget?: number;
    pin?: string;
  }) => {
    const person = savePerson(data);
    navigate(`/list/${person.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="magic-gradient px-6 pt-12 pb-20 relative overflow-hidden">
        <Twinkles count={15} />

        {/* Back to lists button */}
        {hasPersons && (
          <Link
            to="/persons"
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            title="Verlanglijstjes"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </Link>
        )}

        <h1 className="font-display text-2xl font-bold text-white text-center relative z-10">
          Nieuw verlanglijstje
        </h1>
        <p className="text-white/80 text-center mt-1 relative z-10">
          Voor wie maak je een lijstje?
        </p>
      </div>

      {/* Form */}
      <div className="px-4 -mt-12 pb-8 relative z-10">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
          <ProfileForm onSubmit={handleSubmit} submitLabel="Lijst aanmaken" />
        </div>
      </div>
    </div>
  );
}
