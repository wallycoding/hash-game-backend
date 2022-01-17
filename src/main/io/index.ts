import type { Server } from "socket.io";
import routes from "./events";

const ioController = (io: Server) => {

    io.on("connection", (socket) => {
        console.log("USER CONNECTED:", socket.id);
        routes(socket);
    });

}


export default ioController;