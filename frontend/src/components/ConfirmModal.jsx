import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'CONFIRM_ACTION', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  type = 'danger' // 'danger' or 'warning'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 font-[FiraCode]"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)',
          border: '2px solid',
          borderColor: type === 'danger' ? '#cc0000' : '#ffc107',
          boxShadow: type === 'danger' 
            ? '0 0 30px rgba(204, 0, 0, 0.3), inset 0 0 30px rgba(204, 0, 0, 0.05)' 
            : '0 0 30px rgba(255, 193, 7, 0.3), inset 0 0 30px rgba(255, 193, 7, 0.05)',
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        {/* Corner Decorations */}
        <div 
          className="absolute top-0 left-0 w-3 h-3" 
          style={{ 
            borderTop: `3px solid ${type === 'danger' ? '#cc0000' : '#ffc107'}`,
            borderLeft: `3px solid ${type === 'danger' ? '#cc0000' : '#ffc107'}`
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3" 
          style={{ 
            borderBottom: `3px solid ${type === 'danger' ? '#cc0000' : '#ffc107'}`,
            borderRight: `3px solid ${type === 'danger' ? '#cc0000' : '#ffc107'}`
          }}
        />

        {/* Scan Line Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
            animation: 'scan 8s linear infinite'
          }}
        />

        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: type === 'danger' ? 'rgba(204, 0, 0, 0.3)' : 'rgba(255, 193, 7, 0.3)' }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded"
              style={{
                background: type === 'danger' ? 'rgba(204, 0, 0, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                boxShadow: type === 'danger' 
                  ? '0 0 15px rgba(204, 0, 0, 0.4)' 
                  : '0 0 15px rgba(255, 193, 7, 0.4)'
              }}
            >
              <AlertTriangle 
                className="w-5 h-5" 
                style={{ color: type === 'danger' ? '#ff4444' : '#ffc107' }}
              />
            </div>
            <h2 
              className="text-lg font-bold font-[Orbitron] tracking-wider"
              style={{ color: type === 'danger' ? '#ff4444' : '#ffc107' }}
            >
              {title}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 transition-all rounded"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666666';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p 
            className="text-sm leading-relaxed font-[Rajdhani]"
            style={{ color: '#cccccc' }}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex space-x-3"
          style={{ borderColor: type === 'danger' ? 'rgba(204, 0, 0, 0.3)' : 'rgba(255, 193, 7, 0.3)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
            style={{
              backgroundColor: 'rgba(74, 14, 78, 0.2)',
              color: '#aa66aa',
              border: '1px solid rgba(74, 14, 78, 0.4)',
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(74, 14, 78, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 font-[Rajdhani] font-semibold tracking-wide transition-all"
            style={{
              backgroundColor: type === 'danger' ? 'rgba(204, 0, 0, 0.2)' : 'rgba(255, 193, 7, 0.2)',
              color: type === 'danger' ? '#ff4444' : '#ffc107',
              border: type === 'danger' ? '1px solid rgba(204, 0, 0, 0.5)' : '1px solid rgba(255, 193, 7, 0.5)',
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = type === 'danger' 
                ? 'rgba(204, 0, 0, 0.3)' 
                : 'rgba(255, 193, 7, 0.3)';
              e.currentTarget.style.boxShadow = type === 'danger'
                ? '0 0 15px rgba(204, 0, 0, 0.5)'
                : '0 0 15px rgba(255, 193, 7, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = type === 'danger' 
                ? 'rgba(204, 0, 0, 0.2)' 
                : 'rgba(255, 193, 7, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
