import React from 'react';
import { CreateOfferForm } from './CreateOfferForm';
import type { Event } from '../../types/event';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSuccess?: (offer: any) => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess
}) => {
  if (!isOpen) return null;

  const handleSuccess = (offer: any) => {
    if (onSuccess) {
      onSuccess(offer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Form */}
          <CreateOfferForm
            event={event}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};