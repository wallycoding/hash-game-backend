import { randomBytes } from "crypto";
// import { EventEmitter } from "events";
// import type { SocketIo } from "../types";
import { TypeUser } from "./user";

export type TypeRoom = {
  id: string;
  firstPlayer: string;
  guestPlayer: null | string;
  game: {
    status: "off" | "game" | "end";
    tablePositions: (string | null)[];
    initPlayer: string;
    currentPlayer: string;
  };
};

export const createRoom = (
  user: TypeUser,
  callback: (room: TypeRoom) => void
) => {
  if (user.roomConnection) throw Error("already have a room");
  const room: TypeRoom = {
    id: randomBytes(6).toString("hex").slice(0, 6),
    firstPlayer: user.id,
    guestPlayer: null,
    game: {
      status: "off",
      tablePositions: [],
      initPlayer: user.id,
      currentPlayer: user.id,
    },
  };
  user.roomConnection = (callback) => {
    return callback(room);
  };
  callback(room);
};
