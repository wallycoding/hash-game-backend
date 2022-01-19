import { EventEmitter } from "events";
import type { SocketIo } from "../types";
import { TypeRoom } from "./room";

export type TypeUser = {
  id: string;
  roomConnection: null | ((callback: (room: TypeRoom) => any) => any);
  onExit: () => void;
  socket: SocketIo;
  reply: {
    done: (event: string, data?: any) => void;
    room: (event: string, id: string, data?: any) => void;
    error: (event: string, error: any) => void;
  };
};

export const createUser = (socket: SocketIo) => {
  const eventEmitter = new EventEmitter();

  const user: TypeUser = {
    id: socket.id,
    roomConnection: null,
    get onExit() {
      return () => eventEmitter.emit("exit");
    },
    set onExit(callback: () => void) {
      eventEmitter.addListener("exit", callback);
    },
    reply: {
      done(event: string, data?: any) {
        socket.emit(`${event}-response`, null, data);
      },
      room(event: string, id: string, data?: any) {
        socket.emit(`${event}-${id}`, data);
      },
      error(event: string, error: any) {
        socket.emit(`${event}-response`, error);
      },
    },
    socket: socket,
  };

  return user;
};
