import React from 'react';
import { Info, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  message: string;
  variant?: 'info' | 'warning' | 'alert';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  message,
  variant = 'info',
  className = '',
  dismissible = false,
  onDismiss,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
        };
      case 'alert':
        return {
          container: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-900',
          icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm leading-relaxed transition-all shadow-sm ${style.container} ${className}`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1 font-medium">{message}</div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          className="text-slate-400 hover:text-slate-600 text-base font-bold ml-2 leading-none"
          aria-label="Dismiss disclaimer"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default DisclaimerBanner;
