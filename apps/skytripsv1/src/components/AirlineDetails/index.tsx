import React from 'react';

interface AirlineDetailsProps {
  airline: {
    id: string;
    airlineName: string;
    airlineCode: string;
    country?: string;
    alliance?: string;
    airlineType?: string;
    yearOfEstablishment?: string;
    totalDestination?: string;
    totalFleet?: string;
    logoUrl?: string;
    description?: string;
  };
}

const AirlineDetails: React.FC<AirlineDetailsProps> = ({ airline }) => {
  return (
    <div className="w-full mb-8">
      <div className="bg-container rounded-lg shadow-sm p-6 md:p-8">
        {/* Title */}
        <h2 className="title-t2 text-background-on md:text-3xl font-bold text-gray-900 mb-4">
          {airline.airlineName}
        </h2>

        {/* Airline Description */}
        {airline.description && (
          <div
            className="label-l1 text-neutral-dark leading-relaxed mb-6 text-base"
            dangerouslySetInnerHTML={{
              __html: airline.description,
            }}
          />
        )}

        {/* Airline Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {/* Airline Code */}
          <div className="border border-gray-200 rounded-lg p-4 bg-container">
            <div className="label-l2 text-neutral-dark mb-1 ">Airline code</div>
            <div className="title-t3 text-background-on">
              {airline.airlineCode}
            </div>
          </div>

          {/* Airline Name */}
          <div className="border border-gray-200 rounded-lg p-4 bg-container">
            <div className="label-l2 text-neutral-dark mb-1 ">Airline name</div>
            <div className="title-t3 text-background-on">
              {airline.airlineName}
            </div>
          </div>

          {/* Alliance */}
          {airline.alliance && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">Alliance</div>
              <div className="title-t3 text-background-on">
                {airline.alliance}
              </div>
            </div>
          )}

          {/* Airline Type */}
          {airline.airlineType && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Airline type
              </div>
              <div className="title-t3 text-background-on">
                {airline.airlineType}
              </div>
            </div>
          )}

          {/* Home Country */}
          {airline.country && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Home country
              </div>
              <div className="title-t3 text-background-on">
                {airline.country}
              </div>
            </div>
          )}

          {/* Year of Establishment */}
          {airline.yearOfEstablishment && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Year of establishment
              </div>
              <div className="title-t3 text-background-on">
                {airline.yearOfEstablishment}
              </div>
            </div>
          )}

          {/* Destinations */}
          {airline.totalDestination && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">
                Destinations
              </div>
              <div className="title-t3 text-background-on">
                {airline.totalDestination}
              </div>
            </div>
          )}

          {/* Fleets */}
          {airline.totalFleet && (
            <div className="border border-gray-200 rounded-lg p-4 bg-container">
              <div className="label-l2 text-neutral-dark mb-1">Fleets</div>
              <div className="title-t3 text-background-on">
                {airline.totalFleet}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirlineDetails;
