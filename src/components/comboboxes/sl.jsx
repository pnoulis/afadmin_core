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

/*

  Tabbable vs Focusable:
  tabable and focusable: 0
  only focusable: -1


  UseListNavigationHook

  getReferenceProps -> loads of mouse evenst
  getFloatingProps -> tabIndex, aria-orientation, onKeydown, onPointerMove
  getItemProps -> onFocus, onClick, onMouseMove, onPointerLeave
  must be focusable -> using tabIndex
  makes the item active if it is being hovered, if it is being
  focused, if it is clicked

  useListNavigation only cares about:
  up and arrow keys on the floating element and item elements
  click and hover on the item elements.





tab and shift+tab keys move focus
arrow keys move focus
tab sequence / tab ring -> the path used by focus, the order
by which elements can be focused and are focused upon user interaction.


In a GUI component with multiple focusable elements only the root element
partakes in the tab sequence.
pressing the arrow keys then moves the focus within the focused tab sequence
element.
pressing tab again moves the focus to the next element in the tab sequence.


composite widget -> a GUI component composed of multiple focusable elements.
managing focus -> the process by which the programmer controls focus within
a composite widget.

.focus -> focuses an element
.blur -> removes focus from element
 */

const ComboboxContext = React.createContext(null);
const useComboboxContext = () => {
  const context = React.useContext(ComboboxContext);
  if (context === null) {
    throw new Error("Combobox components must be wrapped in <Combobox/>");
  }
  return context;
};

function useCombobox(items = [], onSelect = () => {}, config = {}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(null);
  const listRef = React.useRef([]);

  const data = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const interactions = useInteractions([
    useListNavigation(data.context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
    }),
    useFocus(data.context, { keyboardOnly: true }),
    useClick(data.context, { keyboardHandlers: true }),
  ]);

  return React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      items,
      listRef: listRef.current,
      activeIndex,
      ...data,
      ...interactions,
    }),
    [isOpen, setIsOpen, interactions, data, activeIndex]
  );
}

function Combobox({ items, onSelect, children, ...config }) {
  const context = useCombobox(items, onSelect, config);
  return (
    <ComboboxContext.Provider value={context}>
      {children}
    </ComboboxContext.Provider>
  );
}

function ComboboxTrigger({ name, placeholder, className, children, ...props }) {
  const context = useComboboxContext();
  return (
    <div>
      <input
        className={`combobox ${className || ""} check`}
        ref={context.refs.setReference}
        {...context.getReferenceProps(props)}
      ></input>
    </div>
  );
}

function ComboboxList({ renderItem, className, ...props }) {
  const context = useComboboxContext();
  return (
    <div>
      {context.isOpen && (
        <ul
          className={`combobox-list ${className || ""}`}
          tabIndex={0}
          style={{
            position: context.strategy,
            top: context.y ?? 0,
            left: context.x ?? 0,
          }}
          ref={context.refs.setFloating}
          {...context.getFloatingProps(props)}
        >
          {context.items.map((option, index) =>
            renderItem({ option, context, index }, index)
          )}
        </ul>
      )}
    </div>
  );
}

function ComboboxOption({
  option,
  context,
  index,
  className,
  children,
  ...props
}) {
  return (
    <li
      className={`combobox-option ${className || ""} ${
        index === context.activeIndex ? "active" : ""
      } check`}
      role="option"
      ref={(node) => (context.listRef[index] = node)}
      tabIndex={index === context.activeIndex ? 0 : -1}
      {...context.getItemProps(props)}
    >
      {children || option}
    </li>
  );
}

function App() {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(null);

  const { x, y, strategy, refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const listRef = React.useRef([]);

  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [listNavigation]
  );

  const items = ["one", "two", "three"];

  return (
    <div>
      <div
        className="check"
        tabIndex={0}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        Reference element
      </div>
      {open && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          {...getFloatingProps()}
        >
          {items.map((item, index) => (
            <div
              key={item}
              // Make these elements focusable using a roving tabIndex.
              tabIndex={-1}
              className={`check ${activeIndex === index ? "active" : ""}`}
              ref={(node) => {
                listRef.current[index] = node;
              }}
              {...getItemProps()}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export {
  Combobox as EditableCombobox,
  ComboboxTrigger as EditableComboboxTrigger,
  ComboboxList as EditableComboboxList,
  ComboboxOption as EditableComboboxOption,
  App,
};
