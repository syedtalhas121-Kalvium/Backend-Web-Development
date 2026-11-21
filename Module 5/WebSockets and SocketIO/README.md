# WebSockets & Socket.IO: Real-Time Comments

The backend serves a REST API but has no real-time capability. Users viewing a resource have to refresh the page to see new content. Add a Socket.IO server that broadcasts a `commentAdded` event to everyone watching a resource whenever a new comment is posted, and implement the join, leave, and disconnection lifecycle handlers.

## Project structure
- `src/app.js`: Express + HTTP server setup (given; do not modify).
- `src/socket.js`: Socket.IO implementation (assignment file).
- `public/index.html`: browser demo (given; do not modify).
- `tests/run.js`: automated tests (given; do not modify).

## Setup
```bash
npm install
npm start
npm test
```

## Requirements
Implement `initSocket(httpServer)` in `src/socket.js`:
1. Create `new Server(httpServer, { cors: { origin: '*' } })`.
2. On `connection`, log `[+] connected: <socket.id>`.
3. On `joinRoom`, join the room supplied in `data.room`.
4. On `leaveRoom`, leave the room supplied in `data.room`.
5. On `newComment`, broadcast `commentAdded` with the received data to all sockets in `data.room`, including the sender, using `io.to(data.room).emit()`.
6. On `disconnect`, log `[-] disconnected: <socket.id> (<reason>)`.
7. Return the Socket.IO `io` instance.

Do not modify `src/app.js`, `public/index.html`, or `tests/run.js`. All implementation belongs in `src/socket.js`.

## Test scenarios
The provided suite checks connection IDs, sender and peer room delivery, no delivery after leaving a room, and connection/disconnection logs. Run `npm test`; expected output is `Results: 5 passed, 0 failed`.

## Manual verification
Open two tabs at `http://localhost:3000`, connect both, join `post-42`, and post from one tab. Both should receive `commentAdded`. Make the second tab leave and post again; only the first tab should receive the event.

## Design note
Socket.IO rooms scope broadcasts to interested clients. When running multiple server instances, use the Socket.IO Redis adapter so room membership and broadcasts are coordinated across instances.
