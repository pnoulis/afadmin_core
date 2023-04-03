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
import Fuse from "fuse.js";

/*
  FULLFILLS REQUIREMENTS:

  TAB
  [yes] -> if DOM Focus is placed on the combobox, expand the popup.
  [yes] -> if DOM focus is placed on another element, collapse the popup.

  CLICK
  [yes] -> if click on the textbox, expand the popup
  [yes] -> if click outside the textbox, collapse the popup

  DOWN arrow
  [ ] -> If DOM focus is on the combobox and the textbox is not empty and the
         listbox is displayed moves visual focus to the first suggested value.
  [yes] -> If DOM focus is on the combobox if the textbox is empty and the listbox
         is not displayed, opens the listbox and moves visual focus
         to the first option
  [yes] -> In both previous cases DOM focus remains on the textbox
  [yes] -> If VISUAL focus is on an option, move visual focus to the next option.
  [yes] -> If VISUAL focus is on the last option, moves visual focus to the first
         option.

  UP arrow
  [no] -> If DOM focus is on the combobox and the textbox is not empty
         and the listbox is displayed, moves VISUAL focus to the last suggested value
  [yes] -> If DOM focus is on the combobox and the textbox is empty, first opens
         the listbox if it is not already displayed and then moves VISUAL focus
         to the last option.
  [yes] -> In both cases DOM focus remains on the textbox.
  [yes] -> If VISUAL focus is on an option, move visual focus to the previous option.
  [yes] -> If VISUAL focus is on the first option, move visual focus to the last option.

  ESCAPE
  [no] -> collapses the listbox, DOM focus remains on the textbox
  [no] -> if the listbox is not displayed, clears the textbox


 */
const ComboboxContext = React.createContext(null);
const useComboboxContext = () => {
  const ctx = React.useContext(ComboboxContext);
  if (ctx == null) {
    throw new Error("Combobox descendants must be wrapped in <Combobox/>");
  }
  return ctx;
};

function useCombobox({
  name,
  options: initialOptions,
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSelect,
} = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setIsOpen = setControlledOpen ?? setUncontrolledOpen;
  const [activeIndex, setActiveIndex] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const idsRef = React.useRef(null);
  const listRef = React.useRef([]);
  const options = React.useRef([]);
  const Search = React.useRef(null);

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
      onNavigate: setActiveIndex,
      virtual: true,
      loop: true,
    }),
    useDismiss(data.context),
    useClick(data.context, { keyboardHandlers: true }),
  ]);

  const onInputValueChange = (e) => {
    let value;
    if (e.target) {
      value = e.target.value;
      setIsOpen(true);
    } else {
      value = e;
    }
    setInputValue(value);

    if (!value) {
      options.current = initialOptions;
    } else {
      options.current = Search.current.search(value).map((match) => match.item);
    }

    if (options.current.length > 0) {
      setActiveIndex(0);
    }
  };

  React.useEffect(() => {
    Search.current = new Fuse(initialOptions, {
      threshold: 0.1,
    });
    options.current = initialOptions;
    data.refs.domReference.current?.focus();
    setActiveIndex(0);
  }, [initialOptions]);

  return {
    isOpen,
    setIsOpen,
    name: name,
    inputValue,
    setInputValue,
    onInputValueChange,
    activeIndex,
    setActiveIndex,
    ids: idsRef.current,
    listRef,
    options: options.current,
    ...data,
    ...interactions,
  };
}

/*
  where config:
  name,
  options,
  initialOpen = false,
  open,
  onOpenChange,
  onSelect
 */
function Combobox({ children, ...config }) {
  const state = useCombobox(config);
  return (
    <ComboboxContext.Provider key={config.options} value={state}>
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
      value={ctx.inputValue}
      onChange={ctx.onInputValueChange}
      autoComplete="off"
      {...ctx.getReferenceProps({
        onKeyDown: (e) => {
          if (
            e.key === "Enter" &&
            ctx.activeIndex != null &&
            ctx.options[ctx.activeIndex]
          ) {
            ctx.onInputValueChange(ctx.options[ctx.activeIndex]);
            ctx.setActiveIndex(null);
            ctx.setIsOpen(false);
          } else if (e.key === "Escape") {
            if (!ctx.isOpen) {
              ctx.onInputValueChange("");
              ctx.setActiveIndex(null);
              ctx.refs.domReference.current?.blur();
            }
          } else if (e.key === "Tab") {
            if (ctx.isOpen) {
              ctx.setIsOpen(false);
              ctx.onInputValueChange("");
              ctx.setActiveIndex(null);
              ctx.refs.domReference.current?.blur();
            }
          }
        },
        ...props,
      })}
    />
  );
}

function ComboboxList({ renderItem, className, ...props }) {
  const ctx = useComboboxContext();
  return (
    <>
      {ctx.isOpen && ctx.options.length >= 1 && (
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
                id: `${ctx.name}-opt-${i}`,
                ref: (node) => (ctx.listRef.current[i] = node),
                active: ctx.activeIndex === i,
                selected: ctx.activeIndex === i,
                className: "combobox option",
                role: "option",
                tabIndex: -1,
                onClick: (e) => {
                  e.preventDefault();
                  ctx.onInputValueChange(option);
                  ctx.setIsOpen(false);
                  ctx.refs.domReference.current?.focus();
                },
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
      <li className={className} ref={ref} aria-selected={selected} {...props}>
        {children || option}
      </li>
    );
  }
);

export { Combobox, ComboboxTrigger, ComboboxList, ComboboxOption };
