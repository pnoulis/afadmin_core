import * as React from "react";
import styled from "styled-components";
import { SearchPlayer } from "./SearchPlayer.jsx";
import { PairWristband } from "./PairWristband.jsx";

const StyleRouteWristband = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 50px;
  padding: 0 25px;
  display: grid;
  grid-template-columns: 40% 60%;
  grid-template-rows: auto;
  grid-template-areas: "search_player pair_wristband";
  justify-items: end;
  align-items: start;
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
