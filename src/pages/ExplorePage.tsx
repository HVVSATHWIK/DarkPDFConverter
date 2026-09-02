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

  return (
    <div className="w-full h-[calc(100vh-64px)] relative overflow-hidden bg-slate-950">
      <MainApplication />
    </div>
  );
}
