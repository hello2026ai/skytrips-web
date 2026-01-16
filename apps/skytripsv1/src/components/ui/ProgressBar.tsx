import React from 'react';

interface Step {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  number: number;
}

interface ProgressBarProps {
  steps: Step[];
  onStepClick?: (stepNumber: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, onStepClick }) => {
  return (
    <div className="w-full pt-4 pb-9 bg-white rounded-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Base line (gray background) */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E5E7EB] -translate-y-1/2" />

          {/* Progress line (blue) */}
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-[#0c0073] -translate-y-1/2 transition-all duration-300"
            style={{
              width: `${
                (steps.filter((step) => step.isCompleted).length /
                  (steps.length - 1)) *
                100
              }%`,
            }}
          />

          {steps.map((step, index) => (
            <div key={step.title} className="flex-1 relative">
              {/* Step container */}
              <div className="relative flex flex-col items-center group ">
                {/* Step circle */}
                <button
                  onClick={() => onStepClick?.(step.number)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-out cursor-pointer
                    hover:shadow-md hover:scale-105
                    ${
                      step.isActive
                        ? 'bg-[#0c0073] text-white'
                        : step.isCompleted
                        ? 'bg-[#0c0073] text-white'
                        : 'bg-white border-2 border-[#0c0073] text-gray-400 hover:border-[#0c0073]/70 hover:text-gray-600'
                    }
                  `}
                >
                  {step.isCompleted ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{step.number}</span>
                  )}
                </button>
                {/* Step title */}
                <button
                  onClick={() => onStepClick?.(step.number)}
                  className={`
                    absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                    text-xs transition-colors duration-300 cursor-pointer
                    hover:text-[#0c0073]
                    ${
                      step.isActive || step.isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
