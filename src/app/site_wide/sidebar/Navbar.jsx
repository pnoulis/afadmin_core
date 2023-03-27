import styled from "styled-components";
import { getRegistrationLink } from "/src/app/links.jsx";
import { NavLink } from "react-router-dom";

const StyleLayoutNavbar = styled.ul`
  all: unset;
  /* Type */
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  column-gap: 2px;
  /* Dimensions */
  /* Position */
  /* Fonts */
  /* Effects */
  list-style: none;
  /* Children */

  li {
    flex: 1;
  }
`;

const StyleNavbarLink = styled(NavLink)`
  all: unset;
  /* Type */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  /* Dimensions */
  width: 100%;
  aspect-ratio: 3 / 1;
  padding-left: 15%;
  overflow: hidden;
  /* Position */
  position: relative;
  /* Fonts */
  font-size: var(--tx-lg);
  font-weight: bolder;
  text-transform: capitalize;
  letter-spacing: 2px;
  word-spacing: 1px;
  white-space: nowrap;
  color: white;
  /* Effects */
  cursor: pointer;
  border-radius: var(--br-nl);

  &:hover {
    opacity: 0.6;
  }

  &:focus,
  &.active {
    background: var(--primary-base);
  }
  /* Children */
`;

function Navbar() {
  return (
    <StyleLayoutNavbar>
      <StyleNavbarLink to={getRegistrationLink().path}>
        {getRegistrationLink().label}
      </StyleNavbarLink>
    </StyleLayoutNavbar>
  );
}

export { Navbar };
