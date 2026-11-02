import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ReferralCapturer() {
  const location = useLocation();

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const refCode = searchParams.get('ref') || searchParams.get('referral');

      if (refCode && refCode.trim()) {
        const cleanCode = refCode.toUpperCase().trim();
        sessionStorage.setItem('referral_code', cleanCode);
        localStorage.setItem('referral_code', cleanCode);
      }
    } catch (e) {
      console.warn('Could not parse referral code from URL:', e);
    }
  }, [location.search]);

  return null;
}
