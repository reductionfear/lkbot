/**
 * Stockfish Engine Wrapper for lichessmove.js
 * Stockfish is emscripten-compiled and available via window.STOCKFISH()
 * This wrapper provides a consistent UCI interface for the lichess bot
 */

function createStockfishEngine() {
  console.log('Initializing Stockfish engine (emscripten)...');
  
  // Stockfish is emscripten-compiled and creates a Worker-like object
  const stockfish = window.STOCKFISH();
  
  // Configure Stockfish with default settings
  stockfish.postMessage("uci");
  stockfish.postMessage("setoption name Skill Level value 10");
  stockfish.postMessage("setoption name Hash value 16");
  stockfish.postMessage("setoption name Threads value 1");
  stockfish.postMessage("ucinewgame");
  
  // Return the engine object with UCI interface
  return {
    postMessage: function(cmd) {
      stockfish.postMessage(cmd);
    },
    set onmessage(handler) {
      stockfish.onmessage = handler;
    }
  };
}

// Export for use in lichessmove.js
if (typeof window !== 'undefined') {
  window.createStockfishEngine = createStockfishEngine;
}
