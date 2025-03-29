import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import MessageBox from "./components/MessageBox.jsx";

function App() {
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState("");

	/*
	message format of the state:
	type: "sent" | "received",
	message: string
	*/

	// to initiate the current websocket client
	const initiate = (socket) => {
		socket.onopen = () => {
			socket.send(
				JSON.stringify({
					type: "initiate",
				})
			);
		};

		console.log("Initiation message sent to server.");
	};

	// uninitiate the current websocket client
	const uninitiate = () => {
		if (!socket) {
			return;
		}

		socket.send(
			JSON.stringify({
				type: "uninitiate",
			})
		);

		console.log("Uninitiating message send to the server.");
	};

	//initiate receiving message
	const startReceiving = (socket) => {
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);

			// initiate response
			if (message.type === "initiate-response") {
				console.log("Initiation response message received.");

				if (message.success) {
					toast.success(message.message);
				} else {
					toast.error(message.message);
				}

				// message sent by the other user
			} else if (message.type === "message") {
				console.log(`Message received: ${message.message}`);

				setMessages((prevMessages) => [
					...prevMessages,
					{
						type: "received",
						message: message.message,
					},
				]);

				// error message
			} else {
				console.error("An error received.");
				toast.error(message.message);
			}
		};
	};

	// form submission handler
	const handleSubmit = (e) => {
		e.preventDefault();

		if (!message) {
			return;
		}

		if (!socket) {
			toast.error("Socket is not initialized");
			return;
		}

		// send message only if socket connection is on
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(
				JSON.stringify({
					type: "message",
					message: message,
				})
			);

			setMessages((prevMessages) => [
				...prevMessages,
				{ type: "sent", message: message },
			]);

			setMessage("");
		} else {
			toast.error("Socket is not open");
		}
	};

	useEffect(() => {
		console.log("Creating a websocket.");

		const newSocket = new WebSocket("ws://localhost:3000");
		setSocket(newSocket);

		initiate(newSocket);
		startReceiving(newSocket);
	}, []);

	// to uninitiate the websocket instance before the page is closed
	window.addEventListener("beforeunload", (e) => {
		uninitiate();
	});

	return (
		<>
			<Toaster />
			<div className="h-screen w-screen bg-zinc-950 text-zinc-200 flex flex-col items-center">
				<h1 className="text-center py-2 text-xl">Simple Chat Application</h1>
				<div className="w-96 flex-col items-center">
					{messages.map((message, index) => (
						<MessageBox
							key={index}
							type={message.type}
							message={message.message}
						/>
					))}
				</div>
				<div className="px-4 py-2 fixed bottom-0 w-full">
					<form onSubmit={handleSubmit} className="w-full">
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="text-zinc-950 w-full bg-zinc-200 p-2 rounded-2xl focus:outline-none focus:text-zinc-950"
						/>
					</form>
				</div>
			</div>
		</>
	);
}

export default App;
