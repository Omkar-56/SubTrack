import { useState } from 'react';
import { getBrandLogoUrl, getInitials, getCategoryStyle } from '../utils/brands';

export default function BrandLogo({ name = '', category = 'other', size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getBrandLogoUrl(name);
  const initials = getInitials(name);
  const categoryStyle = getCategoryStyle(category);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-xs',
    md: 'w-10 h-10 text-sm rounded-sm',
    lg: 'w-12 h-12 text-base rounded-md',
  }[size] || 'w-10 h-10 text-sm rounded-sm';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size] || 'w-5 h-5';

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} bg-white border border-line/70 flex items-center justify-center p-1.5 shadow-2xs shrink-0 overflow-hidden`}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className={`${iconSizes} object-contain`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} ${categoryStyle.bg} border flex items-center justify-center font-display font-semibold tracking-tight shrink-0 select-none`}
      title={`${name} (${category})`}
    >
      {initials}
    </div>
  );
}
