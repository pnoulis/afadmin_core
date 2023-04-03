import * as React from "react";

const RemoteDataContext = React.createContext(null);
const useRemoteDataContext = () => {
  const context = React.useContext(RemoteDataContext);
  if (context == null) {
    throw new Error("Component requires <RemoteContextProvider/>");
  }
  return context;
};
const RemoteDataProvider = ({ value, children }) => {
  return (
    <RemoteDataContext.Provider value={value}>
      {children}
    </RemoteDataContext.Provider>
  );
};

function useRemoteData({
  getRemoteData = () => {},
  fetchDelay = 3000,
  successDelay = 3000,
  errorDelay = 3000,
}) {
  const [state, setState] = React.useState(0);
  const statesRef = React.useRef({
    idle: 0,
    pending: 1,
    fetching: 2,
    success: 3,
    error: 4,
  });
  const intervalIdRef = React.useRef(null);
  const fetchRef = React.useRef(null);
  const stateRef = React.useRef(null);
  stateRef.current = state;

  const isFetchStale = (timeOfRequest) =>
    timeOfRequest !== fetchRef.current.timeOfRequest;

  const shouldStartFetch = () =>
    Date.now() - fetchRef.current.timeOfRequest > fetchDelay;

  const startFetching = (...args) => {
    return new Promise((resolve, reject) => {
      setState(statesRef.current.pending);
      const timeOfRequest = Date.now();
      fetchRef.current = {
        fired: false,
        timeOfRequest,
        fetch: () =>
          getRemoteData(...args)
            .then((res) => {
              console.log("res arrived");
              console.log(`state: ${stateRef.current} and ${state}`);
              if (
                !isFetchStale(timeOfRequest) &&
                stateRef.current > statesRef.current.idle
              ) {
                setState(statesRef.current.success);
                console.log("setting success state");
                setTimeout(() => {
                  if (
                    !isFetchStale(timeOfRequest) &&
                    stateRef.current > statesRef.current.idle
                  ) {
                    setState(statesRef.current.idle);
                    resolve(args);
                  }
                }, successDelay);
              }
            })
            .catch((err) => {
              console.log(err);
              if (
                !isFetchStale(timeOfRequest) &&
                stateRef.current > statesRef.current.idle
              ) {
                setState(statesRef.current.error);
                setTimeout(() => {
                  if (
                    !isFetchStale(timeOfRequest) &&
                    stateRef.current > statesRef.current.idle
                  ) {
                    setState(statesRef.current.idle);
                    reject(err);
                  }
                }, errorDelay);
              }
            }),
      };
    });
  };

  React.useEffect(() => {
    console.log(`STATE IS: ${Object.keys(statesRef.current)[state]}`);
    if (state === statesRef.current.idle && intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    } else if (
      state === statesRef.current.pending &&
      intervalIdRef.current === null
    ) {
      intervalIdRef.current = setInterval(() => {
        if (!fetchRef.current.fired && shouldStartFetch()) {
          fetchRef.current.fetch();
          fetchRef.current.fired = true;
        }
      }, fetchDelay);
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [state, setState]);

  return {
    state,
    setState,
    states: statesRef.current,
    startFetching,
  };
}
