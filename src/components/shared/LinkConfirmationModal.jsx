import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const LinkConfirmationModal = forwardRef(({ url, onConfirm, onCancel }, ref) => {
  const { t } = useTranslation();

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box border border-primary/20 shadow-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 text-warning">
          ⚠️ {t('social.linkModal.title')}
        </h3>
        <p className="py-4 text-sm">
          {t('social.linkModal.description')}
        </p>
        <div className="bg-base-200 p-3 rounded-lg break-all font-mono text-xs border border-base-300 mb-4">
          {url}
        </div>
        <p className="text-xs opacity-60 italic mb-6">
          {t('social.linkModal.warning')}
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{t('social.linkModal.confirm')}</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
});

export default LinkConfirmationModal;
