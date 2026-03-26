import React, { useState, useRef } from 'react';
import LinkConfirmationModal from './LinkConfirmationModal';

const LinkifiedText = ({ text, isPrimary }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const [selectedUrl, setSelectedUrl] = useState('');
  const modalRef = useRef(null);

  const handleClick = (e, url) => {
    e.preventDefault();
    setSelectedUrl(url);
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const handleConfirm = () => {
    window.open(selectedUrl, '_blank', 'noopener,noreferrer');
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  const handleCancel = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  if (!text) return null;

  const parts = text.split(urlRegex);

  // Clase de color según si el fondo es primario (morado) o secundario (rosa)
  // Utilizamos colores que contrasten bien: blanco para primario, o un azul muy claro/blanco para secundario
  const linkClass = isPrimary 
    ? "text-white underline font-bold hover:text-white/80 transition-colors break-all" 
    : "text-primary-content underline font-bold hover:opacity-80 transition-opacity break-all";

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              onClick={(e) => handleClick(e, part)}
              className={linkClass}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
      
      <LinkConfirmationModal 
        ref={modalRef}
        url={selectedUrl}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default LinkifiedText;
