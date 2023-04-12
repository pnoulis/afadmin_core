import * as React from "react";
const ComboboxCtx = React.createContext(null);
const useComboboxCtx = () => {
  const ctx = React.useContext(ComboboxCtx);
  if (ctx == null) {
    throw new Error("Component is not being provided the <Combobox/> context");
  }
  return ctx;
};
export { useComboboxCtx, ComboboxCtx };
