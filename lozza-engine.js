/**
 * Lozza Engine Wrapper for lichessmove.js
 * Lozza is a UCI JavaScript engine that runs as a Web Worker
 * This wrapper provides a consistent UCI interface for the lichess bot
 */

function createLozzaEngine() {
  console.log('Initializing Lozza engine (UCI Worker)...');
  
  // Create a blob URL for the Lozza worker
  // We need to import lozza.js from the CDN since it's loaded via @require
  const lozzaWorkerCode = `
    // Import lozza.js from GitHub (same as @require)
    self.importScripts('https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/lozza.js');
    
    // The imported lozza.js will handle UCI protocol automatically via onmessage
  `;
  
  const blob = new Blob([lozzaWorkerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const lozzaWorker = new Worker(workerUrl);
  
  // Initialize Lozza with UCI commands
  lozzaWorker.postMessage("uci");
  lozzaWorker.postMessage("ucinewgame");
  lozzaWorker.postMessage("setoption name Hash value 16");
  
  // Return the engine object with UCI interface
  return {
    postMessage: function(cmd) {
      lozzaWorker.postMessage(cmd);
    },
    set onmessage(handler) {
      lozzaWorker.onmessage = function(e) {
        // Lozza sends data as e.data, convert to string format for consistency
        handler(e.data);
      };
    }
  };
}

// Export for use in lichessmove.js
if (typeof window !== 'undefined') {
  window.createLozzaEngine = createLozzaEngine;
}
