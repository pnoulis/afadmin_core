import styled from "styled-components";

const StyleLayoutFlashMessage = styled.div`
  pointer-events: none;
  padding: 10px 20px;
  min-width: 400px;
  max-width: 600px;
  width: max-content;
  margin: auto;
  border-radius: var(--br-nl);
  font-size: var(--tx-md);
  letter-spacing: 1px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: white;
  gap: 20px;
  box-shadow: var(--sd-8);

  background-color: ${({ variant }) => {
    switch (variant) {
      case "info":
        return "var(--info-strong)";
      case "success":
        return "var(--success-medium)";
      case "warning":
        return "var(--warn-strong)";
      case "error":
        return "var(--error-base)";
      default:
        return "black";
    }
  }};
`;

const StyleLayoutFmItemIcon = styled.section`
  flex: 0 0 50px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyleLayoutFmItemMessage = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export {
  StyleLayoutFlashMessage,
  StyleLayoutFmItemIcon,
  StyleLayoutFmItemMessage,
};
