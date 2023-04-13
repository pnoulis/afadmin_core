import * as React from "react";
import styled, { css } from "styled-components";
import { ReactComponent as Signal } from "/assets/icons/signal_1.svg";
import { SvgBall } from "/src/components/svgs";

const StylePlayer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const StyleInfo = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  font-family: Roboto-Regular;
  font-size: var(--tx-nl);
  color: var(--black-medium);
  letter-spacing: 1px;

  .key {
    font-size: var(--tx-sm);
    font-family: Roboto-Bold;
    margin-right: 5px;
    text-transform: capitalize;
  }

  .username .value {
    font-family: Roboto-Bold;
    color: var(--info-medium);
  }
`;

const StyleContainer = styled.div`
  flex: 1;
  max-width: 230px;
  background-color: var(--grey-subtle);
  border-radius: var(--br-lg);
  padding: 5px 15px;
`;

const StyleWristband = styled.div`
  flex: 1;
  max-width: 230px;
  background-color: var(--grey-subtle);
  border-radius: var(--br-lg);
  padding: 5px 15px;
  display: grid;
  grid-template-columns: auto 40px;
  grid-template-rows: 1fr;
  grid-template-areas: "info signal";
  align-items: center;

  .wristband-info {
    letter-spacing: 1px;
    font-family: Roboto-Regular;
    font-size: var(--tx-nl);
    color: var(--black-medium);
  }

  .wristband-info .key {
    font-size: var(--tx-sm);
    font-family: Roboto-Bold;
    margin-right: 5px;
    text-transform: capitalize;
    letter-spacing: 1px;
  }

  .wristband-info .status .value {
    font-family: Roboto-Bold;
    color: var(--info-medium);
    text-transform: capitalize;
  }
`;

function getPlayerStatus(player) {
  if (player.wristband?.active) {
    return "In game";
  }

  if (player.wristbandMerged) {
    return "Paired";
  }

  return "Registered";
}

function mapWristbandColorCode(wristbandColorCode) {
  if (!wristbandColorCode) return;
  switch (wristbandColorCode) {
    case 0:
      return "black";
    case 1:
      return "red";
    case 2:
      return "purple";
    case 3:
      return "green";
    case 4:
      return "yellow";
    case 5:
      return "blue";
    case 6:
      return "orange";
    default:
      throw new Error(`Unknown wristband color code:${wristbandColorCode}`);
  }
}

const StyleWristbandSignal = styled(SvgBall)`
  background-color: ${({ wristbandColorCode }) => {
    if (!wristbandColorCode) {
      return "var(--grey-light)";
    }

    return mapWristbandColorCode(wristbandColorCode);
  }};
`;

function Player({ player }) {
  return (
    <StylePlayer>
      <StyleInfo>
        <p className="username">
          <span className="key">username:</span>
          <span className="value">{player.username}</span>
        </p>
        <p>
          <span className="key">name:</span>
          <span className="value">{player.name}</span>
        </p>
        <p>
          <span className="key">surname:</span>
          <span className="value">{player.surname}</span>
        </p>
        <p>
          <span className="key">email:</span>
          <span className="value">{player.email}</span>
        </p>
      </StyleInfo>
      <StyleWristband>
        <div className="wristband-info">
          <p className="status">
            <span className="key">status:</span>
            <span className="value">{getPlayerStatus(player)}</span>
          </p>
          <p className="number">
            <span className="key">rfid:</span>
            <span className="value">{player.wristband?.wristbandNumber}</span>
          </p>
          <p className="color">
            <span className="key">color:</span>
            <span className="value">
              {mapWristbandColorCode(player.wristband?.wristbandColor)}
            </span>
          </p>
        </div>
        <div className="wristband-signal">
          <StyleWristbandSignal
            className={"wristband"}
            wristbandColorCode={player.wristband?.wristbandColor}
          >
            <Signal />
          </StyleWristbandSignal>
        </div>
      </StyleWristband>
      <div className={"status"}></div>
    </StylePlayer>
  );
}

export { Player };
