# 📡 Pokeverse Scribble — WebSocket API Documentation

This documentation outlines the WebSocket-based (STOMP) API for real-time gameplay in **Pokeverse Scribble**, including the message routes, their payloads, and how clients should interact with the system.

---

## 🔌 Connection Overview

* **WebSocket Endpoint:**
  `ws://<your-domain>/ws`

* **Protocol:** STOMP over WebSocket

---

## 📍 WebSocket Messaging Map

### 1. 🔊 Room Chat

* **SEND:**
  `SEND /chat/{roomId}`

* **SUBSCRIBE:**
  `SUBSCRIBE /topic/room/{roomId}/chat`

* **Payload:** [`MessageDTO`](#message-dto)

---

### 2. 🚀 Start Game

* **SEND:**
  `SEND /rooms/{roomId}/{hostId}/start`

* **SUBSCRIBE:**
  `SUBSCRIBE /topic/room/{roomId}/start`

* **Payload:** *(none)*

* **Triggered by:** The room host to start the game.

---

### 3. 🎮 Start Game Rounds

* **SEND:**
  `SEND /game/round/{roomId}`

* **SUBSCRIBE:**
  `SUBSCRIBE /topic/rooms/{roomId}/game`

* **Payload:** *(none)*

* **Server pushes:** round start, turn info, etc.

---

### 4. ✍️ Set Word to Guess

* **SEND:**
  `SEND /game/round/{roomId}/to/guess`

* **SUBSCRIBE (optional broadcast):**
  Server may or may not broadcast this (typically hidden).

* **Payload:** [`RoundDTO`](#round-dto)

---

### 5. ❓ Get Word to Guess

* **SEND:**
  `SEND /game/round/{roomId}/get/guess`

* **Used by:** guessing players or game master logic.

* **SUBSCRIBE:** *(typically internal or direct response)*

---

### 6. ✅ Submit Answer

* **SEND:**
  `SEND /game/round/{roomId}/answer`

* **SUBSCRIBE:**
  `SUBSCRIBE /topic/rooms/{roomId}/game`

* **Payload:** [`AnswerDTO`](#answer-dto)

* **Server pushes:** correctness, points update, etc.

---

## 📦 Payload Schemas

### 🧩 `MessageDTO`

```json
{
  "username": "ChattyPlayer",
  "message": "Nice drawing!"
}
```

| Field      | Type   | Description          |
| ---------- | ------ | -------------------- |
| `username` | String | Name of the player   |
| `message`  | String | Chat message content |

---

### 🎨 `RoundDTO`

```json
{
  "userId": 101,
  "toGuess": "Dragon"
}
```

| Field     | Type   | Description               |
| --------- | ------ | ------------------------- |
| `userId`  | Long   | ID of the drawer          |
| `toGuess` | String | Word/phrase to be guessed |

---

### ✏️ `AnswerDTO`

```json
{
  "userId": 201,
  "answer": "Dragon",
  "time": 25
}
```

| Field    | Type   | Description                       |
| -------- | ------ | --------------------------------- |
| `userId` | Long   | ID of the answering player        |
| `answer` | String | Player’s guessed word             |
| `time`   | Int    | Time (in seconds) taken to answer |

---

## 🧠 Sample Game Flow

### 1. Join WebSocket

```javascript
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);
```

---

### 2. Subscribe to Room Topics

```javascript
stompClient.subscribe('/topic/room/123/chat', onChat);
stompClient.subscribe('/topic/room/123/start', onStart);
stompClient.subscribe('/topic/rooms/123/game', onGameUpdate);
```

---

### 3. Send Messages

```javascript
// Send a chat message
stompClient.send('/chat/123', {}, JSON.stringify({ username: 'Alice', message: 'Hi!' }));

// Host starts game
stompClient.send('/rooms/123/101/start', {}, {});

// Drawer sets word
stompClient.send('/game/round/123/to/guess', {}, JSON.stringify({ userId: 101, toGuess: 'Pikachu' }));

// Player submits answer
stompClient.send('/game/round/123/answer', {}, JSON.stringify({ userId: 202, answer: 'Pikachu', time: 28 }));
```

---

## 📌 Notes

* The backend pushes updates via `/topic/...` topics.
* The frontend must handle incoming broadcasts to update UI.
* Authentication should be added for production (e.g. via JWT headers or WebSocket interceptors).
* Game logic (turns, scoring, word visibility) is enforced server-side.

---