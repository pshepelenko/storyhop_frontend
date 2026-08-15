import { useEffect, useState } from 'react';

export type ReadingTextSize = 'small' | 'medium' | 'large';

export function useReadingTextSize(): ReadingTextSize {
  const [size, setSize] = useState<ReadingTextSize>('medium');
  useEffect(() => {
    const refresh = () => {
      const value = localStorage.getItem('storyhop_readingTextSize');
      setSize(value === 'small' || value === 'large' ? value : 'medium');
    };
    refresh();
    window.addEventListener('storyhop:reading-preference-change', refresh);
    return () => window.removeEventListener('storyhop:reading-preference-change', refresh);
  }, []);
  return size;
}
