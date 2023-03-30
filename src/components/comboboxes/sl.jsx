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

  RESOURCES:
  https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/


  GLOSSARY:
  _combobox_ -> A composite GUI widget used to make a selection from a list
     of candidates which it displays through the help of a popup component.

  _listbox_ -> The popup component of the combobox. It is responsible for
     displaying the list of candidate options.

  _option_ -> A candidate option.

  _textbox_ -> In some type of comboboxes the user is provided with an text input
     area which he may use to quickly select an option from the list of candidate
     options instead of having to scroll through the list to find it.

  _DOM focus_ -> In browsers a user may "select" an element. The selected element
     is said to be the recipient of the DOM focus.

  _VISUAL focus_ -> An element which is only "visually" selected but not in actual
     DOM focus. Implementing VISUAL focus is achievable through may means. One of
     this could be the use of classes. Aria has formalized the pattern through the
     use of its aria-activedescendant property.

  _TAB Sequence_ ->
     https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_general_between

  _Roving tab index_ ->
     https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex


  FEATURES:
  [ ] -> cursor should change to pointer when user hovers on the reference element
  [ ] -> the reference element must be highlighted in some way (border) when it
         is in the open state.
  [ ] -> The combobox is a composite component. Only the reference element
         partakes in the TAB sequence. The options within the listbox are
         focusable but do not move focus away from the textbox in the reference
         element by utilizing the aria-activedescendant property.
  [ ] -> The following aria properties should be utilized:

         combobox:

         - [ ] aria-activedescendant=IDREF (current active option)
         - [ ] aria-role=combobox
         - [ ] aria-expanded=[true || false]
         - [ ] aria-haspopup=true
         - [ ] aria-controls=IDREF (popup element)
         - [ ] aria-autocomplete=list


         listbox:

         - [ ] aria-label=
         - [ ] aria-role=listbox

         Options:

         - [ ] aria-role=option
         - [ ] aria-selected=[true || false]


  CONTROLS:

  TAB
  [ ] -> If DOM focus is placed on the combobox, expand the popup.
  [ ] -> If DOM focus is placed on another element, collapse the popup.

  DOWN arrow
  [ ] -> If DOM focus is on the combobox and the textbox is not empty and the
         listbox is displayed moves visual focus to the first suggested value.
  [ ] -> If DOM focus is on the combobox if the textbox is empty and the listbox
         is not displayed, opens the listbox and moves visual focus
         to the first option
  [ ] -> In both previous cases DOM focus remains on the textbox
  [ ] -> If VISUAL focus is on an option, move visual focus to the next option.
  [ ] -> If VISUAL focus is on the last option, moves visual focus to the first
         option.


  UP arrow
  [ ] -> If DOM focus is on the combobox and the textbox is not empty
         and the listbox is displayed, moves VISUAL focus to the last suggested value
  [ ] -> If DOM focus is on the combobox and the textbox is empty, first opens
         the listbox if it is not already displayed and then moves VISUAL focus
         to the last option.
  [ ] -> In both cases DOM focus remains on the textbox.
  [ ] -> If VISUAL focus is on an option, move visual focus to the previous option.
  [ ] -> If VISUAL focus is on the first option, move visual focus to the last option.


  ENTER
  [ ] -> collapses the listbox
  [ ] -> aria-selected is handed over to any listeners
  [ ] -> clears the textbox

  ESCAPE
  [ ] -> collapses the listbox, DOM focus remains on the textbox
  [ ] -> if the listbox is not displayed, clears the textbox

  ON EXPANSION
  [ ] -> the first option is made active and selected

  A-Z
  options in the listbox are filtered based on characters in the textbox
  first option is made active and selected

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
      focusItemOnOpen: false,
    }),
    useFocus(data.context, { keyboardOnly: false }),
    // useClick(data.context),
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
    [listNavigation, useFocus(context, { keyboardOnly: false })]
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
