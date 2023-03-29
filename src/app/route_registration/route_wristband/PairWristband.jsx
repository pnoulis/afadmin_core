import * as React from "react";
import styled from "styled-components";

const StylePairWristband = styled.section``;

function PairWristband({ className, ...props }) {
  return (
    <StylePairWristband className={className} {...props}>
      pair wristband
    </StylePairWristband>
  );
}

export { PairWristband };
