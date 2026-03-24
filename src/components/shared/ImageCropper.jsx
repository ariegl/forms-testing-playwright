import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/imageUtils';

function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4">
      <div className="relative flex-1 bg-neutral rounded-xl overflow-hidden shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
          showGrid={true}
        />
      </div>
      <div className="flex flex-col gap-4 mt-4 bg-base-100 p-6 rounded-2xl shadow-lg border border-base-300">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold opacity-70">Zoom:</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="range range-primary range-sm flex-1"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button className="btn btn-ghost font-bold" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary px-8 font-bold shadow-md" onClick={handleDone}>
            Recortar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
