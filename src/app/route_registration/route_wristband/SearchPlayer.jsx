import * as React from "react";
import styled, { css } from "styled-components";
import { useAfmContext } from "/src/hooks/index.js";
import {
  EditableCombobox,
  EditableComboboxTrigger,
  EditableComboboxList,
  EditableComboboxOption,
  App,
} from "/src/components/comboboxes/sl.jsx";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxList,
  ComboboxOption,
} from "/src/components/comboboxes/sl2.jsx";

const StyleSearchPlayer = styled.section`
  height: 500px;
`;

const items = ["one", "two", "three"];
const handleSelect = (selected) => {
  console.log(`selected is:${selected}`);
};

function makeCombobox(Box, Trigger, List, Option) {
  const StyleTrigger = styled(Trigger)`
    border: 2px solid black;

    ${({ selected, active }) => {
      if (selected) {
        return css`
          background-color: pink;
        `;
      } else if (active) {
        return css`
          background-color: green;
        `;
      } else {
        return css`
          &:hover {
            background-color: yellow;
          }
          &:focus {
            background-color: red;
          }
        `;
      }
    }}

    &:active {
      background-color: blue;
    }
  `;

  const StyleList = styled(List)`
    border: 2px solid black;
  `;
  const StyleOption = styled(Option)`
    ${({ selected, active }) => {
      if (selected) {
        return css`
          background-color: grey;
        `;
      } else if (active) {
        return css`
          background-color: green;
        `;
      } else {
        return css`
          &:hover {
            background-color: yellow;
          }
          &:focus {
            background-color: red;
          }
        `;
      }
    }}

    &:active {
      background-color: blue;
    }
  `;

  return [Box, StyleTrigger, StyleList, StyleOption];
}

const [Box, StyleTrigger, StyleList, StyleOption] = makeCombobox(
  Combobox,
  ComboboxTrigger,
  ComboboxList,
  ComboboxOption
);

function SelectCombobox() {
  return (
    <Box name="users" options={items} onSelect={handleSelect}>
      <StyleTrigger placeholder="select a user" />
      <StyleList renderItem={(props) => <StyleOption {...props} />} />
    </Box>
  );
}

function SearchPlayer({ className, ...props }) {
  const { afm } = useAfmContext();
  return (
    <StyleSearchPlayer className={className} {...props}>
      search player
      <SelectCombobox />
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <App /> */}
    </StyleSearchPlayer>
  );
}

export { SearchPlayer };
