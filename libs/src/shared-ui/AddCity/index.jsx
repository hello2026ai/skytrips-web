import React from 'react';

const AddCity = (props) => {
  const { onAddClick, handleRemoveMultiCity } = props;
  return (
    <div className="add-city-container d-flex flex-column justify-content-between h-100">
      <div className="add-city-container-close d-flex justify-content-end">
        <i className="fa-solid fa-xmark" onClick={handleRemoveMultiCity}></i>
      </div>
      <button className="btn btn-primary w-100" onClick={onAddClick}>
        Add another city
      </button>
    </div>
  );
};

export default AddCity;
