import * as React from "react";

function useAsyncData(getItems) {
  const conf = {
    fetchDelay: 1000,
  };
  const [state, setState] = React.useState(0);
  const statesRef = React.useRef({
    idle: 0,
    pending: 1,
    fetching: 2,
    success: 3,
    error: 4,
    loaded: 5,
  });
  const fetchRef = React.useRef([]);
  const intervalIdRef = React.useRef(null);
  const resRef = React.useRef(null);

  React.useEffect(() => {
    return () => clearInterval(intervalIdRef.current);
  }, []);

  const startFetching = (fetch) => {
    console.log("PLAN FETCH");
    fetchRef.current = {
      timeOfRequest: Date.now(),
      fetch,
    };

    if (state === statesRef.current.idle) {
      setState(statesRef.current.pending);
      intervalIdRef.current = setTimeout(() => {
        if (Date.now() - fetchRef.current.timeOfRequest > conf.fetchDelay) {
          console.log("should start fetching");
          console.log(`diff: ${Date.now() - fetchRef.current.timeOfRequest}`);
          setState(statesRef.current.fetching);
          getItems()
            .then((res) => {
              resRef.current = res;
              setState(statesRef.current.success);
            })
            .catch((err) => {
              setState(statesRef.current.error);
            });
        } else {
          console.log("should not start fetching");
          console.log(`diff: ${Date.now() - fetchRef.current.timeOfRequest}`);
        }
      }, conf.fetchDelay);
    }
  };

  return {
    state,
    states: statesRef.current,
    startFetching,
    res: resRef.current,
    setIdle: () => setState(statesRef.current.idle),
    setLoaded: () => setState(statesRef.current.loaded),
  };
}

export { useAsyncData };
