import React from 'react';

// import NewFlightDetail from "../NewFlightDetail"
import NewFlightDetail from '@skytrips-web/libs/shared-ui/NewFlightDetail';

const Modal = (props) => {
  const {
    data,
    id,
    price,
    flightFilter,
    amenities,
    dictionaries,
    handleFlightSeatmap,
    flightInfo,
    singleTravelerPricing,
    priceApiLoading,
    tripType,
    originLocationCode,
    destinationLocationCode,
    travelClass,
    adult,
    children,
    departureDate,
    infant,
    totalTraveler,
  } = props;

  return (
    <div className="modal fade" id={id} aria-hidden="true">
      <NewFlightDetail
        data={data}
        price={price}
        flightFilter={flightFilter}
        amenities={amenities}
        dictionaries={dictionaries}
        handleFlightSeatmap={handleFlightSeatmap}
        flightInfo={flightInfo}
        singleTravelerPricing={singleTravelerPricing}
        priceApiLoading={priceApiLoading}
        originLocationCode={originLocationCode}
        destinationLocationCode={destinationLocationCode}
        travelClass={travelClass}
        tripType={tripType}
        adult={adult}
        children={children}
        departureDate={departureDate}
        infant={infant}
        totalTraveler={totalTraveler}
      />
    </div>
  );
};

export default Modal;
