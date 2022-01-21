import type { Server } from "socket.io";
import { SocketIo } from "./types";
import { createUser } from "./services/user";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  disconnectRoom,
  gameSetPosition,
  gameReset,
} from "./services/room";

export enum EVENT_NAMES {
  CREATE_ROOM = "create-room", // EMIT > (event) | LISTEN (event, room);
  JOIN_ROOM = "join-room", // EMIT > (event, room-id);
  LEAVE_ROOM = "leave-room", // EMIT > (event);
  GAME_SET_POSITION = "game-set-position", // EMIT > (event, position: number<0, 8>);
  GAME_RESET = "game-reset", // EMIT > (event);
  UPDATE_ROOM = "update-room" // LISTEN (event, room);
}

const socketIoEvents = (socket: SocketIo, io: Server) => {
  const user = createUser(socket);

  socket.on(EVENT_NAMES.CREATE_ROOM, createRoom(user, io));
  socket.on(EVENT_NAMES.JOIN_ROOM, joinRoom(user));
  socket.on(EVENT_NAMES.LEAVE_ROOM, leaveRoom(user));

  // GAME
  socket.on(EVENT_NAMES.GAME_SET_POSITION, gameSetPosition(user));
  socket.on(EVENT_NAMES.GAME_RESET, gameReset(user));

  socket.once("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
    disconnectRoom(user);
  });
};

export default socketIoEvents;
