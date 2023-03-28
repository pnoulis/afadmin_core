import * as React from "react";
import styled from "styled-components";
import { Svg } from "/src/components/svgs/index.js";

const StyleIconButton = styled("button")`
  // defaults
  all: unset;
  display: flex;
  box-sizing: border-box;

  // content
  flex-flow: column nowrap;
  font-family: NoirPro-Regular;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4em;
  text-transform: uppercase;
  font-size: var(--tx-sm);
  text-align: center;
  background-color: var(--primary-base);
  padding: 8px;
  width: 60px;
  height: 60px;
  border-radius: var(--br-md);

  // appearance
  cursor: pointer;

  &:hover {
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const StyleIconButtonIcon = styled(Svg)`
  display: block;
  fill: white;
`;

const StyleIconButtonText = styled.p`
  color: white;
`;

function IconButton({ className, children, ...props }) {
  return (
    <StyleIconButton className={className} {...props}>
      {children}
    </StyleIconButton>
  );
}

function IconButtonIcon({ className, children, ...props }) {
  return (
    <StyleIconButtonIcon className={className} {...props}>
      {children}
    </StyleIconButtonIcon>
  );
}
function IconButtonText({ className, children, ...props }) {
  return (
    <StyleIconButtonText className={className} {...props}>
      {children}
    </StyleIconButtonText>
  );
}

export { IconButton, IconButtonIcon, IconButtonText };
