
import React from 'react';
import { XIcon } from './icons';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, onConfirm, confirmText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-2xl font-bold text-[#0B72B9]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6"/>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {(onConfirm || confirmText) && (
            <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                <button 
                  onClick={onConfirm}
                  className="bg-[#0B72B9] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-[#085a94] transition-colors"
                >
                    {confirmText || 'OK'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
