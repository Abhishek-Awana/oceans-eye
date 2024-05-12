import React, { useState } from 'react';
import shipComponent from './shipComponent';

const ControlBoard = ({ localTime, timezone }) => {
  const [showLocalTime, setShowLocalTime] = useState(false);

  const handleShowShipNavigation = () => {
    // Call the showShipNavigation function from the shipComponent
  };

  const handleShowLocalTime = () => {
    setShowLocalTime(true);
  };

  return (
    <>
      <div>ControlBoard</div>
      <shipComponent />
      {/* <button onClick={handleShowShipNavigation}>Show Ship Navigation</button> */}
      <button onClick={handleShowLocalTime}>Show Local Time</button>
      {/* {showLocalTime && ( */}
        <div>
          Current Local Time: {localTime}
          <br />
          Timezone: {timezone}
        </div>
      {/* )} */}
    </>
  );
};

export default ControlBoard;