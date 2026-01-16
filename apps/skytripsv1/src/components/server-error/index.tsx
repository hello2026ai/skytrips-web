import React, { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

export default function ServerErrorPage() {
  // Add subtle animation on page load
  useEffect(() => {
    const card = document.getElementById('error-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';

      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    }

    // Add animation to the cloud elements
    const animateClouds = () => {
      const clouds = document.querySelectorAll('.cloud');
      clouds.forEach((cloud, index) => {
        const speed = 1 + index * 0.5;
        const direction = index % 2 === 0 ? 1 : -1;
        const el = cloud as HTMLElement;
        el.style.transform = `translateX(${direction * speed}px)`;

        setTimeout(() => {
          el.style.transition = 'transform 3s ease-in-out';
          setInterval(() => {
            el.style.transform = `translateX(${direction * speed * -1}px)`;
            setTimeout(() => {
              el.style.transform = `translateX(${direction * speed}px)`;
            }, 3000);
          }, 6000);
        }, index * 200);
      });
    };

    animateClouds();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-start md:items-center justify-center pt-8 md:pt-0">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="cloud absolute top-[15%] left-[10%] w-32 h-12 bg-white opacity-30 rounded-full"></div>
        <div className="cloud absolute top-[25%] right-[15%] w-40 h-14 bg-white opacity-40 rounded-full"></div>
        <div className="cloud absolute bottom-[20%] left-[20%] w-36 h-10 bg-white opacity-20 rounded-full"></div>

        {/* Decorative Lines */}
        <div className="absolute left-0 right-0 top-[42%] h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        <div className="absolute left-0 right-0 top-[58%] h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>

      <div className="container mx-auto px-2 py-2 flex flex-col items-center z-10">
        {/* Error Card with 3D effects */}
        <div
          id="error-card"
          className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] overflow-hidden border border-[#e2e8f0] transition-all duration-700"
        >
          {/* Top Color Bar with animation */}
          <div className="h-2 bg-gradient-to-r from-[#0C0073] to-[#0D3BAE] relative">
            <div className="absolute top-0 left-0 right-0 h-full opacity-30 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0)_100%)] animate-[shimmer_2s_infinite]"></div>
          </div>

          <div className="p-4 text-center">
            {/* 3D Illustrated Server Error Scene */}
            <div className="relative w-full h-64 mb-2 perspective-[800px]">
              {/* Server Rack */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 transform-style-preserve-3d transition-transform duration-700 hover:rotate-y-[10deg] hover:rotate-x-[5deg]">
                {/* Background Server Elements */}
                <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Server Grid */}
                    <g className="opacity-5">
                      <rect
                        x="30"
                        y="30"
                        width="140"
                        height="140"
                        rx="4"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        fill="#EDF2F7"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="30"
                        y1="70"
                        x2="170"
                        y2="70"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="30"
                        y1="110"
                        x2="170"
                        y2="110"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="30"
                        y1="150"
                        x2="170"
                        y2="150"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="70"
                        y1="30"
                        x2="70"
                        y2="170"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="110"
                        y1="30"
                        x2="110"
                        y2="170"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="150"
                        y1="30"
                        x2="150"
                        y2="170"
                        stroke="#5B75A6"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                    </g>
                  </svg>
                </div>

                {/* 3D Server */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Server Cabinet Shadow */}
                    <rect
                      x="60"
                      y="47"
                      width="83"
                      height="120"
                      rx="4"
                      fill="#CBD5E1"
                    />

                    {/* Main Server Cabinet */}
                    <rect
                      x="55"
                      y="40"
                      width="83"
                      height="120"
                      rx="4"
                      fill="url(#paint0_linear)"
                      stroke="#64748B"
                      strokeWidth="1"
                    />

                    {/* Server Units */}
                    <rect
                      x="58"
                      y="45"
                      width="77"
                      height="20"
                      rx="2"
                      fill="#E2E8F0"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="58"
                      y="70"
                      width="77"
                      height="20"
                      rx="2"
                      fill="#EDF2F7"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="58"
                      y="95"
                      width="77"
                      height="20"
                      rx="2"
                      fill="#E2E8F0"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="58"
                      y="120"
                      width="77"
                      height="20"
                      rx="2"
                      fill="#EDF2F7"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />

                    {/* Small Indicator Lights */}
                    <circle cx="65" cy="53" r="2" fill="#10B981" />
                    <circle cx="65" cy="78" r="2" fill="#10B981" />
                    <circle
                      cx="65"
                      cy="103"
                      r="2"
                      fill="#EF4444"
                      className="animate-[pulse_1.5s_ease-in-out_infinite]"
                    />
                    <circle cx="65" cy="128" r="2" fill="#F59E0B" />

                    {/* Handle Details */}
                    <rect
                      x="125"
                      y="51"
                      width="4"
                      height="8"
                      rx="1"
                      fill="#94A3B8"
                    />
                    <rect
                      x="125"
                      y="76"
                      width="4"
                      height="8"
                      rx="1"
                      fill="#94A3B8"
                    />
                    <rect
                      x="125"
                      y="101"
                      width="4"
                      height="8"
                      rx="1"
                      fill="#94A3B8"
                    />
                    <rect
                      x="125"
                      y="126"
                      width="4"
                      height="8"
                      rx="1"
                      fill="#94A3B8"
                    />

                    {/* Warning Sign */}
                    <g transform="translate(100, 100)">
                      <circle
                        cx="20"
                        cy="-40"
                        r="25"
                        fill="#FEF2F2"
                        stroke="#F87171"
                        strokeWidth="1"
                      />
                      <path
                        d="M20 -55L20 -35"
                        stroke="#DC2626"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="20" cy="-30" r="1.5" fill="#DC2626" />
                    </g>

                    {/* Digital Display (Error Code) */}
                    <rect
                      x="75"
                      y="103"
                      width="30"
                      height="12"
                      rx="1"
                      fill="#1E293B"
                    />
                    <text
                      x="79"
                      y="113"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#EF4444"
                    >
                      ERR
                    </text>

                    {/* Network Cables */}
                    <path
                      d="M40 90C30 90 20 80 20 70"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 100C20 100 5 85 5 65"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 110C15 110 0 95 0 80"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M160 90C170 90 180 80 180 70"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M160 100C180 100 195 85 195 65"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M160 110C185 110 200 95 200 80"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Server Unit Detail Lines */}
                    <line
                      x1="70"
                      y1="53"
                      x2="115"
                      y2="53"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <line
                      x1="70"
                      y1="78"
                      x2="115"
                      y2="78"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <line
                      x1="70"
                      y1="103"
                      x2="70"
                      y2="103"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />
                    <line
                      x1="70"
                      y1="128"
                      x2="115"
                      y2="128"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                    />

                    {/* Data Transmission Animation */}
                    <circle
                      cx="20"
                      cy="70"
                      r="2"
                      fill="#3B82F6"
                      className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"
                    />
                    <circle
                      cx="5"
                      cy="65"
                      r="2"
                      fill="#10B981"
                      className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                    />
                    <circle
                      cx="0"
                      cy="80"
                      r="2"
                      fill="#F59E0B"
                      className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"
                    />

                    {/* Error Flash */}
                    <rect
                      x="55"
                      y="95"
                      width="83"
                      height="20"
                      rx="2"
                      fill="#EF4444"
                      fillOpacity="0.2"
                      className="animate-[pulse_2s_ease-in-out_infinite]"
                    />

                    {/* Linear Gradients */}
                    <defs>
                      <linearGradient
                        id="paint0_linear"
                        x1="55"
                        y1="40"
                        x2="138"
                        y2="160"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#F1F5F9" />
                        <stop offset="1" stopColor="#CBD5E1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Content with gradient text */}
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#0C0073] to-[#0D3BAE] text-transparent bg-clip-text">
              Server Error
            </h1>
            <p className="text-gray-600 mb-3 max-w-md mx-auto">
              Sorry, we're experiencing technical difficulties right now.
            </p>
            <p className="text-gray-500 mb-8 text-sm max-w-md mx-auto">
              Our team has been notified and is working to fix the issue as
              quickly as possible.
            </p>

            {/* Buttons with animation effects */}
            <div className="flex flex-col space-y-3 px-8 max-w-sm mx-auto">
              <Link href="/" passHref>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full relative bg-gradient-to-r from-[#0C0073] to-[#0D3BAE] hover:opacity-90 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] overflow-hidden group"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  Return Home
                </Button>
              </Link>

              <div className="flex items-center justify-center mt-4">
                <a
                  href="tel:+61420678910"
                  className="relative group flex items-center space-x-2 text-[#0D3BAE] hover:text-[#0C0073] transition-colors duration-300 py-2 px-3 rounded-full hover:bg-blue-50"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 relative z-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">+61 240720886</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer with glass effect */}
          <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
