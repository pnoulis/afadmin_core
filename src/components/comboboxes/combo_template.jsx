import * as React from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  useListNavigation,
  useDismiss,
  useInteractions,
  useRole,
  useFocus,
  useId,
  useTypeahead,
  useClick,
  autoUpdate,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";

// useCombobox
// ComboboxContext
// useComboboxContext

const ComboboxContext = React.createContext(null);
const useComboboxContext = () => {
  const ctx = React.useContext(ComboboxContext);
  if (ctx == null) {
    throw new Error("Combobox descendants must be wrapped in <Combobox/>");
  }
  return ctx;
};

function useCombobox(name, options, onSelect) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const idsRef = React.useRef(null);
  const listRef = React.useRef([]);

  if (idsRef.current === null) {
    idsRef.current = {
      trigger: `${name}-trigger`,
      list: `${name}-list`,
    };
  }

  const data = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });

  const interactions = useInteractions([
    useListNavigation(data.context, {
      listRef,
      activeIndex,
      selectedIndex,
      onNavigate: setActiveIndex,
      virtual: true,
    }),
  ]);

  return {
    isOpen: true,
    name: name,
    options,
    ids: idsRef.current,
    activeIndex,
    selectedIndex,
    listRef,
    ...data,
    ...interactions,
  };
}

function Combobox({ name, options, onSelect, children, ...props }) {
  const state = useCombobox(name, options, onSelect);
  return (
    <ComboboxContext.Provider value={state}>
      {children}
    </ComboboxContext.Provider>
  );
}

function ComboboxTrigger({ label, placeholder, className, ...props }) {
  const ctx = useComboboxContext();
  return (
    <input
      id={ctx.ids.trigger}
      className={`combobox trigger ${className || ""}`}
      ref={ctx.refs.setReference}
      name={ctx.name}
      type="text"
      role="combobox"
      aria-controls={ctx.ids.list}
      tabIndex={0}
      placeholder={placeholder}
      autoComplete="off"
      {...ctx.getReferenceProps({ ...props })}
    />
  );
}

function ComboboxList({ renderItem, className, ...props }) {
  const ctx = useComboboxContext();
  return (
    <>
      {ctx.isOpen && (
        <ul
          id={ctx.ids.list}
          className={`combobox list ${className || ""}`}
          ref={ctx.refs.setFloating}
          role="listbox"
          aria-label={ctx.name}
          {...ctx.getFloatingProps({ ...props })}
        >
          {ctx.options.map((option, i) =>
            renderItem({
              ...ctx.getItemProps({
                key: option,
                ref: (node) => (ctx.listRef.current[i] = node),
                active: ctx.activeIndex === i,
                selected: ctx.activeIndex === i,
              }),
              option,
              ctx,
              i,
            })
          )}
        </ul>
      )}
    </>
  );
}

const ComboboxOption = React.forwardRef(
  (
    { active, selected, option, ctx, i, className, children, ...props },
    ref
  ) => {
    return (
      <li
        id={`${ctx.name}-opt-${i}`}
        className={`combobox option ${className || ""}`}
        ref={ref}
        role="option"
        aria-selected={selected}
        {...props}
      >
        {children || option}
      </li>
    );
  }
);

export { Combobox, ComboboxTrigger, ComboboxList, ComboboxOption };
