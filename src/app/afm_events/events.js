import { FlashMessage } from "/src/flash_messages";
import { Modal } from "/src/modals";
import { getRegisterPlayer } from "./registerPlayer.jsx";

const eventsMap = {
  registerPlayer: getRegisterPlayer,
};

const getEvents = (afm, ...events) => {
  const e = {};
  events.forEach((event) => {
    e[event] = Object.hasOwn(eventsMap, event)
      ? eventsMap[event](afm, FlashMessage, Modal)
      : null;
  });
  return e;
};

export { getEvents };
