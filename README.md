# LKBot - Lichess Chess Bot with Multi-Engine Support

A fully automated Lichess bot with support for multiple chess engines: Stockfish8, Lozza, and Wukong.

**Note:** This bot now properly integrates all three engines by adapting them to work in the userscript environment. Lozza and Wukong are pure JavaScript engines that are called directly, while Stockfish8 is WebAssembly-based.

## Features

- **Multi-Engine Support**: Three separate UserScripts, each optimized for a specific chess engine
  - **Stockfish8**: Strong UCI-compliant engine
  - **Lozza**: UCI Javascript chess engine with [NNUE evaluation](https://github.com/op12no2/lozza/wiki/Lozza's-net)
  - **Wukong**: JavaScript chess engine by Code Monkey King
- **Automated Play**: Fully automated gameplay on Lichess.org
- **Simple Setup**: Each UserScript is self-contained with a single @require

## Usage

### Installing the UserScript

1. Install a userscript manager in your browser (e.g., Tampermonkey, Violentmonkey)
2. Choose and install ONE of the following scripts:
   - `lichessmove-stockfish.js` - For Stockfish engine
   - `lichessmove-lozza.js` - For Lozza engine
   - `lichessmove-wukong.js` - For Wukong engine
3. Navigate to https://lichess.org

### Selecting an Engine

Simply install the UserScript for your preferred engine. Each script is dedicated to a single engine:

- **lichessmove-stockfish.js**: Uses only the Stockfish engine
- **lichessmove-lozza.js**: Uses only the Lozza engine
- **lichessmove-wukong.js**: Uses only the Wukong engine

### Engine Characteristics

- **Stockfish8**: Best overall strength, UCI-compliant
- **Lozza**: Good balance of speed and strength, NNUE evaluation
- **Wukong**: Fast and lightweight (~1920 ELO)

## About the Engines

### Lozza

A UCI Javascript chess engine with [NNUE evaluation](https://github.com/op12no2/lozza/wiki/Lozza's-net). Try it here:-

https://op12no2.github.io/lozza-ui/play.htm

Lozza was primarily created for use in browsers, but can also be used with traditional chess UIs via Node - and because of that, on pretty-much any platform. 

The code is best read using a folding editor. Start/end fold markers are ```/*{{{  fold name*/``` and ```/*}}}*/```.

#### Basic use in a browser

The `lozza.js` file in this repository is browser-safe and can be used in Web Workers or Tampermonkey userscripts without Node.js dependencies.

**Using the worker wrapper (recommended):**

```javascript
// Load lozza.js and lozza-engine.js via script tags or @require
// Then create an engine instance:
const engine = window.createLozzaEngine();

engine.onmessage = function(data) {
  console.log(data);  // UCI responses as strings
};

engine.postMessage('uci');
engine.postMessage('ucinewgame');
engine.postMessage('position startpos');
engine.postMessage('go depth 10');
```

**Direct worker usage:**

```javascript
var lozza = new Worker('lozza.js');      

lozza.onmessage = function (e) {
  $('#dump').append(e.data);             // assuming jquery and a div called #dump
                                         // parse messages from here as required
};

lozza.postMessage('uci');                // lozza uses the uci communication protocol
lozza.postMessage('ucinewgame');         // reset tt
lozza.postMessage('position startpos');
lozza.postMessage('go depth 10');        // 10 ply search
```

**Note about NNUE weights:** The browser build in this repository runs without NNUE evaluation weights by default. The engine uses a zero-initialized buffer as fallback, making it functional but significantly weaker. For full strength, you need to:
1. Obtain or train the `quantised.bin` weights file
2. Convert it to hex format
3. Populate the `WEIGHTS_HEX` constant in `lozza.js`

For the original Lozza releases with weights included, see: https://github.com/op12no2/lozza/releases

Try this example here:-

https://op12no2.github.io/lozza-ui/ex.htm

#### More examples

A sister repo has more browser-based examples for playing and analysing etc. with Lozza.

https://github.com/op12no2/lozza-ui

You can try them here:-

https://op12no2.github.io/lozza-ui/play.htm

#### Play Lozza offline in chess user interfaces

Lozza can be used in popular chesss user interfaces like Banksia, Winboard, Arena and CuteChess via Node. Download the latest ```LozzaN.zip``` release and then follow the instructions in the wiki.   

https://github.com/op12no2/lozza/releases

https://github.com/op12no2/lozza/wiki/Loading-Lozza-into-chess-user-interfaces

### Wukong

A JavaScript chess engine by Code Monkey King. Rated approximately 1920 ELO, Wukong is fast and lightweight, perfect for quick games.

## Technical Details

Each UserScript is self-contained and includes:

1. **Engine Integration**: Built-in wrapper code that interfaces with the engine
2. **Single Dependency**: Only requires the chess engine JavaScript file
3. **Lichess Bot Logic**: Complete WebSocket interception and game automation

### Engine-Specific Scripts

- **lichessmove-stockfish.js**: 
  - Single @require: stockfish8.js (Emscripten/WebAssembly)
  - Built-in Stockfish wrapper (Worker-like interface provided by Emscripten)
  - Configures default settings (Skill Level 10, Hash 16MB, 1 thread)
  - **Status:** ✅ Working - Uses WebAssembly compiled engine

- **lichessmove-lozza.js**: 
  - Dual @require: lozza.js (Pure JavaScript) + lozza-engine.js (Worker wrapper)
  - Uses worker-based UCI engine interface via `createLozzaEngine()`
  - Matches the Stockfish-style engine pattern for consistency
  - Configures hash table (16MB)
  - **Status:** ✅ Updated - Now uses worker-based wrapper with browser-safe lozza.js

- **lichessmove-wukong.js**: 
  - Single @require: wukong.js (Pure JavaScript)
  - Creates `Engine` instance with UCI translation layer
  - Translates UCI commands to Wukong's custom API (setBoard, search, moveToString)
  - **Status:** ✅ Fixed - Now properly instantiates Engine with correct parameters

### Recent Fixes (November 2024)

**Browser-Safe Lozza Engine Integration**

The Lozza engine has been updated to work cleanly in browser/Tampermonkey environments without Node.js dependencies:

1. **lozza.js is now browser-safe:**
   - Changed `NET_LOCAL` from `0` to `1` to avoid Node.js `fs.readFileSync` calls
   - Updated `getWeightsBuffer()` to:
     - Guard all `fs` operations with proper Node environment checks
     - Provide zero-initialized fallback buffer (394,754 bytes) when NNUE weights are unavailable
     - Warn users about missing weights and reduced strength
   - Guarded all Node-only operations (`process.exit`, `process.stdout.write`, `fs.writeFileSync`) with `nodeHost` checks
   - Engine can now be imported via `importScripts()` in Web Workers without errors

2. **lozza-engine.js provides consistent UCI interface:**
   - Creates a Web Worker that imports lozza.js dynamically
   - Tries local path first, then falls back to GitHub CDN
   - Returns an engine object with `postMessage()` and `onmessage` interface matching Stockfish wrapper
   - Initializes with standard UCI commands (`uci`, `ucinewgame`, hash configuration)

3. **lichessmove-lozza.js aligned with Stockfish pattern:**
   - Now uses `createLozzaEngine()` instead of direct `uciExec` calls
   - Removed `postMessage` interception workaround
   - Cleaner, more maintainable implementation matching `lichessmove-stockfish.js`

**NNUE Weights Note:** The browser build runs without NNUE weights by default (using zero-initialized buffer). This makes the engine significantly weaker but functional. To enable full strength:
- Convert `quantised.bin` to hex format
- Populate the `WEIGHTS_HEX` constant in `lozza.js` with the hex string
- See Lozza documentation for details on generating weights

**Test Results:** All browser integration tests pass successfully:
- ✅ Direct `importScripts()` of lozza.js works without Node.js errors
- ✅ Worker-based engine wrapper creates successfully
- ✅ UCI protocol commands (`uci`, `isready`, `position`, `go`) work correctly
- ✅ Engine produces valid `bestmove` responses

![Lozza Browser Test Results](https://github.com/user-attachments/assets/9c4c0c9e-86bc-4728-9e43-39c676dcd299)

### December 2024 Fixes

**Problem:** Lozza and Wukong engines were unable to read or send moves because their integration code assumed a Web Worker environment, but userscripts load engines directly into the page context.

**Solution:**
1. **Lozza:** Changed to call `uciExec()` function directly (exposed in global scope) and intercept `postMessage` for responses
2. **Wukong:** Fixed Engine constructor call with proper parameters and improved async handling

These engines now work like Stockfish does - they can read positions from Lichess and send back moves properly.

### Integration

Each bot intercepts WebSocket communication with Lichess to:
1. Receive position updates (FEN strings)
2. Calculate best moves using the selected engine
3. Send moves back to the Lichess server

All engine wrappers provide a consistent UCI interface:
```javascript
chessEngine.postMessage(command);  // Send UCI commands
chessEngine.onmessage = handler;   // Receive responses
```

## Acknowledgements

### Lozza Engine

https://nodejs.org - Node

https://github.com/jw1912/bullet - bullet network trainer

https://www.chessprogramming.org/Main_Page - Chess programming wiki

https://computerchess.org.uk/ccrl/4040 - CCRL rating list

https://backscattering.de/chess/uci - UCI protocol

https://discord.gg/uM8J3x46 - Engine Programming Discord

https://talkchess.com - Talkchess forums

https://www.chessprogramming.org/Fruit - Early versions of Lozza used a HCE based on Fruit 2.1

### Stockfish Engine

Stockfish is a powerful open-source chess engine available at https://stockfishchess.org/

### Wukong Engine

Wukong JavaScript chess engine by Code Monkey King

## License

Please refer to individual engine licenses:
- Stockfish: GPL v3
- Lozza: MIT License
- Wukong: Check the original repository for license details

## Disclaimer

This bot is for educational purposes only. Using automated bots on Lichess may violate their Terms of Service. Use at your own risk.








