import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmModal = React.forwardRef(({ onConfirm, onCancel, title, children }, ref) => {
  const { t } = useTranslation();

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box border border-base-300 shadow-2xl">
        <h3 className="font-bold text-xl text-error mb-2">{title || t('common.confirmDelete')}</h3>
        <div className="py-2">
          {children || <p className="text-sm opacity-70">{t('common.confirmDeleteDescription')}</p>}
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>{t('common.cancel')}</button>
          <button className="btn btn-error px-8 font-bold" onClick={onConfirm}>{t('common.yesDelete')}</button>
        </div>
      </div>
    </dialog>
  );
});

export default ConfirmModal;
