import { useState, useRef, useEffect } from 'react';
import { Twinkles } from './Twinkles';

interface PinLockProps {
  personName: string;
  onUnlock: () => void;
  correctPin: string;
}

export function PinLock({ personName, onUnlock, correctPin }: PinLockProps) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinLength = correctPin.length;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const enteredPin = newPin.slice(0, pinLength).join('');
    if (enteredPin.length === pinLength) {
      if (enteredPin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, pinLength);
    if (pastedData) {
      const newPin = [...pin];
      pastedData.split('').forEach((char, i) => {
        if (i < pinLength) newPin[i] = char;
      });
      setPin(newPin);

      if (pastedData.length === pinLength) {
        if (pastedData === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          }, 500);
        }
      } else {
        inputRefs.current[Math.min(pastedData.length, pinLength - 1)]?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="magic-gradient px-6 pt-12 pb-20 relative overflow-hidden">
        <Twinkles count={15} />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Beveiligd lijstje
          </h1>
          <p className="text-white/80 mt-1">
            Verlanglijstje van {personName}
          </p>
        </div>
      </div>

      {/* PIN Entry */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h2 className="font-display font-semibold text-gray-800 text-center mb-2">
            Voer pincode in
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Dit lijstje is beveiligd met een {pinLength}-cijferige pincode
          </p>

          <div
            className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}
            onPaste={handlePaste}
          >
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2
                           focus:outline-none transition-colors
                           ${error
                             ? 'border-red-500 bg-red-50'
                             : pin[index]
                               ? 'border-primary bg-primary/5'
                               : 'border-gray-200 focus:border-primary'
                           }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              Onjuiste pincode, probeer opnieuw
            </p>
          )}

          <p className="text-xs text-gray-400 text-center">
            Vraag de eigenaar van dit lijstje om de pincode
          </p>
        </div>
      </div>

      {/* Add shake animation to CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
