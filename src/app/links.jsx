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
      path: "/registration",
      label: "registration",
    };
  }

  return function RegistrationLink({ children, ...props }) {
    <NavLink to="/registration" {...props}>
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
      path: "/registration/wristband",
      label: "pair wristband",
    };
  }

  return function RegistrationWristbandLink({ children, ...props }) {
    <NavLink to="/registration/wristband" {...props}>
      {children}
    </NavLink>;
  };
}

function getRegistrationHistoryLink(asComponent = false) {
  if (!asComponent) {
    return {
      path: "/registration/history",
      label: "history",
    };
  }

  return function RegistrationHistoryLink({ children, ...props }) {
    <NavLink to="/registration/history" {...props}>
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
