/*
  --------------------- Editable Combobox With List Autocomplete --------------------

  https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/

 */
import * as React from "react";
import {
  useFloating,
  flip,
  shift,
  size,
  useListNavigation,
  useDismiss,
  useInteractions,
  useClick,
  autoUpdate,
} from "@floating-ui/react";
import { ComboboxCtx, useComboboxCtx } from "./Context.jsx";
import Fuse from "fuse.js";

const Provider = ({ children, ...usrConf }) => {
  const ctx = useCombobox(usrConf);
  return <ComboboxCtx.Provider value={ctx}>{children}</ComboboxCtx.Provider>;
};

function useCombobox({
  name,
  labelledBy = "",
  options: initialOptions,
  onSelect = () => {},
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
} = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [activeIndex, setActiveIndex] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setIsOpen = setControlledOpen ?? setUncontrolledOpen;
  const optionsRef = React.useRef(initialOptions || []);
  const listRef = React.useRef([]);

  const fuse = React.useMemo(
    () =>
      new Fuse(initialOptions, {
        threshold: 0.1,
      }),
    [initialOptions]
  );
  const filter = (term) => fuse.search(term).map((match) => match.item);

  const data = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      flip(),
      shift(),
      size({
        apply({ rects, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    ],
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
      setActiveIndex(null);
    } else {
      value = e;
    }
    setInputValue(value);

    if (!value) {
      optionsRef.current = initialOptions;
    } else {
      optionsRef.current = filter(value);
    }
  };

  return React.useMemo(
    () => ({
      name,
      labelledBy,
      isOpen,
      setIsOpen,
      inputValue,
      onSelect,
      setInputValue,
      onInputValueChange,
      activeIndex,
      setActiveIndex,
      options: optionsRef.current,
      listRef,
      ...data,
      ...interactions,
    }),
    [isOpen, setIsOpen, inputValue, setInputValue, interactions, data]
  );
}

function Trigger({ placeholder, className, ...props }) {
  const ctx = useComboboxCtx();
  return (
    <input
      id={`${ctx.name}-trigger`}
      ref={ctx.refs.setReference}
      className={`combobox trigger ${className}`}
      role="combobox"
      aria-controls={`${ctx.name}-listbox`}
      aria-expanded={ctx.isOpen}
      aria-haspopup="listbox"
      aria-labelledby={ctx.labelledBy}
      aria-autocomplete="list"
      tabIndex={0}
      name={ctx.name}
      type="text"
      placeholder={placeholder}
      value={ctx.inputValue}
      onChange={ctx.onInputValueChange}
      {...ctx.getReferenceProps({
        onKeyDown: (e) => {
          switch (e.code) {
            case "Enter":
              if (ctx.activeIndex != null && ctx.options[ctx.activeIndex]) {
                ctx.onInputValueChange(ctx.options[ctx.activeIndex]);
                ctx.setActiveIndex(null);
                ctx.setIsOpen(false);
                ctx.onSelect(ctx.options[ctx.activeIndex]);
              } else {
                ctx.setActiveIndex(null);
                ctx.setIsOpen(false);
                ctx.onSelect(ctx.inputValue);
              }
              break;
            case "Escape":
              if (!ctx.isOpen) {
                ctx.onInputValueChange("");
                ctx.setActiveIndex(null);
                ctx.refs.domReference.current?.blur();
                ctx.onSelect("");
              }
              break;
            case "Tab":
              if (!ctx.isOpen) {
                return;
              }
              if (ctx.activeIndex != null && ctx.options[ctx.activeIndex]) {
                ctx.onInputValueChange(ctx.options[ctx.activeIndex]);
                ctx.setActiveIndex(null);
                ctx.setIsOpen(false);
                ctx.refs.domReference.current?.blur();
                ctx.onSelect(ctx.options[ctx.activeIndex]);
              } else {
                ctx.setActiveIndex(null);
                ctx.setIsOpen(false);
                ctx.refs.domReference.current?.blur();
                ctx.onSelect(ctx.inputValue);
              }
            default:
              break;
          }
        },
        ...props,
      })}
    />
  );
}

function Listbox({ renderOption, className, ...props }) {
  const ctx = useComboboxCtx();
  return (
    <>
      {ctx.isOpen && (
        <ul
          id={`${ctx.name}-listbox`}
          ref={ctx.refs.setFloating}
          className={`combobox listbox ${className}`}
          role="listbox"
          aria-labelledby={ctx.labelledBy}
          style={{
            position: ctx.strategy,
            top: ctx.y ?? 0,
            left: ctx.x ?? 0,
          }}
          {...ctx.getFloatingProps(props)}
        >
          {ctx.options.map((opt, i) =>
            renderOption({
              id: `${ctx.name}-opt-${i}`,
              key: opt,
              label: opt,
              i,
              ctx,
              ref: (node) => (ctx.listRef.current[i] = node),
              selected: opt === ctx.inputValue,
              active: ctx.activeIndex === i,
              role: "option",
              tabIndex: -1,
              onClick: (e) => {
                e.preventDefault();
                ctx.onInputValueChange(opt);
                ctx.setIsOpen(false);
                ctx.refs.domReference.current?.focus();
                ctx.onSelect(opt);
              },
            })
          )}
        </ul>
      )}
    </>
  );
}

const Option = React.forwardRef(
  ({ active, selected, label, ctx, className, children, ...props }, ref) => {
    return (
      <li
        className={`combobox option ${className}`}
        aria-selected={selected}
        {...ctx.getItemProps({
          ref,
          ...props,
        })}
      >
        {children || label}
      </li>
    );
  }
);

export const EditableListCombobox = {
  Provider,
  Trigger,
  Listbox,
  Option,
};
