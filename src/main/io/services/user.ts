import type { SocketIo } from "../types";
import { TypeRoom } from "./room";

export type TypeUser = {
  id: string;
  roomConnection: null | ((callback: (room: TypeRoom) => any) => any);
  reply: {
    done: (event: string, data?: any) => void;
    error: (event: string, error: any) => void;
  };
  socket: SocketIo;
};

export const createUser = (socket: SocketIo) => {
  const user: TypeUser = {
    id: socket.id,
    roomConnection: null,
    reply: {
      done(event: string, data?: any) {
        socket.emit(`${event}-response`, null, data);
      },
      error(event: string, error: any) {
        socket.emit(`${event}-response`, error);
      },
    },
    socket: socket,
  };

  return user;
};
