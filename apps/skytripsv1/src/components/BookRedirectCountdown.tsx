import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function BookRedirectCountdown({ redirectCountdown }: { redirectCountdown: number }) {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [pulseRing, setPulseRing] = useState(false);
  
  useEffect(() => {
    setFadeIn(true);
    const pulseInterval = setInterval(() => {
      setPulseRing(prev => !prev);
    }, 2000);
    
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-white/80 to-gray-100/95 backdrop-blur-sm flex items-start md:items-center justify-center z-50 transition-all duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-white shadow-[0_8px_32px_rgba(0,128,255,0.2)] max-w-md w-full mx-4 md:mx-auto text-center transform transition-all duration-700 mt-8 md:mt-0 ${fadeIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        <div className="text-red-500 mb-6 relative">
          <div className="rounded-full bg-gradient-to-br from-red-50 to-red-100 p-4 inline-block mb-2 relative overflow-hidden">
            <div className={`absolute inset-0 bg-red-200/50 rounded-full scale-0 transition-transform duration-1000 ${pulseRing ? 'scale-150' : 'scale-0'}`}></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto relative z-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-wide">No Fare Applicable</h3>
        <p className="mb-5 text-gray-600 font-normal">This flight is no longer available at the selected price. You will be redirected to the previous page in:</p>
        <div className="text-5xl font-bold text-primary mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-60"></div>
            <div className="absolute inset-1 rounded-full border border-primary/20"></div>
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{redirectCountdown}</span>
          </div>
        </div>
        <button 
          onClick={() => router.back()} 
          className="relative overflow-hidden bg-primary text-white py-3 px-10 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 font-medium tracking-wider hover:shadow-xl hover:shadow-primary/30 group"
        >
          <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative">Return Now</span>
        </button>
      </div>
    </div>
  );
}
