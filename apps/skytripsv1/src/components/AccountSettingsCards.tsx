import React from 'react';

type AccountSettingsCardsProps = {
  onSelect: (view: 'profile' | 'passengers' | 'security') => void;
};

const cards = [
  {
    key: 'profile',
    title: 'Profile',
    desc: 'Manage your personal information and contact details',
    icon: (
      <span className="bg-blue-100 text-blue-600 rounded-full p-3">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12Zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
    ),
  },
  {
    key: 'passengers',
    title: 'Passenger Details',
    desc: 'Manage passenger information including passport details for faster booking',
    icon: (
      <span className="bg-blue-100 text-blue-600 rounded-full p-3">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12Zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
    ),
  },
  {
    key: 'security',
    title: 'Security Settings',
    desc: 'Manage your password and security preferences',
    icon: (
      <span className="bg-blue-100 text-blue-600 rounded-full p-3">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"
            fill="currentColor"
          />
        </svg>
      </span>
    ),
  },
];

const AccountSettingsCards: React.FC<AccountSettingsCardsProps> = ({
  onSelect,
}) => (
  <div className="flex flex-col md:flex-row gap-6">
    {cards.map((card) => (
      <div
        key={card.key}
        className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-start"
      >
        {card.icon}
        <h2 className="text-2xl font-bold mt-2 mb-1">{card.title}</h2>
        <p className="text-gray-500 mb-6">{card.desc}</p>
        <button
          className="w-full border rounded py-3 font-semibold hover:bg-gray-50 transition"
          onClick={() =>
            onSelect(card.key as 'profile' | 'passengers' | 'security')
          }
        >
          Manage
        </button>
      </div>
    ))}
  </div>
);

export default AccountSettingsCards;
