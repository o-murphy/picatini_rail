import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Default settings
const defaultValues = {
  screenWidth: 720,
  screenHeight: 576,
  screenClick: 1.42,
  zeroDistanceM: 100,
  targetDistanceM: 2000,
  dropAtZeroMoa: 0,
  dropAtTargetMoa: 110,
  zeroY: 0,
  railAngle: 0,
};

// Type definitions
type ScreenSettings = typeof defaultValues;
type ScreenContextType = ScreenSettings & { 
  setValues: (values: Partial<ScreenSettings>) => void;
  px2moa: (value: number, height: number) => number;
  moa2px: (value: number, height: number) => number;
};

// Create Context with a default no-op function for setValues
const ScreenContext = createContext<ScreenContextType>({
  ...defaultValues,
  setValues: () => {}, // No-op function
  px2moa: (value: number, height: number) => value, // Placeholder function
  moa2px: (value: number, height: number) => value, // Placeholder function
});

// Provider Component
interface ScreenProviderProps {
  children: ReactNode;
}

export const ScreenProvider: React.FC<ScreenProviderProps> = ({ children }) => {
  const [state, setState] = useState<ScreenSettings>(defaultValues);
  
  // Function to update values
  const setValues = (values: Partial<ScreenSettings>) => {
    setState((prev) => ({ ...prev, ...values }));
  };

  const scale = (height: number) => state.screenHeight / height
  const px2moa = (value: number, height: number) => value * state.screenClick * 0.3 * scale(height)
  const moa2px = (value: number, height: number) => value / 0.3 / state.screenClick / scale(height)

  return (
    <ScreenContext.Provider value={{ 
      ...state, 
      setValues, 
      px2moa,
      moa2px,
    }}>
      {children}
    </ScreenContext.Provider>
  );
};

// Custom Hook for accessing context
export const useScreenSettings = () => useContext(ScreenContext);
