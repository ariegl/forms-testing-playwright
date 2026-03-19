import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmModal = React.forwardRef(({ onConfirm, onCancel }, ref) => {
  const { t } = useTranslation();

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">{t('common.confirmDelete')}</h3>
        <div className="modal-action">
          <button className="btn btn-ghost mr-2" onClick={onCancel}>{t('common.cancel')}</button>
          <button className="btn btn-error" onClick={onConfirm}>{t('common.yesDelete')}</button>
        </div>
      </div>
    </dialog>
  );
});

export default ConfirmModal;
