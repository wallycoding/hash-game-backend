import { SocketIo } from "./types";
import { createState } from "./services/state";
import { createUser } from "./services/user";
import { createRoom } from "./services/room";
import createReply from "./services/reply";

enum EVENT_NAMES {
  CREATE_ROOM = "create-room",
  DELETE_ROOM = "delete-room",
  JOIN_ROOM = "join-room",
  EXIT_ROOM = "exit-room",
  MOVE_GAME_POSITION = "move-game-position",
}

const stateController = createState();

const ioController = (socket: SocketIo) => {
  const user = createUser(socket);
  const reply = createReply(socket);

  // TODO CREATE AND DELETE ROOM
  socket.on(EVENT_NAMES.CREATE_ROOM, () => {
    try {
      createRoom(user, (room) => {
        stateController.addRoom(room);
        socket.join(room.id);
        reply.done(EVENT_NAMES.CREATE_ROOM, room);
      });
    } catch (error) {
      if (error instanceof Error)
        reply.error(EVENT_NAMES.CREATE_ROOM, error.message);
    }
  });

  socket.on(EVENT_NAMES.DELETE_ROOM, () => {
    try {
      stateController.deleteRoom(user, (room) => {
        socket.leave(room.id);
      });
      reply.done(EVENT_NAMES.DELETE_ROOM);
    } catch (error) {
      if (error instanceof Error)
        reply.error(EVENT_NAMES.DELETE_ROOM, error.message);
    }
  });
  // TODO JOIN AND EXIT IN ROOM
  socket.on(EVENT_NAMES.JOIN_ROOM, (id) => {
    try {
      stateController.joinRoom(id, user, (room) => {
        socket.join(room.id);
        reply.done(EVENT_NAMES.JOIN_ROOM, room);
      });
    } catch (error) {
      if (error instanceof Error)
        reply.error(EVENT_NAMES.JOIN_ROOM, error.message);
    }
  });
  socket.on(EVENT_NAMES.EXIT_ROOM, () => {
    try {
      stateController.exitRoom(user, (room) => {
        socket.leave(room.id);
      });
      reply.done(EVENT_NAMES.EXIT_ROOM);
    } catch (error) {
      if (error instanceof Error)
        reply.error(EVENT_NAMES.EXIT_ROOM, error.message);
    }
  });

  socket.once("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
};

export default ioController;
