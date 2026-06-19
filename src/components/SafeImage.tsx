'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  /**
   * URL to use if the primary `src` fails to load.
   * If the fallback also fails, the component hides itself entirely.
   */
  fallbackSrc?: string;
  /**
   * If true, wraps the image in a `div` with the given className so the
   * parent doesn't need to manage the outer container sizing separately.
   * Useful for fill-mode images.
   */
  containerClassName?: string;
}

/**
 * SafeImage — A Next.js <Image> wrapper with automatic error fallback.
 *
 * Usage:
 *   <SafeImage
 *     src={primaryUrl}
 *     fallbackSrc={categoryFallbackUrl}
 *     alt="Description"
 *     fill
 *     className="object-cover"
 *   />
 */
export default function SafeImage({
  src,
  fallbackSrc,
  alt,
  containerClassName,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | typeof src>(src);
  const [errored, setErrored] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const handleError = () => {
    if (!errored && fallbackSrc && currentSrc !== fallbackSrc) {
      // First failure — try the category fallback
      setCurrentSrc(fallbackSrc);
      setErrored(true);
    } else {
      // Fallback also failed — hide the component
      setFallbackFailed(true);
    }
  };

  if (fallbackFailed) return null;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
