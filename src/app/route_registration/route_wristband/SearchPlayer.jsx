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
  ComboboxFetching,
} from "/src/components/comboboxes/sl2.jsx";
import { FadeLoader, BounceLoader, MoonLoader } from "react-spinners";
import { ReactComponent as SuccessIcon } from "/assets/icons/success_icon_filled.svg";
import { ReactComponent as FailedIcon } from "/assets/icons/warning_icon_filled.svg";
import { Svg } from "/src/components/svgs/index.js";
import { FlashMessage } from "/src/flash_messages/index.js";

const StyleSearchPlayer = styled.section`
  height: 500px;
  display: flex;
  flex-flow: row nowrap;
  gap: 150px;
`;

const StyleSuccessIcon = styled(Svg)`
  fill: var(--success-medium);
  height: 50px;
`;

const StyleFailIcon = styled(Svg)`
  fill: var(--error-base);
  height: 50px;
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

const getItemsSuccess = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...items, "success"]), 3000);
  });
};

const getItemsFailure = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(), 3000);
  }).catch((err) => {
    FlashMessage.error("Failure fetching data");
    throw err;
  });
};

function SelectCombobox() {
  return (
    <Box name="users" getItems={getItemsSuccess} onSelect={handleSelect}>
      <StyleTrigger placeholder="select a user" />
      <ComboboxFetching
        renderPending={<BounceLoader loading={true} color="var(--info-base)" />}
        renderSuccess={
          <StyleSuccessIcon>
            <SuccessIcon />
          </StyleSuccessIcon>
        }
        renderError={
          <StyleFailIcon>
            <FailedIcon />
          </StyleFailIcon>
        }
      />
      <StyleList renderItem={(props) => <StyleOption {...props} />} />
    </Box>
  );
}

function SelectComboboxFail() {
  return (
    <Box name="usersFail" getItems={getItemsFailure} onSelect={handleSelect}>
      <StyleTrigger placeholder="select a user" />
      <ComboboxFetching
        renderPending={<BounceLoader loading={true} color="var(--info-base)" />}
        renderSuccess={
          <StyleSuccessIcon>
            <SuccessIcon />
          </StyleSuccessIcon>
        }
        renderError={
          <StyleFailIcon>
            <FailedIcon />
          </StyleFailIcon>
        }
      />
      <StyleList renderItem={(props) => <StyleOption {...props} />} />
    </Box>
  );
}

function SearchPlayer({ className, ...props }) {
  const { afm } = useAfmContext();
  return (
    <StyleSearchPlayer className={className} {...props}>
      search player
      <div>
        <SelectCombobox />
      </div>
      <div>
        <SelectComboboxFail />
      </div>
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
      {/* <App /> */}
      {/* <BounceLoader loading={true} color="var(--info-base)" /> */}
      {/* <StyleSuccessIcon> */}
      {/*   <SuccessIcon /> */}
      {/* </StyleSuccessIcon> */}
      {/* <StyleFailIcon> */}
      {/*   <FailedIcon /> */}
      {/* </StyleFailIcon> */}
    </StyleSearchPlayer>
  );
}

export { SearchPlayer };
