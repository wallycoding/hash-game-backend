import { SocketIo } from "../types";

const createReply = (socket: SocketIo) => {

    const replyController = {
        done(event: string, data?: any) {
            socket.emit(event, null, data);
        },
        error(event: string, error: any) {
            socket.emit(`${event}-response`, error)
        }
    }
    return replyController;

}

export default createReply;