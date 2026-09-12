import React, { useState, useEffect } from 'react';
import { getEffectiveAvatarUrl, getRealAvatarUrl } from '../utils/avatarHelper';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  username: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  username,
  size = 38,
  className = 'table-avatar',
  alt,
}) => {
  // Always resolve to a high-resolution human portrait, strictly eliminating dicebear
  const [currentSrc, setCurrentSrc] = useState<string>(() =>
    getEffectiveAvatarUrl(username, src)
  );
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync state whenever props change
  useEffect(() => {
    setCurrentSrc(getEffectiveAvatarUrl(username, src));
    setHasError(false);
  }, [src, username]);

  const handleImageError = () => {
    const fallbackRealPortrait = getRealAvatarUrl(username);
    // If the currently attempted src is not our verified Unsplash portrait, fall back to it
    if (currentSrc !== fallbackRealPortrait) {
      setCurrentSrc(fallbackRealPortrait);
    } else {
      setHasError(true);
    }
  };

  const initial = (username || '?').replace(/^@/, '').charAt(0).toUpperCase();

  // Vibrant gradient colors based on username for graceful offline/network failure fallback
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const bgGradient = gradients[Math.abs(hash) % gradients.length];

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          minWidth: size,
          maxWidth: size,
          minHeight: size,
          maxHeight: size,
          borderRadius: '50%',
          background: bgGradient,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: Math.round(size * 0.38),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
        }}
        title={`@${username}`}
      >
        {size >= 32 ? (
          <User size={Math.round(size * 0.44)} strokeWidth={2.2} />
        ) : (
          initial
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || username}
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        maxWidth: size,
        minHeight: size,
        maxHeight: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        display: 'block',
      }}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleImageError}
    />
  );
};
