import { SocketIo } from "./types";
import { createUser } from "./services/user";
import { allRooms, createRoom, joinRoom, leaveRoom, disconnectRoom } from "./services/room";

export enum EVENT_NAMES {
  CREATE_ROOM = "create-room", // (event)
  JOIN_ROOM = "join-room", // (event, room-id)
  LEAVE_ROOM = "leave-room", // (event)
}

const socketIoEvents = (socket: SocketIo) => {
  const user = createUser(socket);

  socket.on(EVENT_NAMES.CREATE_ROOM, createRoom(user));
  socket.on(EVENT_NAMES.JOIN_ROOM, joinRoom(user));
  socket.on(EVENT_NAMES.LEAVE_ROOM, leaveRoom(user));

  socket.once("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
    disconnectRoom(user);
  });
  socket.on("all-rooms", allRooms());
};

export default socketIoEvents;
