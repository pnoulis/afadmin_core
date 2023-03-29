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
  useTypeahead,
  useClick,
  autoUpdate,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";

/*
  What is a Combobox?
  https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

  The select only combobox is a variation of the combobox component.
  It restricts the user into selecting only one of the available options.

  Per ARIA terminology the combobox defined within is described as:

  * Select-only Combobox
  * The popup has a role of 'listbox'
  * Each option has a role of 'option'
  * The autocompelete behavior is not listed in the ARIA pattern.
    However the behavior implemented is common across the industry.
    Upon press of an alphanumeric character the option whose 1st character
    matches the user input key is activated and focused.
    Upon a second key event in rapid succession the 2nd watched option if
    any is selected. If no 2nd matched option exists the 1st matched option
    remains selected.
    After a short duration (configurable) the match 'cache' is reset.

  INTERACTIONS:

    on Tab:
        if state is not open:

        - comboboxTrigger is focused.
        - comboboxList is revealed/opened.
        - the 1st option in the list is focused and made active.

        if state is open:

        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - previous selection if any is not interfered with.

    on Esc:
        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - previous selection if any is not interfered with.

    on Enter:
        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - The activeIndex option is marked as selected.
        - invoke the onSelect handler providing it with the selection

    on Click outside the boundaries of the combobox:
        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - previous selection if any is not interfered with.

    on Click within one of the options:
        - comboboxList is hidden/closed.
        - The option that was the target of the event is marked as selected
        - invoke the onSelect handler providing it with the selection.

    on Click within the combobox trigger: (in case HOVER is off)
        if state is not open:
        - comboboxList is revealed/opened.
        - the 1st option in the list is focused and made active.

        if state is open:
        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - No selection

    on Hover within the combobox trigger: (in case onClick is off)
        if state is not open:
        - comboboxList is revealed/opened.
        - the 1st option in the list is focused and made active.

    on Hover within one of the options:
        - Hovered option is made active and focused.

    on Hover outside of the boundaries of the combobox:
        - comboboxTrigger is blurred.
        - comboboxList is hidden/closed.
        - No selection

  USAGE:

  const items = ['one', 'two', 'three'];
  const handleSelect = (selected) => console.log(`selected is:${selected}`);

  <EditableCombobox items={options} onSelect={handleSelect}>
     <EditableComboboxTrigger name='country' placeholder='select a country'>
        country
     </EditableComboboxTrigger>
     <EditableComboboxList
        renderItem={(props, i) => (
            <EditableComboboxOption key={i} {...props}/>
        )}
     />
  </EditableCombobox>


  CUSTOMIZATION:

  The component has been designed in such a way to allow for visual design
  customizations.

  The components which render markup that can be designed are:

  <ComboboxTrigger/> <div><input/><label/></div/>
  <ComboboxList/> <ul/>
  <ComboboxOption/> <li/>

  Each of these is given a className of respectively:
  combobox-trigger
  combobox-list
  combobox-option

  When the combobox is open the trigger is added the active class:
  combobox-trigger active

  Customization using styled-components:

  const RedComboboxTrigger = styled(ComboboxTrigger)`
  background-color: red;
  `

  const GreenComboboxList = styled(ComboboxList)`
  background-color: green;
  `

  const YellowComboboxOption = styled(ComboboxOption)`
  background-color: green;
  `

  The comboboxOption and comboboxTrigger render their children which
  means that their contents can be any arbitrary react component
  making them not only customizable in terms of appearance but also
  of content.

  Example:
  <ComboboxOption>
  <img src={...} alt='dog'/>
  <p>click me you will get a dog</p/>
  </ComboboxOption/>

  The comboboxTrigger is half way content customizable.
  the children are rendered as children of the label component:

  <div>
  <input/>
  <label>{children}</label/>
  </div>

  Therefore:
  <ComboboxTrigger>
  <p>within label</p>
  </ComboboxTrigger/>

*/

const ComboboxContext = React.createContext(null);
const useComboboxContext = () => {
  const context = React.useContext(ComboboxContext);
  if (context == null) {
    throw new Error("Combobox children must be wrapped in <Combobox/>");
  }
  return context;
};

function useCombobox({ items = [], onSelect = () => {}, config = {} }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const listRef = React.useRef([]);
  const contentRef = React.useRef(items);

  const data = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      flip(),
      shift(),
      offset(),
      size({
        apply({ rects, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    ],
  });

  const interactions = useInteractions([
    useClick(data.context, {
      event: "mousedown",
      keyboardHandlers: true,
    }),
    useDismiss(data.context),
    useRole(data.context, { role: "listbox" }),
    useListNavigation(data.context, {
      listRef,
      activeIndex,
      selectedIndex,
      onNavigate: setActiveIndex,
      loop: true,
      focusItemOnOpen: true,
    }),
    useTypeahead(data.context, {
      listRef: contentRef,
      activeIndex,
      selectedIndex,
      onMatch: isOpen ? setActiveIndex : setSelectedIndex,
    }),
  ]);

  const handleSelect = (index) => {
    setIsOpen(false);
    setSelectedIndex(index);
    onSelect(items[index]);
  };

  return React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      items,
      listRef: listRef.current,
      handleSelect,
      activeIndex,
      selectedIndex,
      ...data,
      ...interactions,
    }),
    [isOpen, setIsOpen, interactions, data, activeIndex]
  );
}

function Combobox({ items, onSelect, children, ...config }) {
  const state = useCombobox({ items, onSelect, config });
  return (
    <ComboboxContext.Provider value={state}>
      {children}
    </ComboboxContext.Provider>
  );
}

function ComboboxTrigger({ name, placeholder, className, children, ...props }) {
  const context = useComboboxContext();
  return (
    <div>
      <input
        readOnly
        className={`combobox ${className || ""}`}
        ref={context.refs.setReference}
        aria-labelledby="select-label"
        aria-autocomplete="none"
        type="text"
        name={name}
        id={name}
        placeholder={placeholder}
        value={
          context.selectedIndex != null
            ? context.items[context.selectedIndex]
            : ""
        }
        {...context.getReferenceProps(props)}
      />
      <label htmlFor={name}>{children}</label>
    </div>
  );
}

function ComboboxList({ renderItem, className, ...props }) {
  const context = useComboboxContext();
  return (
    <FloatingPortal>
      {context.isOpen && (
        <FloatingFocusManager
          context={context.context}
          modal={false}
          initialFocus={0}
        >
          <ul
            className={`combobox-list ${className || ""}`}
            ref={context.refs.setFloating}
            role="group"
            style={{
              position: context.strategy,
              top: context.y ?? 0,
              left: context.x ?? 0,
            }}
            {...context.getFloatingProps(props)}
          >
            {context.items.map((item, index) =>
              renderItem({ option: item, context, index }, index)
            )}
          </ul>
        </FloatingFocusManager>
      )}
    </FloatingPortal>
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
  const isActive = context.activeIndex === index;
  const isSelected = context.selectedIndex === index;
  return (
    <li
      className={`combobox-option ${className || ""} ${
        isActive ? "active" : ""
      }`}
      role="option"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isSelected ? 0 : -1}
      ref={(node) => (context.listRef[index] = node)}
      {...context.getItemProps({
        // Handle pointer select.
        onClick() {
          context.handleSelect(index);
        },
        // Handle keyboard select.
        onKeyDown(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            context.handleSelect(index);
          }

          if (event.key === " ") {
            event.preventDefault();
          }
        },
        onKeyUp(event) {
          if (event.key === " ") {
            context.handleSelect(index);
          }
        },
        ...props,
      })}
    >
      {children || option}
    </li>
  );
}

export {
  Combobox as SelectOnlyCombobox,
  ComboboxTrigger as SelectOnlyComboboxTrigger,
  ComboboxList as SelectOnlyComboboxList,
  ComboboxOption as SelectOnlyComboboxOption,
};
