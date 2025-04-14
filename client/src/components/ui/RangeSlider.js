// client/src/components/ui/RangeSlider.js
import React, { useState, useEffect, useRef } from 'react';

const RangeSlider = ({ min, max, values, onChange }) => {
  const [range, setRange] = useState(values || [min, max]);
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);
  
  // Update range when values prop changes
  useEffect(() => {
    if (values && (values[0] !== range[0] || values[1] !== range[1])) {
      setRange(values);
    }
  }, [values]);
  
  // Calculate percentage position for a value
  const calculatePosition = (value) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  // Handle slider click
  const handleSliderClick = (e) => {
    if (isDragging !== null) return;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - sliderRect.left;
    const clickPercent = (clickPosition / sliderRect.width) * 100;
    const clickValue = Math.round(min + (clickPercent / 100) * (max - min));
    
    // Determine which handle to move based on which one is closer
    const distToMin = Math.abs(clickValue - range[0]);
    const distToMax = Math.abs(clickValue - range[1]);
    
    if (distToMin <= distToMax) {
      setRange([clickValue, range[1]]);
      onChange([clickValue, range[1]]);
    } else {
      setRange([range[0], clickValue]);
      onChange([range[0], clickValue]);
    }
  };
  
  // Handle mouse down on a handle
  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setIsDragging(index);
  };
  
  // Handle mouse move
  const handleMouseMove = (e) => {
    if (isDragging === null) return;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const movePosition = e.clientX - sliderRect.left;
    const movePercent = (movePosition / sliderRect.width) * 100;
    let moveValue = Math.round(min + (movePercent / 100) * (max - min));
    
    // Constrain value within range
    moveValue = Math.max(min, Math.min(max, moveValue));
    
    // Update the appropriate handle
    if (isDragging === 0) {
      // Ensure left handle doesn't go beyond right handle
      moveValue = Math.min(moveValue, range[1]);
      setRange([moveValue, range[1]]);
      onChange([moveValue, range[1]]);
    } else {
      // Ensure right handle doesn't go beyond left handle
      moveValue = Math.max(moveValue, range[0]);
      setRange([range[0], moveValue]);
      onChange([range[0], moveValue]);
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(null);
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div className="relative h-6 mt-2">
      <div 
        ref={sliderRef}
        className="absolute h-2 w-full bg-gray-200 rounded-full cursor-pointer"
        onClick={handleSliderClick}
      >
        <div 
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${calculatePosition(range[0])}%`,
            width: `${calculatePosition(range[1]) - calculatePosition(range[0])}%`
          }}
        ></div>
        
        <div 
          className="absolute w-4 h-4 -mt-1 -ml-2 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${calculatePosition(range[0])}%` }}
          onMouseDown={handleMouseDown(0)}
        ></div>
        
        <div 
          className="absolute w-4 h-4 -mt-1 -ml-2 bg-white border-2 border-blue-500 rounded-full cursor-grab"
          style={{ left: `${calculatePosition(range[1])}%` }}
          onMouseDown={handleMouseDown(1)}
        ></div>
      </div>
    </div>
  );
};

export default RangeSlider;