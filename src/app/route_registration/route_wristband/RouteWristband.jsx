import * as React from "react";
import styled from "styled-components";
import { SearchPlayer } from "./SearchPlayer.jsx";
import { PairWristband } from "./PairWristband.jsx";

const StyleRouteWristband = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 50%);
  grid-template-rows: 1fr;
  grid-template-areas: "search_player pair_wristband";
  justify-items: center;
  align-items: center;
`;

const StyleSearchPlayer = styled(SearchPlayer)`
  grid-area: search_player;
`;

const StylePairWristband = styled(PairWristband)`
  grid-area: pair_wristband;
`;

function RouteWristband() {
  return (
    <StyleRouteWristband>
      <StyleSearchPlayer />
      <StylePairWristband />
    </StyleRouteWristband>
  );
}

export { RouteWristband };
