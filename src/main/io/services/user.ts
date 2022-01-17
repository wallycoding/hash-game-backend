import { EventEmitter } from "events";
import type { SocketIo } from "../types";
import { TypeRoom } from "./room";

export type TypeUser = {
  id: string;
  roomConnection: null | ((callback: (room: TypeRoom) => any) => any);
  onExit: () => void;
  disconnect(): void;
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
    disconnect() {
      this.onExit();
    },
  };

  return user;
};
