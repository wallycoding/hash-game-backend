import type { Server } from "socket.io";
import { randomBytes } from "crypto";
import { TypeUser } from "./user";
import { EVENT_NAMES } from "../events";
import { verifyPositions } from "./game";

export type TypeStatusGame = "off" | "game" | "end";
export type TypePlayer = "one" | "two";
export type TypePlayerID = string | null;

export type TypeRoom = {
  id: string;
  playerOne: TypePlayerID;
  playerTwo: TypePlayerID;
  getPlayerId: (player: TypePlayer) => TypePlayerID;
  emitRoom: () => void;
  game: {
    win: null | "one" | "two";
    status: TypeStatusGame;
    tablePositions: TypePlayer[];
    initPlayer: TypePlayer;
    currentPlayer: TypePlayer;
    setGameState: (status: TypeStatusGame, condition: boolean) => void;
    alternatePlayer: () => void;
    checkPositions: () => void;
    setPosition: (user: TypeUser, position: number) => void;
  };
  leave: (user: TypeUser) => void;
  join: (user: TypeUser) => void;
};

const rooms: Map<string, TypeRoom> = new Map();

export const createRoom = (user: TypeUser, io: Server) => () => {
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
      win: null,
      status: "off",
      tablePositions: new Array(9),
      initPlayer: "one",
      currentPlayer: "one",
      setGameState(status, condition) {
        if (condition) room.game.status = status;
      },
      alternatePlayer() {
        room.game.currentPlayer === "one"
          ? (room.game.currentPlayer = "two")
          : (room.game.currentPlayer = "one");
      },
      checkPositions() {
        const { tablePositions } = room.game;
        const { hasWin } = verifyPositions(tablePositions);
        console.log("Alguém VENCEU ?", hasWin);
        // TODO VERIFICAR SE DEU EMPATE
      },
      setPosition(user, position) {
        const currentPlayerID = room.getPlayerId(room.game.currentPlayer);
        if (
          currentPlayerID !== user.id ||
          room.game.status !== "game" ||
          position < 0 ||
          position > 8 ||
          room.game.tablePositions[position]
        )
          return;

        room.game.tablePositions[position] = room.game.currentPlayer;
        room.game.alternatePlayer();
        room.game.checkPositions();
        room.emitRoom();
      },
    },
    emitRoom() {
      if (room.playerOne) {
        io.to(room.playerOne).emit(EVENT_NAMES.UPDATE_ROOM, room);
      }
      if (room.playerTwo)
        io.to(room.playerTwo).emit(EVENT_NAMES.UPDATE_ROOM, room);
    },
    leave(user) {
      user.roomConnection = null;
      room.playerOne === user.id
        ? (room.playerOne = null)
        : (room.playerTwo = null);
      room.game.setGameState("end", room.game.status === "game");
      room.emitRoom();
    },
    join(user) {
      user.roomConnection = (callback) => callback(room);
      room.playerOne === user.id
        ? (room.playerOne = user.id)
        : (room.playerTwo = user.id);
      room.game.setGameState(
        "game",
        !!((room.playerOne || room.playerTwo) && room.game.status === "off")
      );
      room.emitRoom();
    },
  };
  rooms.set(room.id, room);
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

export const gameSetPosition = (user: TypeUser) => (position: number) => {
  if (!user.roomConnection)
    return user.reply.error(EVENT_NAMES.LEAVE_ROOM, "you're not in a room");
  user.roomConnection((room) => {
    room.game.setPosition(user, position);
  });
};

export const disconnectRoom = (user: TypeUser) => {
  if (user.roomConnection)
    user.roomConnection((room) => {
      room.leave(user);
    });
};

export const allRooms = () => () => console.log(rooms.values());
