import { io } from "socket.io-client";

const socket = io("https://todo-list-collab-server.onrender.com");
export default socket;