import { TypeRoom } from "./room";
import { TypeUser } from "./user";

type TypeState = {
  rooms: Map<string, TypeRoom>;
  createdAt: Date;
};

type TypeStateController = {
  addRoom: (room: TypeRoom) => void;
  joinRoom: (
    id: string,
    user: TypeUser,
    callback: (room: TypeRoom) => void
  ) => void;
  exitRoom: (user: TypeUser, callback: (room: TypeRoom) => void) => void;
  deleteRoom: (user: TypeUser, callback: (room: TypeRoom) => void) => void;
};

export const createState = () => {
  const state: TypeState = {
    rooms: new Map(),
    createdAt: new Date(),
  };

  const stateContoller: TypeStateController = {
    addRoom(room) {
      state.rooms.set(room.id, room);
    },
    joinRoom(id, user, callback) {
      const room = state.rooms.get(id);
      if (!room) throw Error("room not found");
      if (room.game.status === "off") room.game.status = "game";
      room.guestPlayer = user.id;
      user.roomConnection = (callback) => {
        callback(room);
      };
      callback(room);
    },
    exitRoom(user, callback) {
      if (!user.roomConnection) throw Error("you are not in a room");
      user.roomConnection((room) => {
        if (room.guestPlayer !== user.id) throw Error("you're not in a room");
        room.guestPlayer = null;
        user.roomConnection = null;
        callback(room);
      });
    },
    deleteRoom(user, callback) {
      if (!user.roomConnection) throw Error("you haven't create a room yet");
      user.roomConnection((room) => {
        if (room.firstPlayer !== user.id)
          throw Error("you not have permissons");
        state.rooms.delete(room.id);
        user.roomConnection = null;
        callback(room);
      });
    },
  };

  return stateContoller;
};
