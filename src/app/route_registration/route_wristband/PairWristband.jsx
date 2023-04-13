import * as React from "react";
import styled from "styled-components";
import { useWristbandRegisterCtx } from "../Context.jsx";
import { Player2 as Player } from "./Player2.jsx";
import { ReactComponent as WristbandIcon } from "/assets/icons/wristband_image.svg";

const StylePairWristband = styled.section`
  width: 100%;
  height: 100%;
  max-width: 700px;
  display: flex;
  flex-flow: column nowrap;
  gap: 30px;
  overflow: scroll;
  max-height: 550px;
  padding-right: 20px;
  background-color: var(--grey-base);
  padding: 15px 15px;
  border-radius: var(--br-lg);
  // background: url("/assets/icons/wristband_image.svg");
  // background-repeat: no-repeat;
`;

const StyleWristbandIcon = styled.div`
  width: 500px;
  height: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(75%, -20%);

  .handBracelet .circle {
    fill: var(--success-light);
  }

  z-index: 1;
`;

function PairWristband({ className, ...props }) {
  const { players } = useWristbandRegisterCtx();
  return (
    <StylePairWristband>
      {players.map((p) => {
        return <Player key={p.username} player={p} />;
      })}
      <StyleWristbandIcon>
        <WristbandIcon />
      </StyleWristbandIcon>
    </StylePairWristband>
  );
}

export { PairWristband };
