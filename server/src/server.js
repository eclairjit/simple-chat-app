import { WebSocketServer } from "ws";
import app from "./app.js";

const PORT = 3000;

// create a http server
const httpServer = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// create a web socket server
const wss = new WebSocketServer({ server: httpServer });

/*
message format:
{
    type: "message" | "initiate",
    message?: string,
}
*/

let first = null; // to store the websocket object of one client
let second = null; // to store the websocket object of the other client

wss.on("connection", function connection(ws) {
	ws.on("error", console.error);

	ws.on("message", function message(data) {
		const message = JSON.parse(data);

		// initiation request
		if (message.type === "initiate") {
			if (!first) {
				first = ws;

				console.log("First client is set.");

				first.send(
					JSON.stringify({
						type: "initiate-response",
						message: "You have successfully initiated the connection.",
					})
				);
			} else if (!second) {
				second = ws;

				console.log("Second client is set.");

				second.send(
					JSON.stringify({
						type: "initiate-response",
						message: "You have successfully initiated the connection.",
						success: true,
					})
				);
			} else {
				ws.send(
					JSON.stringify({
						type: "initiate-response",
						message: "Two users are already connected. Please try again later.",
						success: true,
					})
				);
			}

			// uninitiation request
		} else if (message.type === "uninitiate") {
			if (ws == first) {
				first = null;
				console.log("First client uninitiated.");
			} else if (ws == second) {
				second = null;
				console.log("Second client uninitiated.");
			}

			// message sent to deliver to the other client
		} else if (message.type === "message") {
			if (!first || !second) {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "You are not connected to any user.",
					})
				);
			} else {
				const receiver = ws === first ? second : first;

				receiver.send(JSON.stringify(message));
			}

			// unidentifiable message type
		} else {
			ws.send(
				JSON.stringify({
					type: "error",
					message: "Invalid message type. Please use 'initiate' or 'message'.",
				})
			);
		}
	});
});

wss.on("close", () => {
	wss.close();
	console.log("WebSocket server closed");
	process.exit(0);
});
