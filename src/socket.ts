import { io } from "socket.io-client";

const socket = io("https://todo-list-collab-server.onrender.com"); // same as backend
export default socket;