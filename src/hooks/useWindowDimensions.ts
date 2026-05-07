import { useState, useEffect } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}


export const useWindowDimensions = () => {
  // Initialize with null or undefined to avoid SSR mismatch
  const [windowDimensions, setWindowDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
