'use client';

import { useEffect } from 'react';
import { initializeDummyProducts } from '../utils/initData';

export function DataInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeDummyProducts();
    }
  }, []);

  return null;
}

