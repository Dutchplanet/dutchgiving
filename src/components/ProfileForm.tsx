import { useState, useRef } from 'react';
import { AgeGroup, Gender, INTERESTS, AGE_GROUPS, GENDERS } from '../types';
import { ImageCropper } from './ImageCropper';

interface ProfileFormProps {
  initialName?: string;
  initialAgeGroup?: AgeGroup;
  initialGender?: Gender;
  initialInterests?: string[];
  initialPhotoUrl?: string;
  initialBudget?: number;
  initialPin?: string;
  onSubmit: (data: {
    name: string;
    ageGroup: AgeGroup;
    gender: Gender;
    interests: string[];
    photoUrl?: string;
    budget?: number;
    pin?: string;
  }) => void;
  submitLabel?: string;
}

export function ProfileForm({
  initialName = '',
  initialAgeGroup,
  initialGender,
  initialInterests = [],
  initialPhotoUrl = '',
  initialBudget,
  initialPin = '',
  onSubmit,
  submitLabel = 'Opslaan',
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | undefined>(initialAgeGroup);
  const [gender, setGender] = useState<Gender | undefined>(initialGender);
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [budget, setBudget] = useState(initialBudget?.toString() || '');
  const [pin, setPin] = useState(initialPin);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setTempImage(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setPhotoUrl(croppedImage);
    setShowCropper(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ageGroup || !gender) return;
    onSubmit({
      name: name.trim(),
      ageGroup,
      gender,
      interests,
      photoUrl: photoUrl || undefined,
      budget: budget ? parseFloat(budget.replace(',', '.')) : undefined,
      pin: pin.trim() || undefined,
    });
  };

  const isValid = name.trim() && ageGroup && gender;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto <span className="text-gray-400">(optioneel)</span>
          </label>
          <div className="flex items-center gap-4">
            {/* Photo preview or placeholder */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer
                          border-2 border-dashed border-gray-300 hover:border-primary transition-colors
                          flex items-center justify-center ${photoUrl ? 'border-solid border-primary' : ''}`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary hover:text-primary-light font-medium"
              >
                {photoUrl ? 'Andere foto kiezen' : 'Foto uploaden'}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-sm text-red-500 hover:text-red-600 font-medium ml-3"
                >
                  Verwijderen
                </button>
              )}
              <p className="text-xs text-gray-500 mt-1">Je kunt de foto bijsnijden na selectie</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Naam
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bijv. Emma"
            className="input-field"
            autoFocus
          />
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leeftijdscategorie
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AGE_GROUPS.map((age) => (
              <button
                key={age.id}
                type="button"
                onClick={() => setAgeGroup(age.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  ageGroup === age.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-800">{age.label}</span>
                <span className="block text-sm text-gray-500">{age.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geslacht
          </label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGender(g.id)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  gender === g.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget <span className="text-gray-400">(optioneel)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            <input
              type="text"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="100"
              className="input-field pl-8"
              inputMode="decimal"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Stel een maximum budget in voor cadeaus</p>
        </div>

        {/* PIN Code */}
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
            Pincode <span className="text-gray-400">(optioneel)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="1234"
              className="input-field pl-12"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Beveilig dit lijstje met een 4-6 cijferige pincode</p>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interesses <span className="text-gray-400">(optioneel)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  interests.includes(interest.id)
                    ? 'border-gold bg-gold/10 text-gold-dark'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="mr-1">{interest.icon}</span>
                {interest.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full btn-primary ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submitLabel}
        </button>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
