import { randomBytes } from "crypto";
import { EventEmitter } from "events";
// import type { SocketIo } from "../types";
import { TypeUser } from "./user";
import { EVENT_NAMES } from "../events";

type TypePlayer = "one" | "two";
type TypePlayerID = string | null;

export type TypeRoom = {
  id: string;
  playerOne: TypePlayerID;
  playerTwo: TypePlayerID;
  getPlayerId: (player: TypePlayer) => TypePlayerID;
  game: {
    status: "off" | "game" | "end";
    tablePositions: TypePlayer[];
    initPlayer: TypePlayer;
    currentPlayer: TypePlayer;
  };
  leave: (user: TypeUser) => void;
  join: (user: TypeUser) => void;
};

const rooms: Map<string, TypeRoom> = new Map();

export const createRoom = (user: TypeUser) => () => {
  if (user.roomConnection)
    return user.reply.error(EVENT_NAMES.CREATE_ROOM, "already have a room");

  const hasPlayers = (room: TypeRoom) => {
    const deleteRoom = !room.playerOne || !room.playerTwo;
    if (deleteRoom) rooms.delete(room.id);
  };

  let playerOne: TypePlayerID = user.id;
  let playerTwo: TypePlayerID = null;
  const room: TypeRoom = {
    id: randomBytes(6).toString("hex").slice(0, 6).toUpperCase(), // ID 6 chars
    get playerOne() {
      return playerOne;
    },
    set playerOne(id: TypePlayerID) {
      if (!id) hasPlayers(this);
      playerOne = id;
    },
    get playerTwo() {
      return playerTwo;
    },
    set playerTwo(id: TypePlayerID) {
      if (!id) hasPlayers(this);
      playerTwo = id;
    },
    getPlayerId(player) {
      return player === "one" ? room.playerOne : room.playerTwo;
    },
    game: {
      status: "off",
      tablePositions: [],
      initPlayer: "one",
      currentPlayer: "one",
    },
    leave(user) {
      const removePlayerOne = () => {
        room.playerOne = null;
        user.roomConnection = null;
        user.socket.leave(room.id);
      };
      const removePlayerTwo = () => {
        room.playerTwo = null;
        user.roomConnection = null;
        user.socket.leave(room.id);
      };
      room.playerOne === user.id ? removePlayerOne() : removePlayerTwo();
    },
    join(user) {
      const addPlayerOne = () => {
        room.playerOne = user.id;
        user.roomConnection = (callback) => callback(room);
        user.socket.join(room.id);
      };
      const addPlayerTwo = () => {
        room.playerTwo = user.id;
        user.roomConnection = (callback) => callback(room);
        user.socket.join(room.id);
      };
      room.playerOne === user.id ? addPlayerOne() : addPlayerTwo();
      user.reply.done(EVENT_NAMES.JOIN_ROOM, room);
    },
  };
  rooms.set(room.id, room);
  user.socket.join(room.id);
  user.roomConnection = (callback) => callback(room);
  user.reply.done(EVENT_NAMES.CREATE_ROOM, room);
  console.log("ROOM ID:", room.id);
};

export const joinRoom = (user: TypeUser) => (id: string) => {
  const room = rooms.get(id);
  if (!room)
    return user.reply.error(EVENT_NAMES.JOIN_ROOM, "this room not found");
  room.join(user);
};

export const leaveRoom = (user: TypeUser) => () => {
  if (!user.roomConnection)
    return user.reply.error(EVENT_NAMES.LEAVE_ROOM, "you're not in a room");
  user.roomConnection((room) => {
    room.leave(user);
  });
};

export const disconnectRoom = (user: TypeUser) => {
  if (user.roomConnection)
    user.roomConnection((room) => {
      room.leave(user);
    });
};

export const allRooms = () => () => console.log(rooms.values());
