import { useEffect } from 'react';
import { MainApplication } from '@/components/layout/MainApplication';

export default function ExplorePage() {
  useEffect(() => {
    try {
      sessionStorage.setItem('litas_last_page', '/explore');
    } catch {
      // ignore
    }
  }, []);

  return <MainApplication />;
}
