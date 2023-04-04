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
import * as Combo from "/src/components/comboboxes/perfectCombobox.jsx";
import {
  RemoteDataProvider,
  useRemoteData,
  RemoteDataStates,
} from "/src/hooks/useRemoteData.jsx";
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
  pointer-events: none;
  height: 30px;
  width: 30px;
`;

const StyleFailIcon = styled(Svg)`
  fill: var(--error-base);
  pointer-events: none;
  height: 30px;
  width: 30px;
`;

const items = ["one", "two", "three"];
const handleSelect = (selected) => {
  console.log(`selected is:${selected}`);
};

function makeCombobox(Box, Trigger, List, Option) {
  const StyleTrigger = styled(Trigger)`
    display: block;
    border: 2px solid black;
    cursor: pointer;
    text-align: center;
    width: 350px;
    height: 45px;
    border-radius: 10px;

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
          }
          &:focus {
          }
        `;
      }
    }}

    &:active {
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

const StyleSearchBar = styled.div`
  display: flex;
`;
function SelectComboboxFail() {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState([]);
  const remoteData = useRemoteData({
    getRemoteData: getItemsSuccess,
  });

  React.useEffect(() => {
    if (open && data.length < 1) {
      remoteData
        .startFetching()
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.log("error");
        });
    }
  }, [open, setOpen]);

  const cssOverride = {
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translate(-30%, -50%)",
  };
  return (
    <RemoteDataProvider value={remoteData}>
      <Box
        name="usersFail"
        options={data}
        onSelect={handleSelect}
        initialOpen={true}
        open={open}
        onOpenChange={setOpen}
      >
        <StyleSearchBar>
          <StyleTrigger placeholder="select a user" />
          <RemoteDataStates
            renderPending={
              <BounceLoader
                loading={true}
                color="var(--info-base)"
                size={30}
                cssOverride={cssOverride}
              />
            }
            renderSuccess={
              <StyleSuccessIcon>
                <SuccessIcon />
              </StyleSuccessIcon>
            }
            renderFailure={
              <StyleFailIcon>
                <FailedIcon />
              </StyleFailIcon>
            }
          />
        </StyleSearchBar>
        <StyleList renderItem={(props) => <StyleOption {...props} />} />
      </Box>
    </RemoteDataProvider>
  );
}

// function FetchData() {
//   const remoteData = useRemoteData({
//     getRemoteData: getItemsFailure,
//     parseRes: (res) => {
//       console.log("some sort of res");
//       console.log(res);
//       return res;
//     },
//     parseError: (err) => {
//       console.log("there was some error");
//       throw err;
//     },
//   });
//   const fetchRef = React.useRef(0);
//   const startFetch = () => {
//     remoteData
//       .startFetching(++fetchRef.current)
//       .then((res) => console.log(`res resolved:${res}`))
//       .catch((err) => console.log(err));
//     // .then((res) => {
//     //   console.log("resolved");
//     // })
//     // .catch((err) => {
//     //   console.log(err);
//     //   console.log("errorrrororororor");
//     // });
//   };
//   const stopFetch = () => {
//     remoteData.setState("idle");
//   };
//   return (
//     <RemoteDataProvider value={remoteData}>
//       <p onClick={startFetch}>start fetching</p>
//       <p onClick={stopFetch}>stop fetch</p>
//       <RemoteDataStates
//         renderPending={<p>pending</p>}
//         renderSuccess={<p>success</p>}
//         renderFailure={<p>failure</p>}
//       />
//     </RemoteDataProvider>
//   );
// }

function SearchPlayer({ className, ...props }) {
  const { afm } = useAfmContext();
  return (
    <StyleSearchPlayer className={className} {...props}>
      search player
      {/* <FetchData /> */}
      {/* <div> */}
      {/*   <SelectCombobox /> */}
      {/* </div> */}
      <div>
        <SelectComboboxFail />
      </div>
    </StyleSearchPlayer>
  );
}

export { SearchPlayer };
