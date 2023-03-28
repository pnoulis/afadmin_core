import * as React from "react";
import { RegisterPlayerForm } from "./RegisterPlayerForm.jsx";
import styled from "styled-components";

const StyleRoutePlayer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyleRegisterPlayerForm = styled(RegisterPlayerForm)`
  unset: all;
  display: flex;
  flex-flow: column nowrap;
  box-sizing: border-box;
  width: 350px;
  align-items: center;
  gap: 20px;

  & > legend {
    display: none;
  }

  & button {
    margin-top: 30px;
  }
`;

function RoutePlayer() {
  return (
    <StyleRoutePlayer>
      <StyleRegisterPlayerForm />
    </StyleRoutePlayer>
  );
}

export { RoutePlayer };
