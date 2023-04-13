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
import { Player } from "./Player.jsx";
import { useWristbandRegisterCtx } from "../Context.jsx";

const StyleSuccessIcon = styled(Svg)`
  fill: var(--success-medium);
  pointer-events: none;
  height: 40px;
  width: 40px;
`;

const StyleFailIcon = styled(Svg)`
  fill: var(--error-base);
  pointer-events: none;
  height: 40px;
  width: 40px;
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
  background-color: white;
  border-radius: var(--br-lg);
  height: 50px;

  pointer-events: auto;
  width: 100%;
  height: 55px;
  padding: 0 15px;
  border-radius: var(--br-lg);
  border: 2px solid var(--black-base);
  font-size: var(--tx-md);
  letter-spacing: 1.5px;
  outline: none;
  color: black;

  &::placeholder {
    color: black;
    opacity: 1;
  }

  &:hover {
    cursor: pointer;
  }
`;

const StyleListbox = styled(AsyncCombobox.Listbox)`
  margin-top: 10px;
  width: 700px;
  margin-left: 138px;
  border-top-left-radius: var(--br-lg);
  border-top-right-radius: var(--br-lg);
  background-color: var(--grey-light);
  height: 450px;
  padding: 20px 15px;
  outline: none;
  overflow: scroll;
  display: flex;
  flex-flow: column nowrap;
  gap: 15px;
`;

const StyleOption = styled(AsyncCombobox.Option)`
  border: 4px solid transparent;
  padding: 10px 10px;
  border-radius: var(--br-md);
  background-color: white;

  ${({ selected, active }) => {
    if (selected) {
      return `
border-color: var(--success-base);
`;
    } else if (active) {
      return `
border-color: var(--primary-medium);
cursor: pointer;
`;
    } else {
      return `
  &:hover {
    cursor: pointer;
    border-color: var(--primary-medium);
  }
`;
    }
  }}
`;

const StyleSearchPlayerCombobox = styled.article`
  display: flex;
  flex-flow: column nowrap;
  gap: 30px;
  width: 100%;
  #search-player-combobox {
    font-size: 1.5em;
    font-family: NoirPro-Regular;
    text-transform: capitalize;
    letter-spacing: 2px;
  }

  .combobox-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 10px;

    #players-trigger {
      flex: 0 0 70;
    }

    .combobox-states {
      flex: 1 0 30%;
    }
  }
`;

function SearchPlayerCombobox() {
  const { searchPlayer } = useAfmContext("searchPlayer");
  const remoteData = useRemoteData({
    getRemoteData: searchPlayer,
  });
  const { players, setPlayers } = useWristbandRegisterCtx();

  return (
    <RemoteDataProvider value={remoteData}>
      <StyleSearchPlayerCombobox>
        <h1 id="search-player-combobox">search player</h1>
        <div className="combobox-wrapper">
          <Combobox
            name="players"
            labelledBy="search-player-combobox"
            options={remoteData.startFetching}
            parseOptions={(options) => {
              const labels = options.map((opt) => opt.username);
              return {
                labels,
                options,
              };
            }}
            onSelect={(player) => {
              if (!players.find((p) => p.username === player.username)) {
                setPlayers([
                  ...players,
                  {
                    ...player,
                    wristbandMerged: false,
                    wristband: {
                      status: 0,
                      pairing: true,
                    },
                  },
                ]);
              }
            }}
          >
            <StyleTrigger placeholder="username or email" />
            <StyleListbox
              renderOption={(props) => (
                <StyleOption {...props}>
                  <Player
                    player={props.option}
                    active={props.active}
                    selected={props.selected}
                  />
                </StyleOption>
              )}
            />
          </Combobox>
          <div className="combobox-states">
            <RemoteDataStates
              renderPending={
                <MoonLoader loading color="var(--info-strong)" size={40} />
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
        </div>
      </StyleSearchPlayerCombobox>
    </RemoteDataProvider>
  );
}

export { SearchPlayerCombobox };
