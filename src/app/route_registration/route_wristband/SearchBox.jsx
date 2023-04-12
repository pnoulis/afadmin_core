import * as React from "react";
import styled, { css } from "styled-components";
import { useAfmContext } from "/src/hooks/index.js";
import { AsyncCombobox } from "/src/components/comboboxes/index.js";
import {
  RemoteDataProvider,
  useRemoteData,
  RemoteDataStates,
} from "/src/hooks/useRemoteData.jsx";
import { ReactComponent as SuccessIcon } from "/assets/icons/success_icon_filled.svg";
import { ReactComponent as FailedIcon } from "/assets/icons/warning_icon_filled.svg";
import { Svg } from "/src/components/svgs/index.js";
import { MoonLoader } from "react-spinners";

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

const indicators = css`
  ${({ selected, active }) => {
    if (selected) {
      return `
        background-color: pink;
      `;
    } else if (active) {
      return `
        background-color: green;
      `;
    } else {
      return `
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

const Combobox = AsyncCombobox.Provider;

const StyleTrigger = styled(AsyncCombobox.Trigger)`
  ${indicators}
  border: 2px solid black;
`;

const StyleListbox = styled(AsyncCombobox.Listbox)`
  border: 2px solid black;
  margin-top: 5px;
`;

const StyleOption = styled(AsyncCombobox.Option)`
  ${indicators}
`;

function SearchPlayerCombobox() {
  const { searchPlayer } = useAfmContext("searchPlayer");
  const remoteData = useRemoteData({
    getRemoteData: searchPlayer,
  });
  const [players, setPlayers] = React.useState([]);

  const handleInput = (player) => {
    remoteData
      .startFetching(player)
      .then((res) => {
        console.log(res);
        setPlayers(res.map((p) => p.username));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  React.useEffect(() => {
    console.log(players);
  }, [players]);

  return (
    <RemoteDataProvider value={remoteData}>
      <article>
        <h1
          id="search-player-combobox"
          onClick={() => {
            remoteData
              .startFetching("@maze")
              .then((res) => {
                setPlayers(res.map((p) => p.username));
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          {" "}
          search player
        </h1>
        <div>
          <Combobox
            name="players"
            labelledBy="search-player-combobox"
            options={remoteData.startFetching}
            onSelect={(label) => alert(label)}
          >
            <StyleTrigger placeholder="player" />
            <StyleListbox
              renderOption={(props) => <StyleOption {...props} />}
            />
          </Combobox>
        </div>
        <div>
          <RemoteDataStates
            renderPending={
              <MoonLoader loading color="var(--info-base)" size={30} />
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
        </div>
      </article>
    </RemoteDataProvider>
  );
}

export { SearchPlayerCombobox };
