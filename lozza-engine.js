function createLozzaEngine() {
  console.log('Initializing Lozza engine (UCI Worker)...');

  const lozzaWorkerCode = `
    // Import lozza.js from GitHub (same as @require)
    self.importScripts('https://raw.githubusercontent.com/reductionfear/lkbot/refs/heads/main/lozza.js');

    // --- Lozza browser/worker override: disable fs.readFileSync path ---
    (function() {
      try {
        // In the worker, NET_LOCAL is a global from lozza.js (no window here)
        if (typeof NET_LOCAL !== "undefined") {
          NET_LOCAL = 1;
        }

        if (typeof getWeightsBuffer === "function") {
          // Override getWeightsBuffer in the worker global scope
          const oldFn = getWeightsBuffer;
          console.log("[lozza-engine] Overriding getWeightsBuffer() inside worker");

          self.getWeightsBuffer = function() {
            var hex = (typeof WEIGHTS_HEX === "string" ? WEIGHTS_HEX : "").replace(/\\s+/g, "");

            if (hex.length > 0) {
              var n = hex.length >> 1;
              var bytes = new Uint8Array(n);
              for (var i = 0, j = 0; j < n; i += 2, j++) {
                bytes[j] = parseInt(hex.slice(i, i + 2), 16);
              }
              return bytes;
            }

            var nWeights =
                NET_I_SIZE * NET_H1_SIZE   // input→hidden
              + NET_H1_SIZE                // bias
              + NET_H1_SIZE * 2            // output weights
              + 1;                         // output bias

            return new Int16Array(nWeights);
          };
        }
      } catch (e) {
        console.error("[lozza-engine] Failed to override getWeightsBuffer in worker", e);
      }
    })();
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
