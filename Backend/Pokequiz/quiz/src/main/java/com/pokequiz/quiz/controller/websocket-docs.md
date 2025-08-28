

# PokeQuiz API Documentation

This document outlines the API endpoints for the PokeQuiz application, covering both traditional RESTful interactions and real-time WebSocket (STOMP) communication.

-----

## 1\. WebSocket API Reference

The PokeQuiz application utilizes WebSockets with STOMP for real-time game updates, chat, and answer submissions.

**WebSocket Endpoint:** `ws://localhost:8080/ws` (for development)

Clients should connect to this endpoint and then use STOMP `SUBSCRIBE` and `SEND` frames to interact with the various channels described below.

-----

### 1.1. Inbound Channels (Client to Server - `SEND` to `/app/...`)

These are the destinations where clients can send messages to the server.

#### 1.1.1. Send Chat Message

* **Description:** Allows a player to send a chat message to a specific game room.
* **Destination:** `/app/chat/{roomId}`
* **Method:** `SEND`
* **`roomId` (Path Variable):** The unique ID of the room where the message should be sent.
* **Payload (`Message` DTO - JSON):**
  ```json
  {
    "userId": "string",   
    "username": "string", 
    "content": "string"  
  }
  ```
* **Example Client Send:**
  ```javascript
  stompClient.send('/app/chat/101', {}, JSON.stringify({
      userId: 'userABC',
      username: 'Ash',
      content: 'Good luck, trainers!'
  }));
  ```
* **Server Behavior:** The server receives this message and broadcasts it to the corresponding outbound chat topic for the room.

#### 1.1.2. Start Game

* **Description:** Initiates the quiz game for a specific room. Typically triggered by the room host.
* **Destination:** `/app/start/{roomId}`
* **Method:** `SEND`
* **`roomId` (Path Variable):** The unique ID of the room where the game should start.
* **Payload:** (Empty or optional simple text)
* **Example Client Send:**
  ```javascript
  stompClient.send('/app/start/101', {}, '');
  ```
* **Server Behavior:** Sets the room's `started` flag to `true` and sends a "Game started" message to `/topic/rooms/{roomId}/game`.

#### 1.1.3. Start Sending Questions

* **Description:** Instructs the server to begin broadcasting quiz questions to the room at a fixed interval. This initiates the question rounds.
* **Destination:** `/app/game/{roomId}/{hostId}`
* **Method:** `SEND`
* **`roomId` (Path Variable):** The unique ID of the room.
* **`hostId` (Path Variable):** The user ID of the room host, used for authorization to prevent non-hosts from starting questions.
* **Payload:** (Empty)
* **Example Client Send:**
  ```javascript
  stompClient.send('/app/game/101/500', {}, '');
  ```
* **Server Behavior:**
    * Initiates a scheduled task (if not already running) to send questions every 30 seconds.
    * Fetches a new, unique question (not previously used in this room) from the `GameService`.
    * Increments the `currentRound` of the room.
    * Saves the `RoomQuiz` entry to track the question's usage in the room.
    * Broadcasts the `GameQuestionDto` to the `/topic/rooms/{roomId}/game` topic.
    * Stops broadcasting if max rounds are reached, no more unique questions are available, or the room is no longer active.

#### 1.1.4. Submit Answer for Validation

* **Description:** Players send their chosen answer for a specific question to the server for validation.
* **Destination:** `/app/game/answer/validation`
* **Method:** `SEND`
* **Payload (`WsAnswerValidationDTO` DTO - JSON):**
  ```json
  {
    "userId": 1,         
    "roomId": 123,         
    "questionId": 456,   
    "answer": "string", 
    "correct": false 
  }
  ```
* **Example Client Send:**
  ```javascript
  stompClient.send('/app/game/answer/validation', {}, JSON.stringify({
      userId: 201,
      roomId: 101,
      questionId: 301,
      answer: 'Pikachu',
      correct: false // Client provides, but server validates
  }));
  ```
* **Server Behavior:**
    * Validates the `roomId`, `questionId`, `userId`, and the `answer` itself (ensuring it's not null/empty).
    * Fetches the correct answer for the question.
    * Determines if the player's submitted answer is correct.
    * Creates and saves a `PlayerAnswer` record.
    * Updates the player's score if the answer was correct (+10 points).
    * Broadcasts the `WsAnswerValidationDTO` (with the server-determined `correct` status) to the `/topic/rooms/{roomId}/game` topic.

-----

### 1.2. Outbound Channels (Server to Client - `SUBSCRIBE` to `/topic/...`)

These are the topics that clients can subscribe to receive real-time updates from the server.

#### 1.2.1. Room Game & General Updates

* **Description:** This is a versatile topic for various game-related updates, including game start/end notifications, new questions, and answer validation results.
* **Destination:** `/topic/rooms/{roomId}/game`
* **Method:** `SUBSCRIBE`
* **`roomId` (Path Variable):** The unique ID of the room to subscribe to.
* **Payload:** (Varies based on event, can be one of the following JSON structures)
    * **Game Start/End Notification (String):**
      ```json
      "Game started"
      ```
      ```json
      "Game ended"
       ```
      ```json
      "Answer cannot be null" 
       ```
      ```json
      "Question not found in this room" 
      ```
    * **New Question (`GameQuestionDto` - JSON):**
      ```json
      {
        "question": {
          "id": 1,
          "question": "Which Pokémon is known as the Electric-type?",
          "difficulty": "Easy",
          "region": "Kanto",
          "quizType": "Trivia",
          "options": ["Pikachu", "Charmander", "Squirtle", "Bulbasaur"],
          "correctAnswer": "Pikachu"
        },
        "questionNumber": 5 
      }
      ```
    * **Answer Validation Result (`WsAnswerValidationDTO` - JSON):**
      ```json
      {
        "userId": 201,
        "roomId": 101,
        "questionId": 301,
        "answer": "Pikachu",
        "correct": true
      }
      ```
* **Example Client Subscribe:**
  ```javascript
  stompClient.subscribe('/topic/rooms/101/game', function(message) {
      console.log("Received game update:", JSON.parse(message.body));
  });
  ```

#### 1.2.2. Room Chat Messages

* **Description:** Clients subscribe here to receive chat messages sent by other players in the room.
* **Destination:** `/topic/room/{roomId}/chat`
* **Method:** `SUBSCRIBE`
* **`roomId` (Path Variable):** The unique ID of the room to receive chat messages from.
* **Payload (`Message` DTO - JSON):**
  ```json
  {
    "userId": "string",
    "username": "string",
    "content": "string"
  }
  ```
* **Example Client Subscribe:**
  ```javascript
  stompClient.subscribe('/topic/room/101/chat', function(message) {
      console.log("New chat message:", JSON.parse(message.body));
  });
  ```

-----

## 2\. HTTP REST API Reference

The `WebSocketController` also exposes one standard HTTP REST endpoint.

-----

### 2.1. Get Real-time Player Statistics

* **Endpoint:** `GET /ws/stats/{roomId}/{playerId}`
* **Description:** Retrieves a player's real-time quiz statistics and detailed answers for questions answered in a specific room.
* **`roomId` (Path Variable):** Unique identifier of the quiz room (e.g., `101`).
* **`playerId` (Path Variable):** Unique identifier of the player whose statistics are requested (e.g., `202`).
* **Responses:**
    * **`200 OK` (Success):**
        * **Description:** Successfully retrieved player statistics.
        * **Body (`StatsDTO` - JSON):**
          ```json
          {
            "userId": 202,
            "username": "PlayerName",
            "totalPoints": 150,
            "detailedAnswers": [
              {
                "questionId": 301,
                "question": "What is the capital of France?",
                "correctAnswer": "Paris",
                "isCorrect": true,
                "selectedOption": "Paris",
                "timeTaken": 10 
              }
            ]
          }
          ```
    * **`400 Bad Request` (Client Error):**
        * **Description:** Invalid request, typically if the `roomId` or `playerId` is not found.
        * **Body (String):** Example: `"Room not found with ID: 101"` or `"Player not found with ID: 202"`
    * **`200 OK` (No Content for Player):**
        * **Description:** Player found, but no answers have been recorded for them yet.
        * **Body (String):** Example: `"No answers found for player ID: 202"`

-----