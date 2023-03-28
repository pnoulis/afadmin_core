import * as React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { Svg } from "/src/components/svgs/index.js";

const StylePanelNavbar = styled.nav`
  all: unset;
  box-sizing: border-box;
  display: block;
  width: max-content;
  height: 100%;
  padding: 3px 0;

  .navbar-list {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 10px;
    width: max-content;
    height: 100%;
    list-style: none;
  }

  .navbar-list-item {
    width: 100%;
    height: 100%;
  }
`;

const StylePanelNavbarLink = styled(NavLink)`
  all: unset;
  /* Type */
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.4em;
  /* Dimensions */
  width: 100%;
  height: 100%;
  padding: 0.7em;
  /* Position */
  position: relative;
  overflow: hidden;
  /* Fonts */
  /* Effects */
  color: black;
  cursor: pointer;
  border-radius: var(--br-lg);
  background-color: var(--grey-base);
  transition: transform 0.5s, background-color 0.5s;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    background-color: var(--primary-light);
    color: white;

    & svg {
      fill: white;
    }
  }

  /* Children */
`;

const StylePanelNavbarLinkText = styled.p`
  all: unset;
  box-sizing: border-box;
  text-align: center;
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-family: NoirPro-Medium;
  letter-spacing: 0.5px;
  word-spacing: 1px;
  white-space: wrap;
`;

const StylePanelNavbarLinkIcon = styled.div`
  all: unset;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  fill: white;

  & svg {
    fill: black;
    width: ${({ size }) => size || "44px"};
    height: ${({ size }) => size || "44px"};
  }
`;

function PanelNavbar({ items }) {
  return (
    <StylePanelNavbar>
      <ul className="navbar-list">
        {items.map((item) => (
          <li className="navbar-list-item" key={item.path}>
            <StylePanelNavbarLink to={item.path} end>
              <StylePanelNavbarLinkIcon>
                <Svg>{item.Icon}</Svg>
              </StylePanelNavbarLinkIcon>
              <StylePanelNavbarLinkText>{item.label}</StylePanelNavbarLinkText>
            </StylePanelNavbarLink>
          </li>
        ))}
      </ul>
    </StylePanelNavbar>
  );
}

export { PanelNavbar };
