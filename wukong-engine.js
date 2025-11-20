/**
 * Wukong Engine Wrapper for lichessmove.js
 * Wukong uses its own custom API (not UCI protocol)
 * This wrapper translates UCI commands to Wukong's API
 */

function createWukongEngine() {
  console.log('Initializing Wukong engine (custom API)...');
  
  // Create Wukong engine instance (doesn't need board size for calculations)
  const wukong = new Engine(8, '#f0d9b5', '#b58863', '#646f40');
  
  // Set hash table size (16 MB)
  wukong.setHashSize(16);
  
  // Message handler storage
  let messageHandler = null;
  
  // UCI to Wukong command translator
  const engine = {
    postMessage: function(cmd) {
      try {
        // Parse UCI commands and translate to Wukong API
        if (cmd === 'uci') {
          // Respond with engine identification
          if (messageHandler) {
            messageHandler('id name Wukong ' + wukong.VERSION);
            messageHandler('id author Code Monkey King');
            messageHandler('uciok');
          }
        } else if (cmd === 'ucinewgame') {
          // Reset the engine for a new game
          wukong.setBoard(wukong.START_FEN);
          if (messageHandler) {
            messageHandler('readyok');
          }
        } else if (cmd === 'isready') {
          // Engine is always ready
          if (messageHandler) {
            messageHandler('readyok');
          }
        } else if (cmd.startsWith('position fen ')) {
          // Extract FEN string and set board position
          const fenMatch = cmd.match(/^position fen (.+?)(?:\s+moves\s+(.+))?$/);
          if (fenMatch) {
            const fen = fenMatch[1];
            const moves = fenMatch[2];
            
            // Set the board position
            wukong.setBoard(fen);
            
            // Apply moves if present
            if (moves) {
              wukong.loadMoves(moves);
            }
          }
        } else if (cmd.startsWith('position startpos')) {
          // Set starting position
          const movesMatch = cmd.match(/^position startpos(?:\s+moves\s+(.+))?$/);
          wukong.setBoard(wukong.START_FEN);
          
          // Apply moves if present
          if (movesMatch && movesMatch[1]) {
            wukong.loadMoves(movesMatch[1]);
          }
        } else if (cmd.startsWith('go ')) {
          // Parse search parameters
          const depthMatch = cmd.match(/depth\s+(\d+)/);
          const timeMatch = cmd.match(/movetime\s+(\d+)/);
          
          // Default to depth 3 or extract from command
          let depth = depthMatch ? parseInt(depthMatch[1]) : 3;
          const movetime = timeMatch ? parseInt(timeMatch[1]) : 100;
          
          // Set time control if movetime is specified
          if (timeMatch) {
            wukong.setTimeControl({
              timeSet: 1,
              stopTime: Date.now() + movetime,
              stopped: 0,
              time: movetime
            });
          }
          
          // Execute search asynchronously to not block
          setTimeout(() => {
            try {
              const bestMove = wukong.search(depth);
              
              if (bestMove && messageHandler) {
                // Convert move to UCI string format
                const moveStr = wukong.moveToString(bestMove);
                messageHandler('bestmove ' + moveStr);
              }
            } catch (error) {
              console.error('Wukong search error:', error);
              // Send a fallback response
              if (messageHandler) {
                messageHandler('bestmove 0000');
              }
            }
          }, 1);
        } else if (cmd.startsWith('setoption name Hash value ')) {
          // Set hash table size
          const hashMatch = cmd.match(/setoption name Hash value (\d+)/);
          if (hashMatch) {
            const hashSize = parseInt(hashMatch[1]);
            wukong.setHashSize(hashSize);
          }
        }
        // Ignore other UCI commands that don't apply to Wukong
      } catch (error) {
        console.error('Wukong command error:', error, 'Command:', cmd);
      }
    },
    
    set onmessage(handler) {
      messageHandler = handler;
    }
  };
  
  return engine;
}

// Export for use in lichessmove.js
if (typeof window !== 'undefined') {
  window.createWukongEngine = createWukongEngine;
}
