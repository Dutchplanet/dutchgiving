import { useState } from 'react';
import { Person } from '../types';

interface ShareButtonProps {
  person: Person;
}

export function ShareButton({ person }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${person.shareCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verlanglijstje van ${person.name}`,
          text: `Bekijk het verlanglijstje van ${person.name}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, show modal instead
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Delen"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                Deel het lijstje van {person.name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Deel deze link met vrienden en familie zodat zij kunnen zien wat {person.name} op het verlanglijstje heeft staan.
            </p>

            {/* URL Box */}
            <div className="flex items-center gap-2 bg-cream rounded-xl p-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary-light'
                }`}
              >
                {copied ? 'Gekopieerd!' : 'Kopiëren'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Anderen kunnen items afvinken als ze gekocht zijn
            </p>
          </div>
        </div>
      )}
    </>
  );
}
