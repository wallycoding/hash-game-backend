# Tic Tac Toe
> This is an back-end application using WebSocket with TypeScript.

### Clone repository
```sh
git clone https://github.com/wallycoding/hash-game-backend
```
### Configure
Access the project directory
```sh
cd hash-game-backend
```
Make a file in root named of `.env` with this content
```
PORT=4000
ORIGIN_ACCEPTED=*
```
Now install the dev dependencies and production dependeces
npm `npm install`
yarn `yarn`

### listened events
 - connect **(default)**
 - room events
   - update-room 
     > send all room updates

     > **`<room-updated>`**: is a object room

     > **actions**:
     
     - **response** `client.on("update-room", (<room-updated>) => {...})` 
   - create-room
     > create a room for players.

     > **`<room>`**: is a object room
     
     > **actions**:
     
     - **emit** `client.emit("create-room");`
     - **response** `client.on("create-room-response", (<room>) => {...})`

   - join-room
     > join in the room

     > **`<room-id>`**: the id of the room to be able to enter
     
     > **actions**:
     
     - **emit** `client.emit("join-room", <room-id>);`
     - **response** **`to update-room`**

   - leave-room
     > leave the room

     > **actions**:
     
     - **emit** `client.emit("leave-room");`
     - **response** **`to update-room`**

   - game events
     - game-set-position
       > the game has an array with 9 positions, each position marks a move

       > **`<position>`**: is a number 0 to 8
       
       > **actions**:
       
       - **emit** `client.emit("game-set-position", <position>)`
       - **response** **`to update-room`**
      
     - game-reset
       > the game is reset to start if the game status has ended 
       
       > **actions**:
       
       - **emit** `client.emit("game-reset")`
       - **response** **`to update-room`**
 - disconnect **(default)**

### Types for TypeScript
```ts
// Sub Types
export type TypeStatusGame = "off" | "game" | "end";
export type TypePlayer = "one" | "two";
export type TypePlayerID = string | null;
export type TypeWin = null | "one" | "two" | "no-winner";

// Object Room
export type TypeRoom = {
  id: string;
  playerOne: TypePlayerID;
  playerTwo: TypePlayerID;
  game: {
    win: TypeWin;
    status: TypeStatusGame;
    tablePositions: TypePlayer[];
    currentPlayer: TypePlayer;
  };
};
```
