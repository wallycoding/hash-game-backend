import type { Server } from "socket.io";
import { SocketIo } from "./types";
import { createUser } from "./services/user";
import {
  allRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  disconnectRoom,
  gameSetPosition,
} from "./services/room";

export enum EVENT_NAMES {
  CREATE_ROOM = "create-room", // (event)
  JOIN_ROOM = "join-room", // (event, room-id: string)
  LEAVE_ROOM = "leave-room", // (event)
  GAME_SET_POSITION = "game-set-position", // (event, position: number(0, 8))
  UPDATE_ROOM = "update-room"
}

const socketIoEvents = (socket: SocketIo, io: Server) => {
  const user = createUser(socket);

  socket.on(EVENT_NAMES.CREATE_ROOM, createRoom(user, io));
  socket.on(EVENT_NAMES.JOIN_ROOM, joinRoom(user));
  socket.on(EVENT_NAMES.LEAVE_ROOM, leaveRoom(user));

  // GAME
  socket.on(EVENT_NAMES.GAME_SET_POSITION, gameSetPosition(user));

  socket.once("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
    disconnectRoom(user);
  });
  socket.on("all-rooms", allRooms());
};

export default socketIoEvents;
