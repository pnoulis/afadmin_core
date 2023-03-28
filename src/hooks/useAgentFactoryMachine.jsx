import * as React from "react";
import { CONFIG } from "/configure.js";
import { getEvents } from "../app/afm_events/index.js";

function useAfm() {
  const [state, setState] = React.useState({});
  return CONFIG.afm;
}

const AfmContext = React.createContext({});
const useAfmContext = (...events) => {
  const context = React.useContext(AfmContext);
  if (context == null) {
    throw new Error("<AfmProvider/> missing");
  }
  return {
    afm: context,
    ...getEvents(context, ...events),
  };
};
const AfmProvider = ({ value, children }) => {
  return <AfmContext.Provider value={value}>{children}</AfmContext.Provider>;
};

export { useAfm, AfmProvider, useAfmContext };
