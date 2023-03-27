import { getHomeLink } from "/src/app/links.jsx";
import { ReactComponent as Logo } from "/assets/logo/maze_logo.svg";
import { Svg } from "/src/components/svgs/index.js";
import styled from "styled-components";

const StyleSidebarHeaderLink = styled(getHomeLink(true))`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &:hover {
    opacity: 0.6;
  }
`;

function Header() {
  return (
    <StyleSidebarHeaderLink>
      <Svg size="70%" alt="site-logo">
        <Logo />
      </Svg>
    </StyleSidebarHeaderLink>
  );
}

export { Header };
