/*
  ------------------ Async Combobox by List Autocomplete --------------

  https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/

  This Combobox is an extension to the combobox-autocomplete-list combobox. It restricts
  the user from selecting a value that is not a member of the options.

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
  const ctx = useAsyncCombobox(usrConf);
  return <ComboboxCtx.Provider value={ctx}>{children}</ComboboxCtx.Provider>;
};

function useAsyncCombobox({
  name,
  labelledBy = "",
  options: getOptions,
  parseOptions,
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
  const [options, setOptions] = React.useState(() => new Map());
  const labelsRef = React.useRef([]);
  const listRef = React.useRef([]);

  const fuse = React.useMemo(
    () =>
      new Fuse(Array.from(options.keys()), {
        thershold: 0.1,
      }),
    [options]
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
          elements.floating.style.minWidth = `${rects.reference.width}px`;
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
    useClick(data.context, { keyboardHandlers: false }),
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
    setActiveIndex(0);

    if (!value) {
      labelsRef.current = Array.from(options.keys());
    } else {
      labelsRef.current = filter(value);

      if (labelsRef.current.length < 1) {
        getOptions(value)
          .then((res) => {
            if (!isOpen) return;
            const { labels, options } = parseOptions(res);
            const data = new Map();
            labels.forEach((l, i) => data.set(l, options[i]));
            setOptions(data);
            setActiveIndex(0);
            labelsRef.current = Array.from(data.keys());
          })
          .catch((err) => console.log(err));
      }
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
      data: options,
      options: labelsRef.current,
      listRef,
      ...data,
      ...interactions,
    }),
    [
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      interactions,
      data,
      options,
      setOptions,
    ]
  );
}

function useCombobox({
  name,
  labelledBy = "",
  options: getOptions,
  parseOptions,
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
  const [remoteData, setRemoteData] = React.useState([]);
  const optionsRef = React.useRef([]);
  const listRef = React.useRef([]);

  const fuse = React.useMemo(
    () =>
      new Fuse(remoteData, {
        threshold: 0.1,
      }),
    [remoteData]
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
    } else {
      value = e;
    }

    setInputValue(value);
    setActiveIndex(0);

    if (!value) {
      optionsRef.current = remoteData;
    } else {
      optionsRef.current = filter(value);

      if (optionsRef.current.length < 1) {
        getOptions(value)
          .then((res) => {
            const { labels, options } = parseOptions(res);
            setRemoteData(labels);
            optionsRef.current = labels;
          })
          .catch((err) => console.log(err));
      }
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
    [
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      interactions,
      data,
      remoteData,
      setRemoteData,
    ]
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
        onFocus: (e) => {
          if (Array.from(ctx.data.keys()).length > 0) {
            ctx.setIsOpen(true);
          }
        },
        onKeyDown: (e) => {
          switch (e.code) {
            case "Enter":
              if (ctx.activeIndex != null && ctx.options[ctx.activeIndex]) {
                ctx.onInputValueChange(ctx.options[ctx.activeIndex]);
                ctx.setActiveIndex(null);
                ctx.onSelect(ctx.data.get(ctx.options[ctx.activeIndex]));
              } else {
                ctx.setActiveIndex(null);
              }
              break;
            case "Escape":
              if (!ctx.isOpen) {
                ctx.onInputValueChange("");
                ctx.setActiveIndex(null);
                ctx.refs.domReference.current?.blur();
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
                ctx.onSelect(ctx.data.get(ctx.options[ctx.activeIndex]));
              } else {
                ctx.setActiveIndex(null);
                ctx.setIsOpen(false);
                ctx.refs.domReference.current?.blur();
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
      {ctx.isOpen && ctx.options.length >= 1 && (
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
              option: ctx.data.get(opt),
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
                ctx.refs.domReference.current?.focus();
                ctx.onSelect(ctx.data.get(ctx.options[ctx.activeIndex]));
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

export const AsyncCombobox = {
  Provider,
  Trigger,
  Listbox,
  Option,
};
