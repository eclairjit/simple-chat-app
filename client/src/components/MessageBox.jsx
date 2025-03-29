function MessageBox({ type, message }) {
	return type === "received" ? (
		<div className="w-full flex px-2 my-4 justify-start">
			<div className="max-w-80 bg-zinc-800 rounded-md p-2 w-fit">{message}</div>
		</div>
	) : (
		<div className="w-full flex px-2 my-4 justify-end">
			<div className="max-w-80 bg-blue-800 rounded-md p-2 w-fit">{message}</div>
		</div>
	);
}

export default MessageBox;
