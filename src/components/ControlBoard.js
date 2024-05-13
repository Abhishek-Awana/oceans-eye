


import React, { useState } from 'react';
import './ControlBoard.css';

const ControlBoard = ({
  
  localTime,
  timezone,
  showLocalTime,
  handleShowLocalTimeChange,
  showDayNightEffect,
  handleShowDayNightEffectChange,
  selectedStyle,
  handleStyleChange,
}) => {
  return (

    
    <div className="control-board">
      <div className="control-board__header">Control Board</div>
      <div className='controlboard_second'>
        
      <div className="control-board__section">
        <label className="control-board__label">
          <input
            type="checkbox"
            checked={showLocalTime}
            onChange={handleShowLocalTimeChange}
            className="control-board__checkbox"
          />
          Show Local Time
        </label>
        {showLocalTime && (
          <div className="control-board__local-time">
            <span>Current Local Time: {localTime}</span>
            <span>Timezone: {timezone}</span>
          </div>
        )}
      </div>
      <div className="control-board__section">
  <div className="control-board__radio-group">
    <input
      id="satellite-streets-v12"
      type="checkbox"
      value="satellite-streets-v12"
      checked={selectedStyle === 'mapbox://styles/mapbox/satellite-streets-v12'}
      onChange={handleStyleChange}
      className="control-board__radio"
    />
    <label htmlFor="satellite-streets-v12" className="control-board__label">
      satellite streets
    </label>
  </div>
  <div className="control-board__radio-group">
    <input
      id="light-v11"
      type="checkbox"
      value="light-v11"
      checked={selectedStyle === 'mapbox://styles/mapbox/light-v11'}
      onChange={handleStyleChange}
      className="control-board__radio"
    />
    <label htmlFor="light-v11" className="control-board__label">
      light
    </label>
  </div>
  <div className="control-board__radio-group">
    <input
      id="dark-v11"
      type="checkbox"
      value="dark-v11"
      checked={selectedStyle === 'mapbox://styles/mapbox/dark-v11'}
      onChange={handleStyleChange}
      className="control-board__radio"
    />
    <label htmlFor="dark-v11" className="control-board__label">
      dark
    </label>
  </div>
  <div className="control-board__radio-group">
    <input
      id="streets-v12"
      type="checkbox"
      value="streets-v12"
      checked={selectedStyle === 'mapbox://styles/mapbox/streets-v12'}
      onChange={handleStyleChange}
      className="control-board__radio"
    />
    <label htmlFor="streets-v12" className="control-board__label">
      streets
    </label>
  </div>
  <div className="control-board__radio-group">
    <input
      id="outdoors-v12"
      type="checkbox"
      value="outdoors-v12"
      checked={selectedStyle === 'mapbox://styles/mapbox/outdoors-v12'}
      onChange={handleStyleChange}
      className="control-board__radio"
    />
    <label htmlFor="outdoors-v12" className="control-board__label">
      outdoors
    </label>
  </div>
</div>
      {/* <div className

      </div> */}
      <div className='day-night-card control-board__section'>
         <label>
          <input
            type="checkbox"
            checked={showDayNightEffect}
            onChange={handleShowDayNightEffectChange}
           />
            Show Day/Night Effect
         </label>
      </div>
        
      </div> 

    </div>
  );
};

export default ControlBoard;
