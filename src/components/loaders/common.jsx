import * as React from "react";
import styled from "styled-components";
import { ReactComponent as SuccessIcon } from "/assets/icons/success_icon_filled.svg";
import { ReactComponent as FailIcon } from "/assets/icons/warning_icon_filled.svg";
import { Svg } from "/src/components/svgs/index.js";

const StyleSuccessIcon = styled(Svg)`
  fill: var(--success-medium);
`;

const StyleFailIcon = styled(Svg)`
  fill: var(--error-base);
`;

function LoaderFailIcon({ className, ...props }) {
  return (
    <StyleFailIcon className={className} {...props}>
      <FailIcon />
    </StyleFailIcon>
  );
}

function LoaderSuccessIcon({ className, ...props }) {
  return (
    <StyleSuccessIcon className={className} {...props}>
      <SuccessIcon />
    </StyleSuccessIcon>
  );
}

export { LoaderFailIcon, LoaderSuccessIcon };
