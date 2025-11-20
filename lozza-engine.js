function createLozzaEngine() {
  console.log('Initializing Lozza engine (UCI Worker)...');

  const lozzaWorkerCode = `
    // Set the path for quantised.bin before importing lozza.js
    // This allows the engine to fetch NNUE weights from GitHub
    self.NET_WEIGHTS_PATH = 'https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/quantised.bin';
    
    // Import lozza.js from GitHub (same as @require)
    self.importScripts('https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/lozza.js');
    
    console.log('[lozza-engine] Loaded lozza.js with weights path:', self.NET_WEIGHTS_PATH);
  `;

  const blob = new Blob([lozzaWorkerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const lozzaWorker = new Worker(workerUrl);

  lozzaWorker.postMessage("uci");
  lozzaWorker.postMessage("ucinewgame");
  lozzaWorker.postMessage("setoption name Hash value 16");

  return {
    postMessage(cmd) {
      lozzaWorker.postMessage(cmd);
    },
    set onmessage(handler) {
      lozzaWorker.onmessage = function(e) {
        handler(e.data);
      };
    }
  };
}
