import * as React from "react";
import { PlayersTable } from "./PlayersTable.jsx";
import styled from "styled-components";
import { BACKEND_PLAYERS } from "../../../../config/data/backend_players.js";
import { useAfmContext } from "/src/hooks/index.js";

const StyleRouteHistory = styled.div`
  width: 100%;
  height: 100%;
  max-width: 80%;
  margin: 10px auto 0 auto;

  .history-title {
    font-size: 1.8em;
    font-family: NoirPro-Regular;
    text-transform: capitalize;
    letter-spacing: 2px;
    margin-bottom: 50px;
    text-align: end;
  }
`;

function RouteHistory() {
  const { listPlayers } = useAfmContext("listPlayers");
  const [players, setPlayers] = React.useState([]);

  React.useEffect(() => {
    listPlayers().then((players) => setPlayers(players));
  }, []);

  return (
    <StyleRouteHistory>
      <h1 className="history-title">Registered players history</h1>
      <PlayersTable rows={players} />
    </StyleRouteHistory>
  );
}

export { RouteHistory };
