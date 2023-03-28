import { NavLink } from "react-router-dom";

function getHomeLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/",
      label: "home",
    };
  }

  return function HomeLink({ children, ...props }) {
    return (
      <NavLink to="/" {...props}>
        {children}
      </NavLink>
    );
  };
}

function getRegistrationLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/registration/player",
      label: "registration",
    };
  }

  return function RegistrationLink({ children, ...props }) {
    <NavLink to="/registration/player" {...props}>
      {children}
    </NavLink>;
  };
}

function getRegistrationPlayerLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/registration/player",
      label: "register user",
    };
  }

  return function RegistrationPlayerLink({ children, ...props }) {
    <NavLink to="/registration/player" {...props}>
      {children}
    </NavLink>;
  };
}

function getRegistrationWristbandLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/registration/player/wristband",
      label: "pair wristband",
    };
  }

  return function RegistrationWristbandLink({ children, ...props }) {
    <NavLink to="/registration/player/wristband" {...props}>
      {children}
    </NavLink>;
  };
}

function getRegistrationHistoryLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/registration/player/history",
      label: "players",
    };
  }

  return function RegistrationHistoryLink({ children, ...props }) {
    <NavLink to="/registration/player/history" {...props}>
      {children}
    </NavLink>;
  };
}

export {
  getHomeLink,
  getRegistrationLink,
  getRegistrationPlayerLink,
  getRegistrationWristbandLink,
  getRegistrationHistoryLink,
};
