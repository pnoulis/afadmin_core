import * as React from 'react';
const WristbandRegisterCtx = React.createContext(null);
const useWristbandRegisterCtx = () => {
  const ctx = React.useContext(WristbandRegisterCtx);
  if (ctx == null) {
    throw new Error('Component is not being provided the WristbandRegisterCtx');
  }
  return ctx;
};

const WristbandRegisterProvider = ({value, children}) => {
  return <WristbandRegisterCtx.Provider value={value}>{children}</WristbandRegisterCtx.Provider>;
};

export { useWristbandRegisterCtx, WristbandRegisterProvider };
