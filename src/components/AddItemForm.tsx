import { useState } from 'react';

interface AddItemFormProps {
  onSubmit: (data: {
    name: string;
    price?: number;
    url?: string;
    imageUrl?: string;
    note?: string;
  }) => void;
  onCancel: () => void;
}

export function AddItemForm({ onSubmit, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      price: price ? parseFloat(price.replace(',', '.')) : undefined,
      url: url.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
          Productnaam *
        </label>
        <input
          type="text"
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. LEGO Star Wars set"
          className="input-field"
          autoFocus
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 mb-1">
          Prijs <span className="text-gray-400">(optioneel)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
          <input
            type="text"
            id="item-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29,99"
            className="input-field pl-8"
            inputMode="decimal"
          />
        </div>
      </div>

      {/* URL */}
      <div>
        <label htmlFor="item-url" className="block text-sm font-medium text-gray-700 mb-1">
          Link naar product <span className="text-gray-400">(optioneel)</span>
        </label>
        <input
          type="text"
          id="item-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="bol.com/product of www.amazon.nl/..."
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">Je kunt ook gewoon de domeinnaam invoeren</p>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="item-image" className="block text-sm font-medium text-gray-700 mb-1">
          Afbeelding URL <span className="text-gray-400">(optioneel)</span>
        </label>
        <input
          type="url"
          id="item-image"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="input-field"
        />
        {imageUrl && (
          <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Note */}
      <div>
        <label htmlFor="item-note" className="block text-sm font-medium text-gray-700 mb-1">
          Notitie <span className="text-gray-400">(optioneel)</span>
        </label>
        <textarea
          id="item-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Bijv. Maat M, kleur blauw"
          rows={2}
          className="input-field resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className={`flex-1 btn-primary ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Toevoegen
        </button>
      </div>
    </form>
  );
}
