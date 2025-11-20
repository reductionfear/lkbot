# Lozza

A UCI Javascript chess engine with [NNUE evaluation](https://github.com/op12no2/lozza/wiki/Lozza's-net). Try her here:-

https://op12no2.github.io/lozza-ui/play.htm

Lozza was primarily created for use in browsers, but can also be used with traditional chess UIs via Node - and because of that, on pretty-much any platform. 

The code is best read using a folding editor. Start/end fold markers are ```/*{{{  fold name*/``` and ```/*}}}*/```.

## Basic use in a browser

All you need is ```lozza.js``` from the latest ```lozzaN.zip``` release.  

https://github.com/op12no2/lozza/releases

Here is a little example to do a 10 ply search:-

```Javascript
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

Try this example here:-

https://op12no2.github.io/lozza-ui/ex.htm

## More examples

A sister repo has more browser-based examples for playing and analysing etc. with Lozza.

https://github.com/op12no2/lozza-ui

You can try them here:-

https://op12no2.github.io/lozza-ui/play.htm

## Play Lozza offline in chess user interfaces

Lozza can be used in popular chesss user interfaces like Banksia, Winboard, Arena and CuteChess via Node. Download the latest ```LozzaN.zip``` release and then follow the instructions in the wiki.   

https://github.com/op12no2/lozza/releases

https://github.com/op12no2/lozza/wiki/Loading-Lozza-into-chess-user-interfaces

## Acknowledgements

https://nodejs.org - Node

https://github.com/jw1912/bullet - bullet network trainer

https://www.chessprogramming.org/Main_Page - Chess programming wiki

https://computerchess.org.uk/ccrl/4040 - CCRL rating list

https://backscattering.de/chess/uci - UCI protocol

https://discord.gg/uM8J3x46 - Engine Programming Discord

https://talkchess.com - Talkchess forums

https://www.chessprogramming.org/Fruit - Early versions of Lozza used a HCE based on Fruit 2.1








