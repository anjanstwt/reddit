'use client';

import { useEffect, useState } from 'react';

export function useIsMac() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => setIsMac(/mac/i.test(navigator.userAgent)), []);
  return isMac;
}
