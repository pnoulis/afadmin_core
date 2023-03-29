import * as React from "react";
import styled from "styled-components";
import { useAfmContext } from "/src/hooks/index.js";
import {
  EditableCombobox,
  EditableComboboxTrigger,
  EditableComboboxList,
  EditableComboboxOption,
  App,
} from "/src/components/comboboxes/sl.jsx";

const StyleSearchPlayer = styled.section``;

const items = ["one", "two", "three"];
const handleSelect = (selected) => {
  console.log(`selected is:${selected}`);
};

const StyleCombobox = styled(EditableCombobox)``;

const StyleTrigger = styled(EditableComboboxTrigger)`
  border: 2px solid black;
`;

const StyleList = styled(EditableComboboxList)`
  border: 2px solid black;
`;
const StyleOption = styled(EditableComboboxOption)`
  width: 500px;
`;

function SelectCombobox() {
  return (
    <EditableCombobox items={items} onSelect={handleSelect}>
      <StyleTrigger name="users" placeholder="select a user" />
      <StyleList
        renderItem={(props, i) => <StyleOption key={i} {...props} />}
      />
    </EditableCombobox>
  );
}

function SearchPlayer({ className, ...props }) {
  const { afm } = useAfmContext();
  return (
    <StyleSearchPlayer className={className} {...props}>
      search player
      <SelectCombobox />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <App />
    </StyleSearchPlayer>
  );
}

export { SearchPlayer };
