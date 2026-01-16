import React from 'react';

const EnglishNameExample: React.FC = () => (
  <div className="bg-container rounded-xl mt-4 p-4 md:p-6 mb-8">
    <h2 className="h5 mb-2 text-primary ">English Name Example</h2>
    <ol className="list-decimal pl-5 text-base text-neutral-dark mb-4 label-l2">
      <li>Ensure the information you provide matches your travel ID</li>
      <li>Ensure names follow our name guidelines</li>
    </ol>
    <div className="bg-white rounded-lg shadow p-0 md:p-6 flex flex-col md:flex-row gap-6">
      <img
        src="/assets/images/sample_passport.webp"
        alt="Passport Example"
        className="w-full h-auto rounded border  mb-2"
      />
    </div>
  </div>
);

export default EnglishNameExample;
