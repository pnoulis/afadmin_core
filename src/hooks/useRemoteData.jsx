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
  parseRes,
  parseError,
  fetchDelay = 1000,
  successDelay = 1500,
  errorDelay = 1500,
}) {
  const [state, setState] = React.useState(0);
  const statesRef = React.useRef({
    idle: 0,
    pending: 1,
    success: 2,
    error: 3,
  });
  const intervalIdRef = React.useRef(null);
  const fetchRef = React.useRef(null);
  const stateRef = React.useRef(null);
  stateRef.current = state;
  parseRes ||= (res) => res;
  parseError ||= (err) => {
    throw err;
  };

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
            .then(parseRes)
            .then((res) => {
              if (
                !isFetchStale(timeOfRequest) &&
                stateRef.current > statesRef.current.idle
              ) {
                setState(statesRef.current.success);
                setTimeout(() => {
                  if (
                    !isFetchStale(timeOfRequest) &&
                    stateRef.current > statesRef.current.idle
                  ) {
                    setState(statesRef.current.idle);
                    resolve(res);
                  }
                }, successDelay);
              }
            })
            .catch(parseError)
            .catch((err) => {
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

function RemoteDataStates({ renderPending, renderSuccess, renderError }) {
  const context = useRemoteDataContext();
  switch (context.state) {
    case 1: // pending
      return <>{renderPending}</>;
    case 2: // success
      return <>{renderSuccess}</>;
    case 3: // error
      return <>{renderError}</>;
    default: // idle
      return <></>;
  }
}

export {
  RemoteDataProvider,
  useRemoteData,
  useRemoteDataContext,
  RemoteDataStates,
};
