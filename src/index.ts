require("dotenv").config();
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import socketIoEvents from "./main/io";
const app = express();
app.use(cors({ origin: process.env.ORIGIN_ACCEPTED }));
const server = new http.Server(app);
const socketIO = new Server(server, {
  cors: {
    origin: process.env.ORIGIN_ACCEPTED,
  },
});

socketIoEvents(socketIO);

server.listen(process.env.PORT, () => {
  console.log(`RUNNING in http://localhost:${process.env.PORT}/`);
});
