// ==UserScript==
// @name         lichessmove
// @description  Fully automated lichess bot
// @author       Nuro
// @match        *://lichess.org/*
// @run-at       document-start
// @grant        none
// @require      https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/stockfish8.js
// @require      https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/lozza.js
// @require      https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/wukong.js
// ==/UserScript==

// Configuration: Select which engine to use ('stockfish', 'lozza', or 'wukong')
const ENGINE_TYPE = 'stockfish';  // Change this to 'lozza' or 'wukong' to use different engines

let chessEngine;
let currentFen = "";
let bestMove;
let webSocketWrapper = null;
let gameId = null;
let isWhite = true;
let timeLimitMs = 50; // Time limit for engine calculations in milliseconds

function initializeChessEngine() {
  switch(ENGINE_TYPE.toLowerCase()) {
    case 'stockfish':
      console.log('Initializing Stockfish engine...');
      chessEngine = window.STOCKFISH();
      chessEngine.postMessage("setoption name Skill Level value 10");
      chessEngine.postMessage("setoption name Hash value 1");
      chessEngine.postMessage("setoption name Threads value 1");
      break;
      
    case 'lozza':
      console.log('Initializing Lozza engine...');
      // Create a Worker-like interface for Lozza
      chessEngine = createLozzaWorker();
      break;
      
    case 'wukong':
      console.log('Initializing Wukong engine...');
      // Create a Worker-like interface for Wukong
      chessEngine = createWukongWorker();
      break;
      
    default:
      console.error('Unknown engine type:', ENGINE_TYPE);
      console.log('Falling back to Stockfish engine...');
      chessEngine = window.STOCKFISH();
      chessEngine.postMessage("setoption name Skill Level value 10");
      chessEngine.postMessage("setoption name Hash value 1");
      chessEngine.postMessage("setoption name Threads value 1");
  }
}

// Create a Worker-like interface for Lozza
function createLozzaWorker() {
  const lozzaWorker = new Worker(URL.createObjectURL(new Blob([
    document.querySelector('script[src*="lozza.js"]').textContent
  ], {type: 'application/javascript'})));
  
  return {
    postMessage: function(cmd) {
      lozzaWorker.postMessage(cmd);
    },
    set onmessage(handler) {
      lozzaWorker.onmessage = function(e) {
        handler(e.data);
      };
    }
  };
}

// Create a Worker-like interface for Wukong
function createWukongWorker() {
  // Wukong doesn't use UCI protocol, so we need to wrap it
  const wukongEngine = new Engine(8, '#f0d9b5', '#b58863', '#646f40');
  
  return {
    postMessage: function(cmd) {
      // Parse UCI commands and translate to Wukong API
      if (cmd.startsWith('position fen ')) {
        const fen = cmd.substring('position fen '.length);
        wukongEngine.setBoard(fen);
      } else if (cmd.startsWith('go ')) {
        // Extract depth or time parameters
        const depthMatch = cmd.match(/depth (\d+)/);
        const timeMatch = cmd.match(/movetime (\d+)/);
        
        const depth = depthMatch ? parseInt(depthMatch[1]) : 3;
        const time = timeMatch ? parseInt(timeMatch[1]) : 50;
        
        // Search for best move
        setTimeout(() => {
          const move = wukongEngine.search(depth);
          if (move && this._onmessageHandler) {
            this._onmessageHandler('bestmove ' + move.string);
          }
        }, time);
      }
    },
    set onmessage(handler) {
      this._onmessageHandler = handler;
    },
    _onmessageHandler: null
  };
}

function completeFen(partialFen) {
    // Complete a partial FEN string to support castling
    // A full FEN has 6 parts: pieces, turn, castling, en-passant, halfmove, fullmove
    // Lichess typically sends only the first 2 parts (pieces and turn)
    
    let fenParts = partialFen.split(' ');
    
    // If we already have a complete FEN, return it
    if (fenParts.length === 6) {
        return partialFen;
    }
    
    // Add castling rights (assume all castling is available)
    if (fenParts.length === 2) {
        fenParts.push('KQkq'); // Castling availability
    }
    
    // Add en passant target square (- means no en passant)
    if (fenParts.length === 3) {
        fenParts.push('-');
    }
    
    // Add halfmove clock (for 50-move rule, start at 0)
    if (fenParts.length === 4) {
        fenParts.push('0');
    }
    
    // Add fullmove number (start at 1)
    if (fenParts.length === 5) {
        fenParts.push('1');
    }
    
    return fenParts.join(' ');
}

function interceptWebSocket() {
    let webSocket = window.WebSocket;
    const webSocketProxy = new Proxy(webSocket, {
        construct: function (target, args) {
            let wrappedWebSocket = new target(...args);
            webSocketWrapper = wrappedWebSocket;

            // ---- MODIFICATION START ----
            wrappedWebSocket.addEventListener("message", function (event) {
                let message;
                try {
                    message = JSON.parse(event.data);
                } catch (e) {
                    return; // Ignore non-JSON messages
                }

                // Handle gameFull message for game initialization
                if (message.type === "gameFull" && message.id) {
                    gameId = message.id;
                    isWhite = message.white.id === lichess.socket.settings.userId;
                    console.log("Game ID:", gameId);
                    console.log("Playing as white:", isWhite);
                }

                // Handle game end
                if (message.type === "gameState" && message.status >= 30) {
                    handleGameEnd();
                }

                // Use the message type 't' to decide what to do
                switch (message.t) {
                    // This is a "fall-through" case.
                    // It will execute the same code for both 'd' and 'move' types.
                    case 'd':
                    case 'move':
                        console.log("Received game state/move update:", message.t, message);

                        // The important check: Does this message contain the board state?
                        if (message.d && typeof message.d.fen === "string") {
                            currentFen = message.d.fen;

                            // 'ply' is a counter that helps determine whose turn it is.
                            // If ply is odd, it's Black's turn to move. If even, it's White's.
                            // The FEN is for the position BEFORE the move in the message,
                            // so we need to know whose turn it is now.
                            let isWhitesTurn = message.d.ply % 2 === 0;

                            if (isWhitesTurn) {
                                currentFen += " w";
                            } else {
                                currentFen += " b";
                            }

                            // Complete the FEN string with castling rights and other fields
                            // to enable castling moves
                            currentFen = completeFen(currentFen);

                            // We have the FEN, now calculate the move
                            calculateMove();
                        }
                        break;

                    case 'clockInc':
                        console.log("Clock increment received. Ignoring.", message.d);
                        break;

                    case 'crowd':
                    case 'mlat':
                        // Also ignore crowd (spectator) and latency updates
                        break;

                    default:
                        // Log any other message types for debugging
                        console.log("Received unhandled message type:", message.t, message);
                }
            });
            // ---- MODIFICATION END ----

            return wrappedWebSocket;
        }
    });

    window.WebSocket = webSocketProxy;
}

function calculateMove() {
    chessEngine.postMessage("position fen " + currentFen);
    chessEngine.postMessage(`go depth 2 movetime ${timeLimitMs}`);
    // chessEngine.postMessage(`go depth 1`); // Uncomment for depth 1 for immediate moves
}

function setupChessEngineOnMessage() {
    chessEngine.onmessage = function (event) {
        if (event && event.includes("bestmove")) {
            bestMove = event.split(" ")[1];
            webSocketWrapper.send(JSON.stringify({
                t: "move",
                d: { u: bestMove, b: 1, l: 10000, a: 1 }
            }));
        }
    };
}

function handleGameEnd() {
    console.log("Game ended, initiating rematch/new opponent...");
    // Option 1: Rematch
    // webSocketWrapper.send(JSON.stringify({ t: "rematch", d: gameId }));

    // Option 2: New opponent
    webSocketWrapper.send(JSON.stringify({ t: 'challenge', d: { dest: 'auto', rated: !1, clock: { limit: 60, increment: 5, emerg: 30 } } }));
}

initializeChessEngine();
interceptWebSocket();
setupChessEngineOnMessage();
