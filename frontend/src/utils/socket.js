import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // à modifier si backend en ligne plus tard

export default socket;