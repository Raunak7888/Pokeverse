import React from "react";

interface ModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
        <div className="modal-content w-90">
          <h2 className="text-xl font-bold">{message}</h2>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#EE4035] text-white font-semibold rounded-full transition-transform duration-300 hover:scale-105 shadow-lg"
          >
            Okay!!!
          </button>
      </div>

      <style jsx>{`
        /* Custom property for animating border angle */
        @property --border-angle {
          syntax: "<angle>";
          inherits: true;
          initial-value: 0turn;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
          animation: fadeIn 0.5s ease forwards;
          background: rgba(0, 0, 0, 0); /* starting transparent */
          backdrop-filter: blur(0px);
          animation: backdropIn 1s ease forwards;
        }

        @keyframes backdropIn {
          0% {
            background: rgba(0, 0, 0, 0);
            backdrop-filter: blur(0px);
          }
          100% {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
          }
        }


        .modal-content {
          background: #1e1e1e;
          color: white;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          box-shadow: 0 0 25px #000;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transform: scale(0.8);
          opacity: 0;
          animation: scaleIn 0.8s ease forwards;
        }

        @keyframes scaleIn {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
