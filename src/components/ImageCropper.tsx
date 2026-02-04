import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    const img = new Image();
    img.src = image;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to cropped area
    const maxSize = 400;
    let targetWidth = croppedAreaPixels.width;
    let targetHeight = croppedAreaPixels.height;

    // Scale down if larger than maxSize
    if (targetWidth > maxSize || targetHeight > maxSize) {
      if (targetWidth > targetHeight) {
        targetHeight = (targetHeight * maxSize) / targetWidth;
        targetWidth = maxSize;
      } else {
        targetWidth = (targetWidth * maxSize) / targetHeight;
        targetHeight = maxSize;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw cropped image
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    // Convert to base64 with compression
    const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
    onCropComplete(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Annuleren
        </button>
        <span className="font-display font-semibold text-gray-800">Foto bijsnijden</span>
        <button
          onClick={createCroppedImage}
          className="text-primary hover:text-primary-light font-medium"
        >
          Gereed
        </button>
      </div>

      {/* Cropper */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
        />
      </div>

      {/* Zoom slider */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center gap-4 max-w-sm mx-auto">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Sleep om te verplaatsen, zoom om in/uit te zoomen
        </p>
      </div>
    </div>
  );
}
