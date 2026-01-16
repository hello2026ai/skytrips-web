import { getItemFromIatacode } from '../../../shared-utils';
import { Tab, Tabs } from '@mui/material';

import React, { useEffect, useState } from 'react';
import shoppingBag from '../../../shared-assets/images/icons/shopping-bag-fill.svg';
import suitCase from '../../../shared-assets/images/icons/suitcase-2-fill.svg';
import Image from 'next/image';

const BaggageTab = ({
  singleTravelerPricing,
  data,
  singleTravelerId,
  isAdmin,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  console.log('activeTab', activeTab);
  return (
    <>
      <div className="hr-line" key={singleTravelerId} />

      {/* tab start */}
      {isAdmin ? (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="baggage tabs"
        >
          {data &&
            data?.map(
              (segmentList, i) =>
                segmentList &&
                segmentList.segments?.map((segment) => (
                  <Tab
                    key={segment.id}
                    label={`Flight to ${getItemFromIatacode(segment?.arrival?.iataCode)?.city ?? segment?.arrival?.iataCode}`}
                    id={`baggage-${segment.id}`}
                    aria-controls={`baggage-${segment.id}-tab`}
                  />
                )),
            )}
        </Tabs>
      ) : (
        <ul
          className="nav nav-pills  nav-responsive bg-opacity-10 py-2 px-0 mb-3 overflow-x-auto whitespace-nowrap flex-nowrap  justify-content-start  "
          id="baggage-pills-tab"
          role="tablist"
        >
          {/* Flight Details tab */}

          {data &&
            data?.map(
              (segmentList, i) =>
                segmentList &&
                segmentList.segments?.map((segment, index) => (
                  <li
                    className="nav-item "
                    role="presentation"
                    key={segment.id}
                  >
                    <button
                      className={`nav-link ${
                        index === 0 && i == 0 ? 'active' : ''
                      } mb-0 text-uppercase baggage-tab`}
                      id={`baggage-${segment.id}`}
                      data-bs-toggle="pill"
                      data-bs-target={`#baggage-${segment.id}-tab`}
                      type="button"
                      role="tab"
                      aria-controls={`baggage-${segment.id}-tab`}
                      aria-selected="true"
                    >
                      Flight to{' '}
                      {(() => {
                        const location = getItemFromIatacode(
                          segment?.arrival?.iataCode,
                        );
                        return location?.city ?? segment?.arrival?.iataCode;
                      })()}
                    </button>
                  </li>
                )),
            )}
        </ul>
      )}
      {/* tab end */}
      <div className="tab-content mb-0" id="baggage-pills-tabContent">
        {data &&
          data.map((segmentList, i) =>
            segmentList.segments.map((segment, index) => (
              <div
                key={segment.id}
                // className="tab-pane fade show"
                // className={`tab-pane fade ${
                //   index === 0 && i === 0 ? 'show active' : ''
                // }`}
                className={`tab-pane fade ${
                  isAdmin
                    ? index === activeTab
                      ? 'show active'
                      : ''
                    : index === 0 && i === 0
                      ? 'show active'
                      : ''
                }`}
                id={`baggage-${segment.id}-tab`}
                role="tabpanel"
                aria-labelledby={`baggage-${segment.id}`}
              >
                {singleTravelerPricing &&
                  singleTravelerPricing.map((item) =>
                    item.fareDetailsBySegment
                      .filter(
                        (fareDetail) =>
                          fareDetail.segmentId === segment.id &&
                          item.travelerId === singleTravelerId,
                      )
                      .map((matchedFareDetail) => (
                        <div key={matchedFareDetail.segmentId}>
                          {/* Handbag Section */}
                          <div
                            className={
                              isAdmin
                                ? 'flex'
                                : 'd-flex flex-row align-items-center bag-section gap-3 flex-nowrap'
                            }
                          >
                            <div
                              className={
                                isAdmin
                                  ? 'flex'
                                  : 'd-flex flex-row align-items-center flex-nowrap'
                              }
                            >
                              <div className="image-wrapper">
                                <Image
                                  src={shoppingBag}
                                  alt="bag"
                                  className="mr-3"
                                  width="50px"
                                  height="50px"
                                />
                              </div>
                              <div
                                className="w-full mt-2 bag-icon-section"
                                style={{ width: '150px' }}
                              >
                                <h6 className="bag-heading ml-2">Handbag</h6>
                                <p className="bag-included-text">
                                  {matchedFareDetail?.includedCabinBags
                                    ? matchedFareDetail.includedCabinBags
                                        ?.quantity
                                      ? matchedFareDetail.includedCabinBags
                                          ?.quantity
                                      : '1'
                                    : '0'}{' '}
                                  Included
                                </p>
                              </div>
                            </div>

                            <div className="w-100 ml-4 mt-1 dimension">
                              <div className="row ">
                                <div className="col-12 pl-0">
                                  <span className="bag-included-text-dimension">
                                    40 x 30 x 10 cm
                                  </span>
                                </div>
                                <div className="col-12  pl-0">
                                  <span className="bag-included-text-dimension   ">
                                    {matchedFareDetail?.includedCabinBags
                                      ? matchedFareDetail?.includedCabinBags
                                          ?.weight
                                        ? matchedFareDetail.includedCabinBags
                                            ?.weight
                                        : `${Array(
                                            matchedFareDetail.includedCabinBags
                                              .quantity,
                                          )
                                            .fill(7)
                                            .join(' KGs + ')}`
                                      : 'N/A'}{' '}
                                    {matchedFareDetail?.includedCabinBags
                                      ? 'KGs'
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Checked-in Baggage Section */}
                          <div
                            className={
                              isAdmin
                                ? 'flex'
                                : 'd-flex flex-row align-items-center bag-section gap-3 flex-nowrap'
                            }
                          >
                            <div
                              className={
                                isAdmin
                                  ? 'flex'
                                  : 'd-flex flex-row align-items-center flex-nowrap'
                              }
                            >
                              <div className="image-wrapper">
                                <Image
                                  src={suitCase}
                                  alt="bag"
                                  className="mr-3"
                                  width="50px"
                                  height="50px"
                                />
                              </div>
                              <div
                                className="w-full mt-2"
                                style={{ width: '150px' }}
                              >
                                <h6 className="bag-heading ml-2">
                                  Check-in Baggage
                                </h6>
                                <p className="bag-included-text ">
                                  {matchedFareDetail?.includedCheckedBags
                                    ? matchedFareDetail?.includedCheckedBags
                                        ?.quantity
                                      ? matchedFareDetail?.includedCheckedBags
                                          ?.quantity
                                      : '1'
                                    : '0'}{' '}
                                  Included
                                </p>
                              </div>
                            </div>

                            <div className="w-100 ml-4 mt-1">
                              <div className="row">
                                <div className="col-12 col-md-9 pl-0">
                                  <span className="bag-included-text-dimension">
                                    55 x 40 x 23 cm
                                  </span>
                                </div>
                                <div className="col-12 col-md-9 pl-0">
                                  <span className="bag-included-text-dimension">
                                    {matchedFareDetail?.includedCheckedBags
                                      ? matchedFareDetail?.includedCheckedBags
                                          ?.weight
                                        ? matchedFareDetail?.includedCheckedBags
                                            ?.weight
                                        : matchedFareDetail?.includedCheckedBags
                                              ?.quantity
                                          ? `${Array(
                                              matchedFareDetail
                                                .includedCheckedBags.quantity,
                                            )
                                              .fill(23)
                                              .join(' KGs + ')}`
                                          : ''
                                      : 'N/A'}{' '}
                                    {matchedFareDetail?.includedCheckedBags
                                      ?.weightUnit
                                      ? matchedFareDetail?.includedCheckedBags
                                          ?.weightUnit
                                      : matchedFareDetail?.includedCheckedBags
                                            ?.quantity
                                        ? 'KGs'
                                        : ''}
                                    {matchedFareDetail?.includedCheckedBags
                                      ?.weight > 1
                                      ? 's'
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )),
                  )}
              </div>
            )),
          )}
      </div>
    </>
  );
};

export default BaggageTab;
