import * as React from "react";
import styled from "styled-components";
import { useWristbandRegisterCtx } from '../Context.jsx';
import { Player2 as Player } from './Player2.jsx';

const StylePairWristband = styled.section`
width: 100%;
height: 100%;
max-width: 700px;
display: flex;
flex-flow: column nowrap;
gap: 30px;
overflow: scroll;
max-height: 700px;
padding-right: 20px;
background-color: var(--grey-base);
padding: 15px 15px;
  border-radius: var(--br-lg);
`;

function PairWristband({ className, ...props }) {
  const { players } = useWristbandRegisterCtx();
  console.log('CONTEXT');
  console.log(players);
  return (
    <StylePairWristband className={className} {...props}>
      {players.map((p) => {
        return <Player key={p.username} player={p}/>
      })}
    </StylePairWristband>
  );
}

export { PairWristband };
