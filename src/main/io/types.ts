import type { Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";

export interface SocketIo extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {};
