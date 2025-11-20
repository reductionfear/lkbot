"use strict"
//
// https://github.com/op12no2/lozza
//

const BUILD = "9";

//{{{  dev/release
//
// See https://github.com/op12no2/lozza/wiki/Making-a-release.
//

const NET_LOCAL        = 0;
const NET_NAME         = 'farm1';
const NET_SB           = '500';
const NET_WEIGHTS_FILE = '/home/xyzzy/lozza/nets/' + NET_NAME + '/lozza-' + NET_SB + '/quantised.bin';
const BENCH_DEPTH      = 12;

//}}}
//{{{  constants

const INT32_MAX =  2147483647;
const INT32_MIN = -2147483648;

const UINT32_MAX = 4294967295;

const NET_QA      = 255;
const NET_QB      = 64;
const NET_QAB     = NET_QA * NET_QB;
const NET_SCALE   = 400;
const NET_I_SIZE  = 768;
const NET_H1_SIZE = 256;

const IMAP = new Uint32Array(15 * 256);

const MATERIAL = new Int32Array([0,100,394,388,588,1207,10000]);
const ADJACENT = new Uint8Array(144);

const MAX_PLY         = 128;
const MAX_MOVES       = 256;
const LMR_LOOKUP      = new Uint8Array(MAX_PLY * MAX_MOVES);
const INF             = 32000;
const MATE            = 31000;
const MINMATE         = 30000;
const TTSCORE_UNKNOWN = INF + 1;
const EMPTY           = 0;

const WHITE = 0x0;
const BLACK = 0x8;

const PIECE_MASK  = 0x7;
const COLOR_MASK  = 0x8;
const COLOUR_MASK = 0x8;

const TT_EMPTY = 0;
const TT_EXACT = 1;
const TT_BETA  = 2;
const TT_ALPHA = 3;

const BASE_HASH       = UINT32_MAX;
const BASE_PROMOTES   = BASE_HASH       - 1000;
const BASE_GOODTAKES  = BASE_PROMOTES   - 1000;
const BASE_EVENTAKES  = BASE_GOODTAKES  - 1000;
const BASE_EPTAKES    = BASE_EVENTAKES  - 1000;
const BASE_MATEKILLER = BASE_EPTAKES    - 1000;
const BASE_MYKILLERS  = BASE_MATEKILLER - 1000;
const BASE_GPKILLERS  = BASE_MYKILLERS  - 1000;
const BASE_CASTLING   = BASE_GPKILLERS  - 1000;
const BASE_BADTAKES   = BASE_CASTLING   - 1000;
const BASE_HISSLIDE   = (UINT32_MAX >>> 1) - 10000;
const BASE_SLIDE      = 100;
const BASE_PRUNABLE   = BASE_BADTAKES;

const MOVE_TO_BITS     = 0;
const MOVE_FR_BITS     = 8;
const MOVE_TOOBJ_BITS  = 16;
const MOVE_FROBJ_BITS  = 20;
const MOVE_PROMAS_BITS = 29;

const MOVE_TO_MASK      = 0x000000FF;
const MOVE_FR_MASK      = 0x0000FF00;
const MOVE_TOOBJ_MASK   = 0x000F0000;
const MOVE_FROBJ_MASK   = 0x00F00000;
const MOVE_LEGAL_MASK   = 0x01000000;
const MOVE_EPTAKE_MASK  = 0x02000000;
const MOVE_EPMAKE_MASK  = 0x04000000;
const MOVE_CASTLE_MASK  = 0x08000000;
const MOVE_PROMOTE_MASK = 0x10000000;
const MOVE_PROMAS_MASK  = 0x60000000;  // NBRQ

const MOVE_CLEAN_MASK   = (~MOVE_LEGAL_MASK & 0xFFFFFFFF) | 0;
const MOVE_SPECIAL_MASK = MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_EPMAKE_MASK; // need extra work in make move
const MOVE_NOISY_MASK   = MOVE_TOOBJ_MASK | MOVE_EPTAKE_MASK;

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;
const EDGE   = 7;
const NO_Z   = 8;

const W_PAWN   = PAWN;
const W_KNIGHT = KNIGHT;
const W_BISHOP = BISHOP;
const W_ROOK   = ROOK;
const W_QUEEN  = QUEEN;
const W_KING   = KING;

const B_PAWN   = PAWN   | BLACK;
const B_KNIGHT = KNIGHT | BLACK;
const B_BISHOP = BISHOP | BLACK;
const B_ROOK   = ROOK   | BLACK;
const B_QUEEN  = QUEEN  | BLACK;
const B_KING   = KING   | BLACK;

//
// E === EMPTY, X = OFF BOARD, - === CANNOT HAPPEN
//
//               0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
//               E  W  W  W  W  W  W  X  -  B  B  B  B  B  B  -
//               E  P  N  B  R  Q  K  X  -  P  N  B  R  Q  K  -
//

const IS_O      = new Uint8Array([0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0]);
const IS_E      = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_OE     = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0]);

const IS_P      = new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
const IS_N      = new Uint8Array([0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
const IS_NBRQKE = new Uint8Array([1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0]);
const IS_RQKE   = new Uint8Array([1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0]);
const IS_QKE    = new Uint8Array([1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0]);
const IS_K      = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
const IS_KN     = new Uint8Array([0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]);

const IS_W      = new Uint8Array([0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WNK    = new Uint8Array([0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WE     = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WP     = new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WN     = new Uint8Array([0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WNBRQ  = new Uint8Array([0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WB     = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WBQ    = new Uint8Array([0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WRQ    = new Uint8Array([0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const IS_WQ     = new Uint8Array([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

const IS_B      = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0]);
const IS_BNK    = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]);
const IS_BE     = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0]);
const IS_BP     = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
const IS_BN     = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
const IS_BNBRQ  = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0]);
const IS_BB     = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
const IS_BBQ    = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0]);
const IS_BRQ    = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
const IS_BQ     = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);

const W_PROMOTE_SQ = new Uint8Array([0,26, 27, 28, 29, 30, 31, 32, 33]);
const B_PROMOTE_SQ = new Uint8Array([0,110,111,112,113,114,115,116,117]);

const A1 = 110, B1 = 111, C1 = 112, D1 = 113, E1 = 114, F1 = 115, G1 = 116, H1 = 117;
const A8 = 26,  B8 = 27,  C8 = 28,  D8 = 29,  E8 = 30,  F8 = 31,  G8 = 32,  H8 = 33;

const SQA1 = 110, SQB1 = 111, SQC1 = 112, SQD1 = 113, SQE1 = 114, SQF1 = 115, SQG1 = 116, SQH1 = 117;
const SQA2 = 98,  SQB2 = 99,  SQC2 = 100, SQD2 = 101, SQE2 = 102, SQF2 = 103, SQG2 = 104, SQH2 = 105;
const SQA3 = 86,  SQB3 = 87,  SQC3 = 88,  SQD3 = 89,  SQE3 = 90,  SQF3 = 91,  SQG3 = 92,  SQH3 = 93;
const SQA4 = 74,  SQB4 = 75,  SQC4 = 76,  SQD4 = 77,  SQE4 = 78,  SQF4 = 79,  SQG4 = 80,  SQH4 = 81;
const SQA5 = 62,  SQB5 = 63,  SQC5 = 64,  SQD5 = 65,  SQE5 = 66,  SQF5 = 67,  SQG5 = 68,  SQH5 = 69;
const SQA6 = 50,  SQB6 = 51,  SQC6 = 52,  SQD6 = 53,  SQE6 = 54,  SQF6 = 55,  SQG6 = 56,  SQH6 = 57;
const SQA7 = 38,  SQB7 = 39,  SQC7 = 40,  SQD7 = 41,  SQE7 = 42,  SQF7 = 43,  SQG7 = 44,  SQH7 = 45;
const SQA8 = 26,  SQB8 = 27,  SQC8 = 28,  SQD8 = 29,  SQE8 = 30,  SQF8 = 31,  SQG8 = 32,  SQH8 = 33;

const MOVE_E1G1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | G1;
const MOVE_E1C1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | C1;
const MOVE_E8G8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | G8;
const MOVE_E8C8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | C8;

const QPRO = (QUEEN-2)  << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const RPRO = (ROOK-2)   << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const BPRO = (BISHOP-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const NPRO = (KNIGHT-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;

const WHITE_RIGHTS_KING  = 0x00000001;
const WHITE_RIGHTS_QUEEN = 0x00000002;
const BLACK_RIGHTS_KING  = 0x00000004;
const BLACK_RIGHTS_QUEEN = 0x00000008;
const WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
const BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;

const MASK_RIGHTS = new Int8Array([
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, ~8, 15, 15, 15, ~12,15, 15, ~4, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, ~2, 15, 15, 15, ~3, 15, 15, ~1, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15
]);

const RANK_VECTOR = new Uint8Array([0,1,2,2,4,5,6]);  // for move sorting

const B88 = new Uint8Array([
  26, 27, 28, 29, 30, 31, 32, 33,
  38, 39, 40, 41, 42, 43, 44, 45,
  50, 51, 52, 53, 54, 55, 56, 57,
  62, 63, 64, 65, 66, 67, 68, 69,
  74, 75, 76, 77, 78, 79, 80, 81,
  86, 87, 88, 89, 90, 91, 92, 93,
  98, 99, 100,101,102,103,104,105,
  110,111,112,113,114,115,116,117
]);

const COORDS = [
  '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
  '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
  '??', '??', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', '??', '??',
  '??', '??', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', '??', '??',
  '??', '??', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', '??', '??',
  '??', '??', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', '??', '??',
  '??', '??', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', '??', '??',
  '??', '??', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', '??', '??',
  '??', '??', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', '??', '??',
  '??', '??', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', '??', '??',
  '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
  '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'
];

const NAMES    = ['-','P','N','B','R','Q','K','-'];
const PROMOTES = ['n','b','r','q'];                  // 0-3 encoded in move

const RANK = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
  0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
  0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
  0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
  0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
  0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
  0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]);

const FILE = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

const NULL144 = new Uint8Array(144);

const MAP = Object.seal({
  'p': B_PAWN,
  'n': B_KNIGHT,
  'b': B_BISHOP,
  'r': B_ROOK,
  'q': B_QUEEN,
  'k': B_KING,
  'P': W_PAWN,
  'N': W_KNIGHT,
  'B': W_BISHOP,
  'R': W_ROOK,
  'Q': W_QUEEN,
  'K': W_KING
});

const UMAP = Object.seal({
  9:  'p',
  10: 'n',
  11: 'b',
  12: 'r',
  13: 'q',
  14: 'k',
  1:  'P',
  2:  'N',
  3:  'B',
  4:  'R',
  5:  'Q',
  6:  'K'
});

const RANK2W = new Uint8Array([
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 7, 14, 21, 28, 28, 21, 14, 7, 0, 0,
  0, 0, 6, 12, 18, 24, 24, 18, 12, 6, 0, 0,
  0, 0, 5, 10, 15, 20, 20, 15, 10, 5, 0, 0,
  0, 0, 4, 8,  12, 16, 16, 12, 8,  4, 0, 0,
  0, 0, 3, 6,  9,  12, 12, 9,  6,  3, 0, 0,
  0, 0, 2, 4,  6,  8,  8,  6,  4,  2, 0, 0,
  0, 0, 1, 2,  3,  4,  4,  3,  2,  1, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0
]);

const RANK2B = new Uint8Array([
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 1, 2,  3,  4,  4,  3,  2,  1, 0, 0,
  0, 0, 2, 4,  6,  8,  8,  6,  4,  2, 0, 0,
  0, 0, 3, 6,  9,  12, 12, 9,  6,  3, 0, 0,
  0, 0, 4, 8,  12, 16, 16, 12, 8,  4, 0, 0,
  0, 0, 5, 10, 15, 20, 20, 15, 10, 5, 0, 0,
  0, 0, 6, 12, 18, 24, 24, 18, 12, 6, 0, 0,
  0, 0, 7, 14, 21, 28, 28, 21, 14, 7, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0
]);

const CENTRE = new Uint8Array([
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 1, 2,  3,  4,  4,  3,  2,  1, 0, 0,
  0, 0, 2, 4,  6,  8,  8,  6,  4,  2, 0, 0,
  0, 0, 3, 6,  9,  12, 12, 9,  6,  3, 0, 0,
  0, 0, 4, 8,  12, 16, 16, 12, 8,  4, 0, 0,
  0, 0, 4, 8,  12, 16, 16, 12, 8,  4, 0, 0,
  0, 0, 3, 6,  9,  12, 12, 9,  6,  3, 0, 0,
  0, 0, 2, 4,  6,  8,  8,  6,  4,  2, 0, 0,
  0, 0, 1, 2,  3,  4,  4,  3,  2,  1, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0,
  0, 0, 0, 0,  0,  0,  0,  0,  0,  0, 0, 0
]);

const SLIDE_SCORES = [
  NULL144,
  RANK2W, CENTRE, CENTRE, CENTRE, CENTRE, CENTRE,
  NULL144,
  NULL144,
  RANK2B, CENTRE, CENTRE, CENTRE, CENTRE, CENTRE
];

const ALIGNED = Array(144);

//{{{  bench fens

const BENCHFENS = [

"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkQ - 0 1",
"r3k2r/2pb1ppp/2pp1q2/p7/1nP1B3/1P2P3/P2N1PPP/R2QK2R w KQkq a6 0 14",
"4rrk1/2p1b1p1/p1p3q1/4p3/2P2n1p/1P1NR2P/PB3PP1/3R1QK1 b - - 2 24",
"r3qbrk/6p1/2b2pPp/p3pP1Q/PpPpP2P/3P1B2/2PB3K/R5R1 w - - 16 42",
"6k1/1R3p2/6p1/2Bp3p/3P2q1/P7/1P2rQ1K/5R2 b - - 4 44",
"8/8/1p2k1p1/3p3p/1p1P1P1P/1P2PK2/8/8 w - - 3 54",
"7r/2p3k1/1p1p1qp1/1P1Bp3/p1P2r1P/P7/4R3/Q4RK1 w - - 0 36",
"r1bq1rk1/pp2b1pp/n1pp1n2/3P1p2/2P1p3/2N1P2N/PP2BPPP/R1BQ1RK1 b - - 2 10",
"3r3k/2r4p/1p1b3q/p4P2/P2Pp3/1B2P3/3BQ1RP/6K1 w - - 3 87",
"2r4r/1p4k1/1Pnp4/3Qb1pq/8/4BpPp/5P2/2RR1BK1 w - - 0 42",
"4q1bk/6b1/7p/p1p4p/PNPpP2P/KN4P1/3Q4/4R3 b - - 0 37",
"2q3r1/1r2pk2/pp3pp1/2pP3p/P1Pb1BbP/1P4Q1/R3NPP1/4R1K1 w - - 2 34",
"1r2r2k/1b4q1/pp5p/2pPp1p1/P3Pn2/1P1B1Q1P/2R3P1/4BR1K b - - 1 37",
"r3kbbr/pp1n1p1P/3ppnp1/q5N1/1P1pP3/P1N1B3/2P1QP2/R3KB1R b KQkq b3 0 17",
"8/6pk/2b1Rp2/3r4/1R1B2PP/P5K1/8/2r5 b - - 16 42",
"1r4k1/4ppb1/2n1b1qp/pB4p1/1n1BP1P1/7P/2PNQPK1/3RN3 w - - 8 29",
"8/p2B4/PkP5/4p1pK/4Pb1p/5P2/8/8 w - - 29 68",
"3r4/ppq1ppkp/4bnp1/2pN4/2P1P3/1P4P1/PQ3PBP/R4K2 b - - 2 20",
"5rr1/4n2k/4q2P/P1P2n2/3B1p2/4pP2/2N1P3/1RR1K2Q w - - 1 49",
"1r5k/2pq2p1/3p3p/p1pP4/4QP2/PP1R3P/6PK/8 w - - 1 51",
"q5k1/5ppp/1r3bn1/1B6/P1N2P2/BQ2P1P1/5K1P/8 b - - 2 34",
"r1b2k1r/5n2/p4q2/1ppn1Pp1/3pp1p1/NP2P3/P1PPBK2/1RQN2R1 w - - 0 22",
"r1bqk2r/pppp1ppp/5n2/4b3/4P3/P1N5/1PP2PPP/R1BQKB1R w KQkq - 0 5",
"r1bqr1k1/pp1p1ppp/2p5/8/3N1Q2/P2BB3/1PP2PPP/R3K2n b Q - 1 12",
"r1bq2k1/p4r1p/1pp2pp1/3p4/1P1B3Q/P2B1N2/2P3PP/4R1K1 b - - 2 19",
"r4qk1/6r1/1p4p1/2ppBbN1/1p5Q/P7/2P3PP/5RK1 w - - 2 25",
"r7/6k1/1p6/2pp1p2/7Q/8/p1P2K1P/8 w - - 0 32",
"r3k2r/ppp1pp1p/2nqb1pn/3p4/4P3/2PP4/PP1NBPPP/R2QK1NR w KQkq - 1 5",
"3r1rk1/1pp1pn1p/p1n1q1p1/3p4/Q3P3/2P5/PP1NBPPP/4RRK1 w - - 0 12",
"5rk1/1pp1pn1p/p3Brp1/8/1n6/5N2/PP3PPP/2R2RK1 w - - 2 20",
"8/1p2pk1p/p1p1r1p1/3n4/8/5R2/PP3PPP/4R1K1 b - - 3 27",
"8/4pk2/1p1r2p1/p1p4p/Pn5P/3R4/1P3PP1/4RK2 w - - 1 33",
"8/5k2/1pnrp1p1/p1p4p/P6P/4R1PK/1P3P2/4R3 b - - 1 38",
"8/8/1p1kp1p1/p1pr1n1p/P6P/1R4P1/1P3PK1/1R6 b - - 15 45",
"8/8/1p1k2p1/p1prp2p/P2n3P/6P1/1P1R1PK1/4R3 b - - 5 49",
"8/8/1p4p1/p1p2k1p/P2npP1P/4K1P1/1P6/3R4 w - - 6 54",
"8/8/1p4p1/p1p2k1p/P2n1P1P/4K1P1/1P6/6R1 b - - 6 59",
"8/5k2/1p4p1/p1pK3p/P2n1P1P/6P1/1P6/4R3 b - - 14 63",
"8/1R6/1p1K1kp1/p6p/P1p2P1P/6P1/1Pn5/8 w - - 0 67",
"1rb1rn1k/p3q1bp/2p3p1/2p1p3/2P1P2N/PP1RQNP1/1B3P2/4R1K1 b - - 4 23",
"4rrk1/pp1n1pp1/q5p1/P1pP4/2n3P1/7P/1P3PB1/R1BQ1RK1 w - - 3 22",
"r2qr1k1/pb1nbppp/1pn1p3/2ppP3/3P4/2PB1NN1/PP3PPP/R1BQR1K1 w - - 4 12",
"2r2k2/8/4P1R1/1p6/8/P4K1N/7b/2B5 b - - 0 55",
"6k1/5pp1/8/2bKP2P/2P5/p4PNb/B7/8 b - - 1 44",
"2rqr1k1/1p3p1p/p2p2p1/P1nPb3/2B1P3/5P2/1PQ2NPP/R1R4K w - - 3 25",
"r1b2rk1/p1q1ppbp/6p1/2Q5/8/4BP2/PPP3PP/2KR1B1R b - - 2 14",
"6r1/5k2/p1b1r2p/1pB1p1p1/1Pp3PP/2P1R1K1/2P2P2/3R4 w - - 1 36",
"rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
"2rr2k1/1p4bp/p1q1p1p1/4Pp1n/2PB4/1PN3P1/P3Q2P/2RR2K1 w - f6 0 20",
"3br1k1/p1pn3p/1p3n2/5pNq/2P1p3/1PN3PP/P2Q1PB1/4R1K1 w - - 0 23",
"2r2b2/5p2/5k2/p1r1pP2/P2pB3/1P3P2/K1P3R1/7R w - - 23 93"
];

//}}}
//{{{  perft fens

const PERFTFENS = [
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 2, 400,       'cpw-pos1-2'],
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w Q    -  0 1', 3, 4729,      'castling-2'],
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w K    -  0 1', 3, 4686,      'castling-3'],
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w -    -  0 1', 3, 4522,      'castling-4'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b kq   -  0 1', 3, 4893,      'castling-5'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b q    -  0 1', 3, 4729,      'castling-6'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b k    -  0 1', 3, 4686,      'castling-7'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b -    -  0 1', 3, 4522,      'castling-8'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 0, 1,         'cpw-pos1-0'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 1, 20,        'cpw-pos1-1'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 3, 8902,      'cpw-pos1-3'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 4, 197281,    'cpw-pos1-4'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 5, 4865609,   'cpw-pos1-5'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq -  0 1', 1, 42,        'cpw-pos5-1'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq -  0 1', 2, 1352,      'cpw-pos5-2'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq -  0 1', 3, 53392,     'cpw-pos5-3'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -  0 1', 1, 48,        'cpw-pos2-1'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -  0 1', 2, 2039,      'cpw-pos2-2'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -  0 1', 3, 97862,     'cpw-pos2-3'],
  ['fen 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8                         w -    -  0 1', 5, 674624,    'cpw-pos3-5'],
  ['fen n1n5/PPPk4/8/8/8/8/4Kppp/5N1N                           b -    -  0 1', 1, 24,        'prom-1    '],
  ['fen 8/5bk1/8/2Pp4/8/1K6/8/8                                 w -    d6 0 1', 6, 824064,    'ccc-1     '],
  ['fen 8/8/1k6/8/2pP4/8/5BK1/8                                 b -    d3 0 1', 6, 824064,    'ccc-2     '],
  ['fen 8/8/1k6/2b5/2pP4/8/5K2/8                                b -    d3 0 1', 6, 1440467,   'ccc-3     '],
  ['fen 8/5k2/8/2Pp4/2B5/1K6/8/8                                w -    d6 0 1', 6, 1440467,   'ccc-4     '],
  ['fen 5k2/8/8/8/8/8/8/4K2R                                    w K    -  0 1', 6, 661072,    'ccc-5     '],
  ['fen 4k2r/8/8/8/8/8/8/5K2                                    b k    -  0 1', 6, 661072,    'ccc-6     '],
  ['fen 3k4/8/8/8/8/8/8/R3K3                                    w Q    -  0 1', 6, 803711,    'ccc-7     '],
  ['fen r3k3/8/8/8/8/8/8/3K4                                    b q    -  0 1', 6, 803711,    'ccc-8     '],
  ['fen r3k2r/1b4bq/8/8/8/8/7B/R3K2R                            w KQkq -  0 1', 4, 1274206,   'ccc-9     '],
  ['fen r3k2r/7b/8/8/8/8/1B4BQ/R3K2R                            b KQkq -  0 1', 4, 1274206,   'ccc-10    '],
  ['fen r3k2r/8/3Q4/8/8/5q2/8/R3K2R                             b KQkq -  0 1', 4, 1720476,   'ccc-11    '],
  ['fen r3k2r/8/5Q2/8/8/3q4/8/R3K2R                             w KQkq -  0 1', 4, 1720476,   'ccc-12    '],
  ['fen 2K2r2/4P3/8/8/8/8/8/3k4                                 w -    -  0 1', 6, 3821001,   'ccc-13    '],
  ['fen 3K4/8/8/8/8/8/4p3/2k2R2                                 b -    -  0 1', 6, 3821001,   'ccc-14    '],
  ['fen 8/8/1P2K3/8/2n5/1q6/8/5k2                               b -    -  0 1', 5, 1004658,   'ccc-15    '],
  ['fen 5K2/8/1Q6/2N5/8/1p2k3/8/8                               w -    -  0 1', 5, 1004658,   'ccc-16    '],
  ['fen 4k3/1P6/8/8/8/8/K7/8                                    w -    -  0 1', 6, 217342,    'ccc-17    '],
  ['fen 8/k7/8/8/8/8/1p6/4K3                                    b -    -  0 1', 6, 217342,    'ccc-18    '],
  ['fen 8/P1k5/K7/8/8/8/8/8                                     w -    -  0 1', 6, 92683,     'ccc-19    '],
  ['fen 8/8/8/8/8/k7/p1K5/8                                     b -    -  0 1', 6, 92683,     'ccc-20    '],
  ['fen K1k5/8/P7/8/8/8/8/8                                     w -    -  0 1', 6, 2217,      'ccc-21    '],
  ['fen 8/8/8/8/8/p7/8/k1K5                                     b -    -  0 1', 6, 2217,      'ccc-22    '],
  ['fen 8/k1P5/8/1K6/8/8/8/8                                    w -    -  0 1', 7, 567584,    'ccc-23    '],
  ['fen 8/8/8/8/1k6/8/K1p5/8                                    b -    -  0 1', 7, 567584,    'ccc-24    '],
  ['fen 8/8/2k5/5q2/5n2/8/5K2/8                                 b -    -  0 1', 4, 23527,     'ccc-25    '],
  ['fen 8/5k2/8/5N2/5Q2/2K5/8/8                                 w -    -  0 1', 4, 23527,     'ccc-26    '],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq -  0 1', 6, 119060324, 'cpw-pos1-6'],
  ['fen 8/p7/8/1P6/K1k3p1/6P1/7P/8                              w -    -  0 1', 8, 8103790,   'jvm-7     '],
  ['fen n1n5/PPPk4/8/8/8/8/4Kppp/5N1N                           b -    -  0 1', 6, 71179139,  'jvm-8     '],
  ['fen r3k2r/p6p/8/B7/1pp1p3/3b4/P6P/R3K2R                     w KQkq -  0 1', 6, 77054993,  'jvm-9     '],
  ['fen 8/5p2/8/2k3P1/p3K3/8/1P6/8                              b -    -  0 1', 8, 64451405,  'jvm-11    '],
  ['fen r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R         w KQkq -  0 1', 5, 29179893,  'jvm-12    '],
  ['fen 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8                         w -    -  0 1', 7, 178633661, 'jvm-10    '],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -  0 1', 5, 193690690, 'jvm-6     '],
  ['fen 8/2pkp3/8/RP3P1Q/6B1/8/2PPP3/rb1K1n1r                   w -    -  0 1', 6, 181153194, 'ob1       '],
  ['fen rnbqkb1r/ppppp1pp/7n/4Pp2/8/8/PPPP1PPP/RNBQKBNR         w KQkq f6 0 1', 6, 244063299, 'jvm-5     '],
  ['fen 8/2ppp3/8/RP1k1P1Q/8/8/2PPP3/rb1K1n1r                   w -    -  0 1', 6, 205552081, 'ob2       '],
  ['fen 8/8/3q4/4r3/1b3n2/8/3PPP2/2k1K2R                        w K    -  0 1', 6, 207139531, 'ob3       '],
  ['fen 4r2r/RP1kP1P1/3P1P2/8/8/3ppp2/1p4p1/4K2R                b K    -  0 1', 6, 314516438, 'ob4       '],
  ['fen r3k2r/8/8/8/3pPp2/8/8/R3K1RR                            b KQkq e3 0 1', 6, 485647607, 'jvm-1     '],
  ['fen 8/3K4/2p5/p2b2r1/5k2/8/8/1q6                            b -    -  0 1', 7, 493407574, 'jvm-4     '],
  ['fen r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1   w kq   -  0 1', 6, 706045033, 'jvm-2     '],
  ['fen r6r/1P4P1/2kPPP2/8/8/3ppp2/1p4p1/R3K2R                  w KQ   -  0 1', 6, 975944981, 'ob5       ']
];

//}}}

//}}}
//{{{  utilities

//{{{  seal

function seal (o) {
  Object.seal(o);
}

//}}}
//{{{  myround

function myround(x) {
  return Math.sign(x) * Math.round(Math.abs(x));
}

//}}}
//{{{  now

function now() {
  return performance.now() | 0;
}

//}}}

//}}}
//{{{  nodes

//{{{  nodeStruct

function nodeStruct () {

  this.ply             = 0;
  this.childNode       = null;
  this.parentNode      = null;
  this.grandparentNode = null;

  this.moves  = new Uint32Array(MAX_MOVES);
  this.ranks  = new Uint32Array(MAX_MOVES);
  this.moves2 = new Uint32Array(MAX_MOVES);
  this.ranks2 = new Uint32Array(MAX_MOVES);

  this.killer1     = 0;
  this.killer2     = 0;
  this.mateKiller  = 0;
  this.stage       = 0;
  this.numMoves    = 0;
  this.numMoves2   = 0;
  this.next        = 0;
  this.hashMove    = 0;
  this.hashEval    = 0;
  this.base        = 0;
  this.inCheck     = 0;
  this.ev          = 0;

  this.rights = 0;
  this.ep     = 0;
  this.repLo  = 0;
  this.repHi  = 0;
  this.loHash = 0;
  this.hiHash = 0;

  this.net_h1_a = new Int32Array(NET_H1_SIZE);
  this.net_h2_a = new Int32Array(NET_H1_SIZE);

  this.toZ = 0;
  this.frZ = 0;
  this.epZ = 0;

  this.pv    = new Uint32Array(MAX_MOVES);
  this.pvLen = 0;

}

//}}}

//{{{  initNode

function initNode (node) {

  node.killer1    = 0;
  node.killer2    = 0;
  node.mateKiller = 0;
  node.numMoves   = 0;
  node.next       = 0;
  node.hashMove   = 0;
  node.base       = 0;
  node.inCheck    = 0;

  node.toZ = 0;
  node.frZ = 0;
  node.epZ = 0;

}

//}}}
//{{{  cache

function cache (node) {

  node.rights = bdRights;
  node.ep     = bdEp;
  node.repLo  = repLo;
  node.repHi  = repHi;
  node.loHash = loHash;
  node.hiHash = hiHash;

  node.net_h1_a.set(net_h1_a);
  node.net_h2_a.set(net_h2_a);

}

//}}}
//{{{  uncacheA

function uncacheA (node) {

  bdRights = node.rights;
  bdEp     = node.ep;
  repLo    = node.repLo;
  repHi    = node.repHi;
  loHash   = node.loHash;
  hiHash   = node.hiHash;

}

//}}}
//{{{  uncacheB

function uncacheB (node) {

  net_h1_a.set(node.net_h1_a);
  net_h2_a.set(node.net_h2_a);

}

//}}}
//{{{  getNextMove

function getNextMove (node) {

  switch (node.stage) {

    case 0: {
      //{{{  node.moves
      
      if (node.next !== node.numMoves) {
      
        let maxM = 0;
      
        const moves = node.moves;
        const ranks = node.ranks;
        const next  = node.next;
        const num   = node.numMoves;
      
        let maxR = -INF;
        let maxI = 0;
      
        for (let i=next; i < num; i++) {
          if (ranks[i] > maxR) {
            maxR = ranks[i];
            maxI = i;
          }
        }
      
        maxM = moves[maxI]
      
        moves[maxI] = moves[next];
        ranks[maxI] = ranks[next];
      
        node.base = maxR;
      
        node.next++;
      
        return maxM;
      
      }
      
      else {
      
        node.stage++;
        node.next = 0;
      
        rankSlides(node);
      
      }
      
      //}}}
    }

    case 1: {
      //{{{  node.moves2
      
      if (node.next !== node.numMoves2) {
      
        let maxM = 0;
      
        const moves = node.moves2;
        const ranks = node.ranks2;
        const next  = node.next;
        const num   = node.numMoves2;
      
        let maxR = -INF;
        let maxI = 0;
      
        for (let i=next; i < num; i++) {
          if (ranks[i] > maxR) {
            maxR = ranks[i];
            maxI = i;
          }
        }
      
        maxM = moves[maxI]
      
        moves[maxI] = moves[next];
        ranks[maxI] = ranks[next];
      
        node.base = maxR;
      
        node.next++;
      
        return maxM;
      
      }
      
      else {
      
        return 0;
      
      }
      
      //}}}
    }

  }
}

//}}}
//{{{  rankSlides

function rankSlides (node) {

  for (let i=0; i < node.numMoves2; i++) {

    const move  = node.moves2[i];
    const to    = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;
    const frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

    const hisScore = objHistory[(frObj << 8) + to];

    if (hisScore === BASE_HISSLIDE) {

      const fr          = (move & MOVE_FR_MASK) >>> MOVE_FR_BITS;
      const slideScores = SLIDE_SCORES[frObj];

      node.ranks2[i] = BASE_SLIDE + slideScores[to] - slideScores[fr];

    }

    else {

      node.ranks2[i] = hisScore;

    }
  }
}

//}}}
//{{{  addSlide

function addSlide (node, move) {

  const m = move & MOVE_CLEAN_MASK;

  if (m === node.hashMove) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_HASH;
  }

  else if (m === node.mateKiller) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MATEKILLER;
  }

  else if (m === node.killer1) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MYKILLERS + 1;
  }

  else if (m === node.killer2) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MYKILLERS;
  }

  else if (node.grandparentNode !== null && m === node.grandparentNode.killer1) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_GPKILLERS + 1;
  }

  else if (node.grandparentNode !== null && m === node.grandparentNode.killer2) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_GPKILLERS;
  }

  else {
    node.moves2[node.numMoves2++] = move;  // defer ranking until later
  }

}

//}}}
//{{{  addCastle

function addCastle (node, move) {

  const m = move & MOVE_CLEAN_MASK;

  if (m === node.hashMove) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_HASH;
  }

  else if (m === node.mateKiller) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MATEKILLER;
  }

  else if (m === node.killer1) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MYKILLERS + 1;
  }

  else if (m === node.killer2) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_MYKILLERS;
  }

  else if (node.grandparentNode !== null && m === node.grandparentNode.killer1) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_GPKILLERS + 1;
  }

  else if (node.grandparentNode !== null && m === node.grandparentNode.killer2) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_GPKILLERS;
  }

  else {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_CASTLING;
  }

}

//}}}
//{{{  addCapture

function addCapture (node, move) {

  const m = move & MOVE_CLEAN_MASK;

  if (m === node.hashMove) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_HASH;
  }

  else {

    const victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    const attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim > attack) {
      node.moves[node.numMoves]   = move;
      node.ranks[node.numMoves++] = BASE_GOODTAKES + (victim << 6) - attack;
    }

    else if (victim === attack) {
      node.moves[node.numMoves]   = move;
      node.ranks[node.numMoves++] = BASE_EVENTAKES + (victim << 6) - attack;
    }

    else {

      if (m === node.mateKiller) {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_MATEKILLER;
      }

      else if (m === node.killer1) {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_MYKILLERS + 1;
      }

      else if (m === node.killer2) {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_MYKILLERS;
      }

      else if (node.grandparentNode !== null && m === node.grandparentNode.killer1) {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_GPKILLERS + 1;
      }

      else if (node.grandparentNode !== null && m === node.grandparentNode.killer2) {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_GPKILLERS;
      }

      else {
        node.moves[node.numMoves]   = move;
        node.ranks[node.numMoves++] = BASE_BADTAKES + (victim << 6) - attack;
      }

    }
  }
}

//}}}
//{{{  addPromotion

function addPromotion (node, move) {

  const m = move & MOVE_CLEAN_MASK;

  if ((m | QPRO) === node.hashMove) {
    node.moves[node.numMoves]   = move | QPRO;
    node.ranks[node.numMoves++] = BASE_HASH;
  }
  else {
    node.moves[node.numMoves]   = move | QPRO;
    node.ranks[node.numMoves++] = BASE_PROMOTES + QUEEN;
  }

  if ((m | RPRO) === node.hashMove) {
    node.moves[node.numMoves]   = move | RPRO;
    node.ranks[node.numMoves++] = BASE_HASH;
  }
  else {
    node.moves[node.numMoves]   = move | RPRO;
    node.ranks[node.numMoves++] = BASE_PROMOTES + ROOK;
  }

  if ((m | BPRO) === node.hashMove) {
    node.moves[node.numMoves]   = move | BPRO;
    node.ranks[node.numMoves++] = BASE_HASH;
  }
  else {
    node.moves[node.numMoves]   = move | BPRO;
    node.ranks[node.numMoves++] = BASE_PROMOTES + BISHOP;
  }

  if ((m | NPRO) === node.hashMove) {
    node.moves[node.numMoves]   = move | NPRO;
    node.ranks[node.numMoves++] = BASE_HASH;
  }
  else {
    node.moves[node.numMoves]   = move | NPRO;
    node.ranks[node.numMoves++] = BASE_PROMOTES + KNIGHT;
  }

}

//}}}
//{{{  addEPTake

function addEPTake (node, move) {

  const m = move & MOVE_CLEAN_MASK;

  if ((m | MOVE_EPTAKE_MASK) === node.hashMove) {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_HASH;
  }

  else {
    node.moves[node.numMoves]   = move;
    node.ranks[node.numMoves++] = BASE_EPTAKES;
  }

}

//}}}
//{{{  addQMove

function addQMove (node, move) {

  const m = move & MOVE_CLEAN_MASK;
  const n = node.numMoves++;

  node.moves[n] = move;

  if (m === node.hashMove)
    node.ranks[n] = BASE_HASH;

  else if ((move & MOVE_PROMOTE_MASK) !== 0) {
    if ((move & MOVE_NOISY_MASK) !== 0)
      node.ranks[n] = BASE_PROMOTES + ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 8;  // QRBN capture
    else
      node.ranks[n] = BASE_PROMOTES + ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS);      // QRBN slide (allowed in qs)
  }

  else if ((move & MOVE_EPTAKE_MASK) !== 0)
    node.ranks[n] = BASE_EPTAKES;

  else {
    const victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    const attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim > attack)
      node.ranks[n] = BASE_GOODTAKES + (victim << 6) - attack;

    else if (victim === attack)
      node.ranks[n] = BASE_EVENTAKES + (victim << 6) - attack;

    else
      node.ranks[n] = BASE_BADTAKES + (victim << 6) - attack;
  }

}

//}}}
//{{{  addQPromotion

function addQPromotion (node, move) {

  addQMove (node, move | (QUEEN-2)  << MOVE_PROMAS_BITS);
  addQMove (node, move | (ROOK-2)   << MOVE_PROMAS_BITS);
  addQMove (node, move | (BISHOP-2) << MOVE_PROMAS_BITS);
  addQMove (node, move | (KNIGHT-2) << MOVE_PROMAS_BITS);

}

//}}}
//{{{  addKiller

function addKiller (node, score, move) {

  move = move & MOVE_CLEAN_MASK;

  if (move === node.hashMove)
    return;

  if ((move & (MOVE_EPTAKE_MASK | MOVE_PROMOTE_MASK)) !== 0)
    return;  // before killers in move ordering.

  if ((move & MOVE_TOOBJ_MASK) !== 0) {

    const victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    const attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim >= attack)
      return; // before killers in move ordering.
  }

  if (score >= MINMATE && score <= MATE) {
    node.mateKiller = move;
    if (node.killer1 === move)
      node.killer1 = 0;
    if (node.killer2 === move)
      node.killer2 = 0;
    return;
  }

  if (node.killer1 === move || node.killer2 === move) {
    return;
  }

  if (node.killer1 === 0) {
    node.killer1 = move;
    return;
  }

  if (node.killer2 === 0) {
    node.killer2 = move;
    return;
  }

  const tmp    = node.killer1;
  node.killer1 = move;
  node.killer2 = tmp;

}

//}}}

//}}}
//{{{  search

//{{{  report

function report (units, value, depth) {

  let pvStr = 'pv';
  for (let i=rootNode.pvLen-1; i >= 0; i--)
    pvStr += ' ' + formatMove(rootNode.pv[i]);

  const tim     = now() - statsStartTime;
  const nps     = (statsNodes * 1000) / tim | 0;
  const nodeStr = 'nodes ' + statsNodes + ' time ' + tim + ' nps ' + nps;

  const depthStr = 'depth ' + depth + ' seldepth ' + statsSelDepth;
  const scoreStr = 'score ' + units + ' ' + value;
  const hashStr  = 'hashfull ' + (1000 * ttHashUsed / ttSize | 0);

  uciSend('info', depthStr, scoreStr, nodeStr, hashStr, pvStr);

}

//}}}
//{{{  go

function go (maxPly) {

  let bestMoveStr = '';
  let alpha       = 0;
  let beta        = 0;
  let score       = 0;
  let delta       = 0;
  let depth       = 0;

  for (let ply=1; ply <= maxPly; ply++) {
    //{{{  id
    
    alpha = -INF;
    beta  = INF;
    delta = 10;
    depth = ply;
    
    if (ply >= 4) {
      alpha = Math.max(-INF, score - delta);
      beta  = Math.min(INF,  score + delta);
    }
    
    while (1) {
      //{{{  asp
      
      score = rootSearch(rootNode, depth, bdTurn, alpha, beta);
      
      if (statsTimeOut)
        break;
      
      delta += delta/2 | 0;
      
      if (score <= alpha) {
        //{{{  upper bound
        
        beta  = Math.min(INF, ((alpha + beta) / 2) | 0);
        alpha = Math.max(-INF, alpha - delta);
        
        report('upperbound', score, depth);
        
        if (!statsMaxNodes)
          statsBestMove = 0;
        
        //}}}
      }
      
      else if (score >= beta) {
        //{{{  lower bound
        
        beta = Math.min(INF, beta + delta);
        
        report('lowerbound', score, depth);
        
        depth = Math.max(1, depth-1);
        
        //}}}
      }
      
      else {
        //{{{  exact
        
        if (Math.abs(score) > MINMATE) {
        
          let mateScore = (MATE - Math.abs(score)) / 2 | 0;
          if (score < 0)
            mateScore = -mateScore;
        
          report('mate', mateScore, depth);
        
        }
        
        else {
        
          report('cp', score, depth);
        
        }
        
        if (statsBestMove && statsMaxNodes > 0 && statsNodes >= statsMaxNodes)
          statsTimeOut = 1;
        
        break;
        
        //}}}
      }
      
      //}}}
    }
    
    if (statsTimeOut)
      break;
    
    //}}}
  }

  bestMoveStr = formatMove(statsBestMove);

  uciSend('bestmove', bestMoveStr);

}

//}}}
//{{{  rootSearch

function rootSearch (node, depth, turn, alpha, beta) {

  //{{{  check time
  
  node.pvLen = 0;
  
  if (node.childNode === null) {
    statsTimeOut = 1;
    return 0;
  }
  
  //}}}

  statsNodes++;

  const nextTurn = turn ^ COLOR_MASK;
  const oAlpha   = alpha;
  const inCheck  = isKingAttacked(nextTurn);
  const doLMR    = (depth >= 3) | 0;

  let numLegalMoves = 0;
  let numPrunes     = 0;
  let move          = 0;
  let bestMove      = 0;
  let score         = 0;
  let bestScore     = -INF;
  let R             = 0;
  let E             = 0;

  score = ttGet(node, depth, alpha, beta);  // load hash move and hash eval

  node.inCheck = inCheck;
  node.ev      = node.hashEval !== INF ? node.hashEval : evaluate(turn);

  ttUpdateEval(node.ev);
  cache(node);
  genMoves(node, turn);

  while ((move = getNextMove(node)) !== 0) {

    makeMoveA(node, move);

    //{{{  legal?
    
    if ((move & MOVE_LEGAL_MASK) === 0 && isKingAttacked(nextTurn) !== 0) {
    
      unmakeMove(node, move);
    
      uncacheA(node);
    
      continue;
    
    }
    
    //}}}

    makeMoveB();

    numLegalMoves++;
    if (node.base <= BASE_PRUNABLE)
      numPrunes++;

    //{{{  send current move to UCI?
    
    if (statsNodes > 10000000)
      uciSend('info currmove ' + formatMove(move) + ' currmovenumber ' + numLegalMoves);
    
    //}}}
    //{{{  extend/reduce
    
    E = 0;
    R = 0;
    
    if (inCheck !== 0) {
      E = 1;
    }
    
    else if (doLMR !== 0 && numLegalMoves > 4) {
      R = LMR_LOOKUP[(depth << 7) + numPrunes];
    }
    
    //}}}

    const nullWindow = (numLegalMoves > 1 || R) | 0;

    score = alpha;

    if (nullWindow !== 0)
      score = -search(node.childNode, depth+E-R-1, nextTurn, -alpha-1, -alpha);

    if (statsTimeOut === 0 && (nullWindow === 0 || score > alpha))
      score = -search(node.childNode, depth+E-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    unmakeMove(node, move);
    
    uncacheA(node);
    uncacheB(node);
    
    //}}}

    if (statsTimeOut !== 0)
      return 0;

    if (score > bestScore) {

      bestScore = score;
      bestMove  = move;

      if (bestScore > alpha) {

        collectPV(node, move);

        alpha = bestScore;

        statsBestMove  = bestMove;
        statsBestScore = bestScore;

        if (bestScore >= beta) {
          addKiller(node, bestScore, bestMove);
          if ((move & MOVE_NOISY_MASK) === 0)
            addHistory(Math.imul(Math.imul(depth, depth), depth), bestMove);
          ttPut(TT_BETA, depth, bestScore, bestMove, node.ply, alpha, beta, INF);
          return bestScore;
        }

        else {
          if ((move & MOVE_NOISY_MASK) === 0)
            addHistory(Math.imul(depth, depth), bestMove);
        }
      }
    }

    else {
      if ((move & MOVE_NOISY_MASK) === 0)
        addHistory(-depth, move);
    }
  }

  //{{{  update tt etc
  
  if (numLegalMoves === 1)
    statsTimeOut = 1;  // only one legal move so don't waste any more time
  
  if (numLegalMoves === 0) {
    statsTimeOut = 1;  // silly position
    statsBestMove = 0;
    statsBestScore = 0;
  }
  
  if (bestScore > oAlpha) {
    ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply, alpha, beta, node.ev);
    return bestScore;
  }
  else {
    ttPut(TT_ALPHA, depth, bestScore, bestMove, node.ply, alpha, beta, node.ev);
    return bestScore;
  }
  
  //}}}

}

//}}}
//{{{  search

function search (node, depth, turn, alpha, beta) {

  //{{{  check time
  
  node.pvLen = 0;
  
  if (node.childNode === null) {
    statsTimeOut = 1;
    return 0;
  }
  
  checkTime();
  if (statsTimeOut !== 0)
    return 0;
  
  if (node.ply > statsSelDepth)
    statsSelDepth = node.ply;
  
  //}}}

  const nextTurn = turn ^ COLOR_MASK;
  const pvNode   = (beta !== (alpha + 1)) | 0;

  //{{{  mate distance pruning
  
  const matingValue1 = MATE - node.ply;
  
  if (matingValue1 < beta) {
     beta = matingValue1;
     if (alpha >= matingValue1)
       return matingValue1;
  }
  
  const matingValue2 = -MATE + node.ply;
  
  if (matingValue2 > alpha) {
     alpha = matingValue2;
     if (beta <= matingValue2)
       return matingValue2;
  }
  
  //}}}
  //{{{  check for draws
  
  if (isDraw() !== 0)
    return 0;
  
  //}}}

  const inCheck = isKingAttacked(nextTurn);

  //{{{  horizon
  
  if (inCheck === 0 && depth <= 0)
    return qSearch(node, -1, turn, alpha, beta);
  
  depth = Math.max(depth,0);
  
  //}}}

  let score = 0;

  //{{{  try tt
  
  score = ttGet(node, depth, alpha, beta);  // sets/clears node.hashMove and node.hashEval
  
  if (pvNode === 0 && score !== TTSCORE_UNKNOWN)
    return score;
  
  //}}}

  const doBeta = ((pvNode === 0 && inCheck === 0 && beta < MINMATE)) | 0;

  let R = 0;
  let E = 0;

  const ev = node.hashEval !== INF ? node.hashEval : evaluate(turn);

  //{{{  improving
  
  var improving = 0;
  
  if (inCheck === 0) {
    const n2 = node.grandparentNode;
    if (n2 !== null) {
      if (n2.inCheck === 0 && ev > n2.ev)
        improving = 1;
      else if (n2.inCheck !== 0) {
        const n4 = n2.grandparentNode;
        if (n4 !== null && n4.inCheck === 0 && ev > n4.ev)
          improving = 1;
      }
    }
  }
  
  //}}}
  //{{{  beta prune
  
  if (doBeta !== 0 && depth <= 8 && (ev - Math.imul(depth, 100)) >= (beta - Math.imul(improving, 50)))
    return ev;
  
  //}}}
  //{{{  alpha prune
  
  // hack if (pvNode == 0 && inCheck === 0 && alpha > -MINMATE && depth <= 4 && (ev + 900 * depth) <= alpha) {
    //const qs = qSearch(node, -1, turn, alpha, alpha + 1);
    //if (qs <= alpha) {
      //return qs;
    //}
  //}
  
  //}}}

  node.inCheck = inCheck;
  node.ev      = ev;

  cache(node);

  //{{{  NMP
  
  //const isPawnEG = (wCount == wCounts[PAWN]+1 && bCount == bCounts[PAWN]+1) | 0;
  
  if (doBeta !== 0 && depth > 2 && ev > beta) {
  
    R = 3 + improving;
  
    loHash ^= loEP[bdEp];
    hiHash ^= hiEP[bdEp];
  
    bdEp = 0;
  
    loHash ^= loEP[bdEp];
    hiHash ^= hiEP[bdEp];
  
    loHash ^= loTurn;
    hiHash ^= hiTurn;
  
    repLo = repHi;
  
    score = -search(node.childNode, depth-R-1, nextTurn, -beta, -beta+1);
  
    uncacheA(node);
    //uncacheB(node);
  
    if (score >= beta) {
      if (score > MINMATE)
        score = beta;
      return score;
    }
  
    if (statsTimeOut !== 0)
      return 0;
  }
  
  //}}}

  const oAlpha = alpha;
  const doFP   = (inCheck === 0 && depth <= 4) | 0;
  const doLMR  = (inCheck === 0 && depth >= 3) | 0;
  const doLMP  = (pvNode === 0 && inCheck === 0 && depth <= 2) | 0;
  const doIIR  = (node.hashMove === 0 && pvNode !== 0 && depth > 3) | 0;

  let bestScore     = -INF;
  let move          = 0;
  let bestMove      = 0;
  let numLegalMoves = 0;
  let numPrunes     = 0;

  //{{{  IIR
  //
  // https://www.talkchess.com/forum3/viewtopic.php?f=7&t=74769
  //
  
  if (doIIR !== 0) {
  
    depth -= 1;
  
  }
  
  //}}}

  ttUpdateEval(ev);
  genMoves(node, turn);

  statsNodes++;

  while ((move = getNextMove(node)) !== 0) {

    //{{{  prune
    
    const prune = (numLegalMoves > 0 && node.base <= BASE_PRUNABLE && alpha > -MINMATE) | 0;
    
    if (doLMP !== 0 && prune !== 0 && numPrunes > Math.imul(depth, 5))
      continue;
    
    if (doFP !== 0 && prune !== 0 && (ev + Math.imul(depth, 120)) < alpha)
      continue;
    
    //}}}

    makeMoveA(node, move);

    //{{{  legal
    
    if ((move & MOVE_LEGAL_MASK) === 0 && isKingAttacked(nextTurn) !== 0) {
    
      unmakeMove(node, move);
    
      uncacheA(node);
    
      continue;
    
    }
    
    //}}}

    makeMoveB();

    numLegalMoves++;
    if (node.base <= BASE_PRUNABLE)
      numPrunes++;

    //{{{  extend/reduce
    
    E = 0;
    R = 0;
    
    if (inCheck !== 0 && (pvNode !== 0 || depth < 5)) {
      E = 1;
    }
    
    else if (doLMR !== 0 && numLegalMoves > 4) {
      R = LMR_LOOKUP[(depth << 7) + numPrunes];
    }
    
    //}}}

    const nullWindow = ((pvNode !== 0 && numLegalMoves > 1) || R) | 0;

    score = alpha;

    if (nullWindow !== 0)
      score = -search(node.childNode, depth+E-R-1, nextTurn, -alpha-1, -alpha);

    if (statsTimeOut === 0 && (nullWindow === 0 || score > alpha))
      score = -search(node.childNode, depth+E-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    unmakeMove(node, move);
    
    uncacheA(node);
    uncacheB(node);
    
    //}}}

    if (statsTimeOut !== 0)
      return 0;

    if (score > bestScore) {

      bestScore = score;
      bestMove  = move;

      if (bestScore > alpha) {

        if (pvNode !== 0)
          collectPV(node, move);

        alpha = bestScore;

        if (bestScore >= beta) {
          addKiller(node, bestScore, bestMove);
          if ((move & MOVE_NOISY_MASK) === 0)
            addHistory(Math.imul(Math.imul(depth, depth), depth), bestMove);
          ttPut(TT_BETA, depth, bestScore, bestMove, node.ply, alpha, beta, ev);
          return bestScore;
        }

        else {
          if ((move & MOVE_NOISY_MASK) === 0)
            addHistory(Math.imul(depth, depth), bestMove);
        }
      }
    }

    else {
      if ((move & MOVE_NOISY_MASK) === 0)
        addHistory(-depth, move);
    }
  }

  //{{{  mate
  
  if (numLegalMoves === 0) {
  
    if (inCheck !== 0) {
      //ttPut(TT_EXACT, depth, -MATE + node.ply, 0, node.ply, alpha, beta, ev);
      return -MATE + node.ply;
    }
  
    else {
      //ttPut(TT_EXACT, depth, 0, 0, node.ply, alpha, beta, ev);
      return 0;
    }
  
  }
  
  //}}}

  if (bestScore > oAlpha) {
    ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply, alpha, beta, ev);
    return bestScore;
  }
  else {
    ttPut(TT_ALPHA, depth, bestScore, bestMove, node.ply, alpha, beta, ev);
    return bestScore;
  }

}

//}}}
//{{{  qsearch

function qSearch (node, depth, turn, alpha, beta) {

  //{{{  check depth
  
  node.pvLen = 0;
  
  if (node.ply > statsSelDepth)
    statsSelDepth = node.ply;
  
  if (node.childNode === null)
    return evaluate(turn);
  
  //}}}

  const nextTurn = turn ^ COLOR_MASK;

  if (isDraw() !== 0)
    return 0;

  let score = ttGet(node, 0, alpha, beta);  // sets/clears node.hashMove and node.hashEval

  if (score !== TTSCORE_UNKNOWN)
    return score;

  const ev = node.hashEval !== INF ? node.hashEval : evaluate(turn);

  if (ev >= beta)
    return ev;
  if (ev >= alpha)
    alpha = ev;

  node.inCheck = 0;  // but not used

  ttUpdateEval(ev);
  cache(node);
  genQMoves(node, turn);

  statsNodes++;

  let numLegalMoves = 0;
  let move          = 0;

  while ((move = getNextMove(node)) !== 0) {

    //{{{  prune?
    
    if ((wCount + bCount) > 6 && (move & MOVE_SPECIAL_MASK) === 0 && ev + 200 + MATERIAL[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK] < alpha)
      continue;
    
    if (quickSee(turn, move) < 0)
      continue;
    
    //}}}

    makeMoveA(node, move);

    //{{{  legal?
    
    if (isKingAttacked(nextTurn) !== 0) {
    
      unmakeMove(node, move);
    
      uncacheA(node);
    
      continue;
    
    }
    
    //}}}

    makeMoveB();

    numLegalMoves++;

    score = -qSearch(node.childNode, depth-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    unmakeMove(node, move);
    
    uncacheA(node);
    uncacheB(node);
    
    //}}}

    if (score > alpha) {
      if (score >= beta) {
        ttPut(TT_BETA, 0, beta, 0, node.ply, alpha, beta, ev);
        return score;
      }
      alpha = score;
    }
  }

  ttPut(TT_ALPHA, 0, alpha, 0, node.ply, alpha, beta, ev);

  return alpha;

}

//}}}
//{{{  perft

function perft (node, depth, turn) {

  if (depth === 0)
    return 1;

  const nextTurn = turn ^ COLOR_MASK;
  const inCheck  = isKingAttacked(nextTurn);

  let totalNodes = 0;
  let move       = 0;

  node.inCheck = inCheck;

  node.rights = bdRights;
  node.ep     = bdEp;

  genMoves(node, turn);

  while ((move = getNextMove(node)) !== 0) {

    makeMoveA(node, move);

    //{{{  legal?
    
    if ((move & MOVE_LEGAL_MASK) === 0 && isKingAttacked(nextTurn) !== 0) {
    
      unmakeMove(node, move);
    
      bdRights = node.rights;
      bdEp     = node.ep;
    
      continue;
    
    }
    
    //}}}

    totalNodes += perft(node.childNode, depth-1, nextTurn);

    //{{{  unmake move
    
    unmakeMove(node, move);
    
    bdRights = node.rights;
    bdEp     = node.ep;
    
    //}}}

  }

  return totalNodes;

}

//}}}
//{{{  datagen
//
// Generate FENs in bullet text format.
// Assumes existence of ./data.
//

function datagen() {

  uciExec("bench warm 0");

  silentMode = 1;

  const nodesLimit     = 5000;  // hard limit is x100
  const gamesLimit     = 100000;
  const bufferSize     = 100000 + Math.random() * 100000;  // randomise writes
  const reportInterval = 10;

  const fileName = 'data/dg_' + BUILD + '_' + NET_NAME + '_' + NET_SB + '_' + Math.trunc(Math.random()*100000000000) + '.txt';

  let result = '';
  let o = '';
  let t = now();
  let totalFens = 0;

  fs.writeFileSync(fileName, o);

  for (let g=0; g < gamesLimit; g++) {
    //{{{  log
    
    if ((g % reportInterval) === 0) {
      console.log(fileName,g,'games',(totalFens/((now()-t)/1000)),'fens/sec');
      t = now();
      totalFens = 0;
    }
    
    //}}}
    //{{{  play game
    
    let randLimit   = 9;
    let reportLimit = 11;
    
    if (Math.random() >= 0.5) {
      randLimit--;
      reportLimit--;
    }
    
    uciExec('u');
    uciExec('p s');
    
    let moves = '';
    let hmc = 0;
    let ply = 0;
    let fens = [];
    let scores = [];
    
    while (true) {
    
      ply++;
    
      const turn     = bdTurn;
      const nextTurn = turn ^ BLACK;
    
      //{{{  get a move
      
      if (ply <= randLimit)
        randomEval = 1;
      else
        randomEval = 0;
      
      uciExec('go nodes ' + nodesLimit);
      
      if (ply <= randLimit)
        uciExec('u');
      
      if (statsBestMove === 0) {
        result = '0.5';
        break;
      }
      
      //}}}
    
      const move    = statsBestMove;
      const frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
      const frPiece = frObj & PIECE_MASK;
      const moveStr = formatMove(move);
      const inCheck = isKingAttacked(nextTurn);
      const noisy   = move & MOVE_NOISY_MASK;
      const fen     = formatFen(turn);
      const score   = (turn === BLACK ? -statsBestScore : statsBestScore);
    
      if (ply > reportLimit && inCheck === 0 && noisy === 0) {
        fens.push(fen);
        scores.push(score);
      }
    
      //{{{  end of game?
      
      let rep = 0;
      for (let i=0; i < fens.length; i++) {
        if (fen == fens[i])
          rep++;
      }
      
      if (rep > 2) {
        result = '0.5';
        break;
      }
      
      if (score >= MINMATE) {
        result = '1.0';
        break;
      }
      else if (score <= -MINMATE) {
        result = '0.0';
        break;
      }
      
      if (noisy === 0 && (frPiece !== PAWN))
        hmc++;
      else
        hmc = 0;
      
      if (hmc > 60) {
        result = '0.5';
        break;
      }
      
      //}}}
    
      moves += ' ' + moveStr;
    
      uciExec('position fen ' + 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' + ' moves ' + moves)
    }
    
    //}}}
    //{{{  save it
    
    for (let i=0; i < fens.length; i++) {
    
      totalFens++;
    
      o += fens[i] + ' | ' + scores[i] + ' ' + ' | ' + result + '\r\n';
    
      if (o.length > bufferSize) {
        const flushStart = performance.now();
        fs.appendFileSync(fileName,o);
        console.log('flush',performance.now()-flushStart);
        o = '';
      }
    
    }
    
    //}}}
  }

  if (o.length) {
    fs.appendFileSync(fileName, o);
  }

  console.log('done');

}

//}}}
//{{{  collectPV

function collectPV(node, move) {

  const cNode = node.childNode;

  node.pv.set(cNode.pv.subarray(0, cNode.pvLen), 0);

  node.pvLen            = cNode.pvLen;
  node.pv[node.pvLen++] = move;

}

//}}}

//}}}
//{{{  net

const net_h1_w_flat = new Int32Array(NET_I_SIZE * NET_H1_SIZE);  // us
const net_h2_w_flat = new Int32Array(NET_I_SIZE * NET_H1_SIZE);  // them
const net_h1_b      = new Int32Array(NET_H1_SIZE);
const net_o_w       = new Int32Array(NET_H1_SIZE*2);
let   net_o_b       = 0;
const net_h1_a      = new Int32Array(NET_H1_SIZE);
const net_h2_a      = new Int32Array(NET_H1_SIZE);
const net_a         = [[net_h1_a, net_h2_a], [net_h2_a, net_h1_a]];

let ueFunc  = myround;
let ueArgs0 = 0;
let ueArgs1 = 0;
let ueArgs2 = 0;
let ueArgs3 = 0;
let ueArgs4 = 0;
let ueArgs5 = 0;

//{{{  netEval
//
// squared relu.
//

function netEval(turn) {

  const w  = net_o_w;
  const a  = net_a[turn >>> 3];
  const a1 = a[0];
  const a2 = a[1];
  const N  = NET_H1_SIZE | 0;

  let e  = 0 | 0;
  let p1 = 0 | 0;
  let p2 = N | 0;

  while (p1 < N) {

    const x1 = a1[p1] | 0;
    const x2 = a2[p1] | 0;

    const y1 = (x1 + (x1 ^ (x1 >> 31)) - (x1 >> 31)) >> 1;
    const y2 = (x2 + (x2 ^ (x2 >> 31)) - (x2 >> 31)) >> 1;

    e = (e + Math.imul(w[p1], Math.imul(y1, y1)) + Math.imul(w[p2], Math.imul(y2, y2))) | 0;

    p1++; p2++;

  }

  let e2 = e;

  e2 = (e2 / NET_QA) | 0;
  e2 = (e2 + (net_o_b | 0)) | 0;
  e2 = Math.imul(e2, NET_SCALE | 0) | 0;
  e2 = (e2 / NET_QAB) | 0;

  return e2 | 0;

}

//}}}
//{{{  netLoad

//{{{  local weights

// xxd -p -c 64 quantised.bin > weights.hex
// 'weights.hex'

const WEIGHTS_HEX = `
`;

//}}}
//{{{  getWeightsBuffer

function getWeightsBuffer() {

  if (NET_LOCAL === 0)
    return fs.readFileSync(NET_WEIGHTS_FILE);

  const hex = WEIGHTS_HEX.replace(/\s+/g, "");

  if (typeof Buffer !== 'undefined' && Buffer.from) {
    return Buffer.from(hex, 'hex');
  }

  const n = hex.length >> 1;
  const bytes = new Uint8Array(n);
  for (let i = 0, j = 0; j < n; i += 2, j++) {
    bytes[j] = parseInt(hex.slice(i, i + 2), 16);
  }

  return bytes;

}

//}}}

function netLoad () {

  let offset = 0;

  const buffer = getWeightsBuffer();

  const dataView = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength >> 1
  );

  for (let i = 0; i < NET_I_SIZE; i++) {
    const lozIndex = bullet2lozza(i);
    const h = i * NET_H1_SIZE;
    for (let j = 0; j < NET_H1_SIZE; j++) {
      net_h1_w_flat[lozIndex            * NET_H1_SIZE + j] = dataView[h + j];  // us
      net_h2_w_flat[flipIndex(lozIndex) * NET_H1_SIZE + j] = dataView[h + j];  // them
    }
  }

  offset += NET_I_SIZE * NET_H1_SIZE;
  for (let i = 0; i < NET_H1_SIZE; i++) {
    net_h1_b[i] = dataView[offset + i];
  }

  offset += NET_H1_SIZE;
  for (let i = 0; i < NET_H1_SIZE * 2; i++) {
    net_o_w[i] = dataView[offset + i];
  }

  offset += NET_H1_SIZE * 2;
  net_o_b = dataView[offset];

}

//}}}

//{{{  netMove

function netMove () {

  const frObj = ueArgs0 << 8;
  const from  = ueArgs1 | 0;
  const to    = ueArgs2 | 0;

  const map = IMAP;
  const h1w = net_h1_w_flat, h2w = net_h2_w_flat;
  const h1a = net_h1_a, h2a = net_h2_a;

  const N = NET_H1_SIZE | 0;

  let h  = 0;
  let p1 = map[frObj + from] | 0;
  let p2 = map[frObj + to]   | 0;

  while (h < N) {
    h1a[h] += h1w[p2] - h1w[p1];
    h2a[h] += h2w[p2] - h2w[p1];
    h++; p1++; p2++;
  }

}

//}}}
//{{{  netCapture

function netCapture () {

  const frObj = ueArgs0 << 8;
  const fr    = ueArgs1 | 0;
  const toObj = ueArgs2 << 8;
  const to    = ueArgs3 | 0;

  const map = IMAP;
  const h1w = net_h1_w_flat, h2w = net_h2_w_flat;
  const h1a = net_h1_a, h2a = net_h2_a;

  const N = NET_H1_SIZE | 0;

  let h  = 0;
  let p1 = map[frObj + fr] | 0;
  let p2 = map[toObj + to] | 0;
  let p3 = map[frObj + to] | 0;

  while (h < N) {
    h1a[h] += h1w[p3] - h1w[p2] - h1w[p1];
    h2a[h] += h2w[p3] - h2w[p2] - h2w[p1];
    h++; p1++; p2++; p3++;
  }

}

//}}}
//{{{  netPromote

function netPromote () {

  const pawnObj    = ueArgs0 << 8;
  const pawnFr     = ueArgs1 | 0;
  const pawnTo     = ueArgs2 | 0;
  const captureObj = ueArgs3 << 8;
  const promoteObj = ueArgs4 << 8;

  const map = IMAP;
  const h1w = net_h1_w_flat, h2w = net_h2_w_flat;
  const h1a = net_h1_a, h2a = net_h2_a;

  const N = NET_H1_SIZE | 0;

  let h  = 0;
  let p1 = map[pawnObj    + pawnFr] | 0;
  let p2 = map[promoteObj + pawnTo] | 0;

  if (captureObj !== 0) {
    let p3 = map[captureObj + pawnTo] | 0;
    while (h < N) {
      h1a[h] += h1w[p2] - h1w[p1] - h1w[p3];
      h2a[h] += h2w[p2] - h2w[p1] - h2w[p3];
      h++; p1++; p2++; p3++;
    }
  }
  else {
    while (h < N) {
      h1a[h] += h1w[p2] - h1w[p1];
      h2a[h] += h2w[p2] - h2w[p1];
      h++; p1++; p2++;
    }
  }

}

//}}}
//{{{  netEpCapture

function netEpCapture () {

  const pawnObj        = ueArgs0 << 8;
  const pawnFr         = ueArgs1 | 0;
  const pawnTo         = ueArgs2 | 0;
  const pawnCaptureObj = ueArgs3 << 8;
  const ep             = ueArgs4 | 0;

  const map = IMAP;
  const h1w = net_h1_w_flat, h2w = net_h2_w_flat;
  const h1a = net_h1_a, h2a = net_h2_a;

  const N = NET_H1_SIZE | 0;

  let h  = 0;
  let p1 = map[pawnObj        + pawnFr] | 0;
  let p2 = map[pawnObj        + pawnTo] | 0;
  let p3 = map[pawnCaptureObj + ep] | 0;

  while (h < N) {
    h1a[h] += h1w[p2] - h1w[p1] - h1w[p3];
    h2a[h] += h2w[p2] - h2w[p1] - h2w[p3];
    h++; p1++; p2++; p3++;
  }

}

//}}}
//{{{  netCastle

function netCastle () {

  const kingObj = ueArgs0 << 8;
  const kingFr  = ueArgs1 | 0;
  const kingTo  = ueArgs2 | 0;
  const rookObj = ueArgs3 << 8;
  const rookFr  = ueArgs4 | 0;
  const rookTo  = ueArgs5 | 0;

  const map = IMAP;
  const h1w = net_h1_w_flat, h2w = net_h2_w_flat;
  const h1a = net_h1_a, h2a = net_h2_a;

  const N = NET_H1_SIZE | 0;

  let h  = 0;
  let p1 = map[kingObj + kingFr] | 0;
  let p2 = map[kingObj + kingTo] | 0;
  let p3 = map[rookObj + rookFr] | 0;
  let p4 = map[rookObj + rookTo] | 0;

  while (h < N) {
    h1a[h] += h1w[p2] - h1w[p1] + h1w[p4] - h1w[p3];
    h2a[h] += h2w[p2] - h2w[p1] + h2w[p4] - h2w[p3];
    h++; p1++; p2++; p3++; p4++;
  }

}

//}}}

//{{{  flipIndex
//
// Slow. Only use during init.
//

function flipIndex (index) {

  const piece         = Math.floor(index / 64);
  const square        = index % 64;
  const flippedSquare = square ^ 56;
  const flippedPiece  = (piece + 6) % 12;
  const flippedIndex  = flippedPiece * 64 + flippedSquare;

  return flippedIndex;

}

//}}}
//{{{  bullet2lozza
//
// bullet index 0 is a1. Lozza index 0 is a8.
// The piece order is the same.
// Apply this when loading the weights from the bullet .bin file.
//
// Slow. Only use during init.
//

function bullet2lozza (index) {

  const piece        = Math.floor(index / 64);
  const bulletSquare = index % 64;
  const lozzaSquare  = bulletSquare ^ 56;          // map a1 to a8 etc
  const lozzaIndex   = piece * 64 + lozzaSquare;

  return lozzaIndex;

}

//}}}

//}}}
//{{{  board

const bdB = new Uint8Array(144);    // pieces
const bdZ = new Uint8Array(144);    // pointers to w|bList

let bdTurn   = 0;
let bdRights = 0;
let bdEp     = 0;

const wList = new Uint8Array(16);
const bList = new Uint8Array(16);

const wbList = [wList, bList];

const wCounts = new Uint8Array(7);
const bCounts = new Uint8Array(7);

let wCount = 0;
let bCount = 0;

const objHistory = new Uint32Array(15 * 256);

//{{{  zobrists

//{{{  prng
//
// https://en.wikipedia.org/wiki/Mersenne_Twister
//

let twisterList  = new Uint32Array(624);
let twisterIndex = 0;

function twisterInit(seed) {

  const mt = twisterList;

  mt[0] = seed >>> 0;

  for (let i = 1; i < 624; i++) {
    mt[i] = (0x6C078965 * (mt[i - 1] ^ (mt[i - 1] >>> 30)) + i) >>> 0;
  }
}

function twisterFill() {

  const mt = twisterList;

  for (let i = 0; i < 624; i++) {
    let y = (mt[i] & 0x80000000) + (mt[(i + 1) % 624] & 0x7FFFFFFF);
    mt[i] = mt[(i + 397) % 624] ^ (y >>> 1);
    if (y % 2 !== 0) {
      mt[i] ^= 0x9908B0DF;
    }
  }
}

function twisterRand() {

  const mt = twisterList;

  if (twisterIndex === 0)
    twisterFill();

  let y = mt[twisterIndex];
  y ^= y >>> 11;
  y ^= (y << 7)  & 0x9D2C5680;
  y ^= (y << 15) & 0xEFC60000;
  y ^= y >>> 18;

  twisterIndex = (twisterIndex + 1) % 624;

  return y >>> 0;
}

twisterInit(0x9E3779B9);

//}}}

let loTurn = twisterRand();
let hiTurn = twisterRand();

const loObjPieces = new Int32Array(15 * 256);
const hiObjPieces = new Int32Array(15 * 256);

for (let i=0; i < 15 * 256; i++) {
  loObjPieces[i] = twisterRand();
  hiObjPieces[i] = twisterRand();
}

const loRights = new Int32Array(16);
const hiRights = new Int32Array(16);

for (let i=0; i < 16; i++) {
  loRights[i] = twisterRand();
  hiRights[i] = twisterRand();
}

const loEP = new Int32Array(144);
const hiEP = new Int32Array(144);

for (let i=0; i < 144; i++) {
  loEP[i] = twisterRand();
  hiEP[i] = twisterRand();
}

//}}}
//{{{  tt

let ttDefault = 16;  // mb
let ttSize    = 1;
let ttMask    = 0;

let ttLo    = new Int32Array(ttSize);
let ttHi    = new Int32Array(ttSize);
let ttType  = new Uint8Array(ttSize);
let ttDepth = new Int8Array(ttSize);
let ttMove  = new Uint32Array(ttSize);
let ttEval  = new Int16Array(ttSize);
let ttScore = new Int16Array(ttSize);
//                   ===
const ttWidth =      18;
//                   ===

let ttHashUsed = 0;

//{{{  ttResize

function ttResize(N_MB) {

  const bytesPerEntry  = ttWidth;
  const requestedBytes = N_MB * 1024 * 1024;
  const entriesNeeded  = requestedBytes / bytesPerEntry;
  const pow2           = Math.ceil(Math.log2(entriesNeeded));

  ttSize = 1 << pow2;
  ttMask = ttSize - 1;

  ttLo    = new Int32Array(ttSize);
  ttHi    = new Int32Array(ttSize);
  ttType  = new Uint8Array(ttSize);
  ttDepth = new Int8Array(ttSize);
  ttMove  = new Uint32Array(ttSize);
  ttEval  = new Int16Array(ttSize);
  ttScore = new Int16Array(ttSize);

  const sm   = silentMode;
  silentMode = 0;

  uciSend('info tt bits', pow2, 'entries', ttSize, '(0x' + ttSize.toString(16) + ')', 'mb', ttWidth * ttSize);

  silentMode = sm;

}

//}}}
//{{{  ttPut

function ttPut (type, depth, score, move, ply, alpha, beta, ev) {

  const idx = loHash & ttMask;

  if (depth === 0 && ttType[idx] !== TT_EMPTY && ttDepth[idx] > 0)
    return;

  if (ttType[idx] === TT_EMPTY)
    ttHashUsed++;

  if (score <= -MINMATE && score >= -MATE)
    score -= ply;

  else if (score >= MINMATE && score <= MATE)
    score += ply;

  ttLo[idx]    = loHash;
  ttHi[idx]    = hiHash;
  ttType[idx]  = type;
  ttDepth[idx] = depth;
  ttScore[idx] = score;
  ttEval[idx]  = ev;

  if (move !== 0)
    ttMove[idx] = move & MOVE_CLEAN_MASK;

}

//}}}
//{{{  ttGet

function ttGet (node, depth, alpha, beta) {

  const idx   = loHash & ttMask;
  const type  = ttType[idx];

  node.hashMove = 0;
  node.hashEval = INF;

  if (type === TT_EMPTY)
    return TTSCORE_UNKNOWN;

  const lo = ttLo[idx];
  const hi = ttHi[idx];

  if (lo !== loHash || hi !== hiHash)
    return TTSCORE_UNKNOWN;

  //
  // Set the hash move before the depth check
  // so that iterative deepening works.
  //

  if (ttValidate(ttMove[idx]) !== 0)
    node.hashMove = ttMove[idx];

  node.hashEval = ttEval[idx];

  if (ttDepth[idx] < depth)
    return TTSCORE_UNKNOWN;

  var score = ttScore[idx];

  if (score <= -MINMATE && score >= -MATE)
    score += node.ply;

  else if (score >= MINMATE && score <= MATE)
    score -= node.ply;

  if (type === TT_EXACT)
    return score;

  if (type === TT_ALPHA && score <= alpha)
    return score;

  if (type === TT_BETA && score >= beta)
    return score;

  return TTSCORE_UNKNOWN;

}

//}}}
//{{{  ttUpdateEval

function ttUpdateEval (ev) {

  const idx = loHash & ttMask;

  if (ttType[idx] !== TT_EMPTY && ttLo[idx] === loHash && ttHi[idx] === hiHash)
    ttEval[idx] = ev;

}

//}}}
//{{{  ttInit

function ttInit () {

  ttType.fill(TT_EMPTY);
  ttMove.fill(0);

  ttHashUsed = 0;

}

//}}}
//{{{  ttValidate

function ttValidate (move) {

  const b = bdB;

  const fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  const frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  if (b[fr] !== frObj)
    return 0;

  const to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  const toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;

  if (b[to] !== toObj)
    return 0;

  return 1;

}

//}}}

//}}}
//{{{  hash

let loHash = 0;
let hiHash = 0;

let repLo = 0;
let repHi = 0;

const repLoHash = new Int32Array(1024);
const repHiHash = new Int32Array(1024);

//}}}

//{{{  newGame

function newGame() {

  if (ttSize == 1)
    ttResize(ttDefault);

  ttInit();

}

//}}}
//{{{  position

function position (bd, turn, rights, ep, moves) {

  for (let i=0; i < nodes.length; i++)
    initNode(nodes[i]);

  loHash = 0;
  hiHash = 0;

  //{{{  turn
  
  if (turn == 'w')
    bdTurn = WHITE;
  
  else {
    bdTurn = BLACK;
    loHash ^= loTurn;
    hiHash ^= hiTurn;
  }
  
  //}}}
  //{{{  rights
  
  bdRights = 0;
  
  for (let i=0; i < rights.length; i++) {
  
    var ch = rights.charAt(i);
  
    if (ch == 'K') bdRights |= WHITE_RIGHTS_KING;
    if (ch == 'Q') bdRights |= WHITE_RIGHTS_QUEEN;
    if (ch == 'k') bdRights |= BLACK_RIGHTS_KING;
    if (ch == 'q') bdRights |= BLACK_RIGHTS_QUEEN;
  }
  
  loHash ^= loRights[bdRights];
  hiHash ^= hiRights[bdRights];
  
  //}}}
  //{{{  board
  
  bdB.fill(EDGE);
  
  for (var i=0; i < B88.length; i++)
    bdB[B88[i]] = 0;
  
  bdZ.fill(NO_Z);
  
  wCounts.fill(0);
  bCounts.fill(0);
  
  wList.fill(EMPTY);
  bList.fill(EMPTY);
  
  wCount = 1;
  bCount = 1;
  
  let sq = 0;
  
  for (let j=0; j < bd.length; j++) {
  
    const ch  = bd.charAt(j);
    const chn = parseInt(ch);
  
    while (bdB[sq] === EDGE)
      sq++;
  
    if (isNaN(chn)) {
  
      if (ch != '/') {
  
        const obj   = MAP[ch];
        const piece = obj & PIECE_MASK;
        const col   = obj & COLOR_MASK;
  
        bdB[sq] = obj;
  
        if (col === WHITE) {
          if (piece === KING) {
            wList[0] = sq;
            bdZ[sq] = 0;
            wCounts[KING]++;
          }
          else {
            wList[wCount] = sq;
            bdZ[sq] = wCount;
            wCounts[piece]++;
            wCount++;
          }
        }
  
        else {
          if (piece === KING) {
            bList[0] = sq;
            bdZ[sq] = 0;
            bCounts[KING]++;
          }
          else {
            bList[bCount] = sq;
            bdZ[sq] = bCount;
            bCounts[piece]++;
            bCount++;
          }
        }
  
        loHash ^= loObjPieces[(obj << 8) + sq];
        hiHash ^= hiObjPieces[(obj << 8) + sq];
  
        sq++;
      }
    }
  
    else {
  
      for (let k=0; k < chn; k++) {
        bdB[sq] = 0;
        sq++;
      }
    }
  
  }
  
  //}}}
  //{{{  ep
  
  if (ep.length === 2)
    bdEp = COORDS.indexOf(ep)
  else
    bdEp = 0;
  
  loHash ^= loEP[bdEp];
  hiHash ^= hiEP[bdEp];
  
  //}}}

  repLo = 0;
  repHi = 0;

  for (let i=0; i < moves.length; i++) {
    //{{{  play move
    
    const moveStr = moves[i];
    
    let move = 0;
    
    genMoves(rootNode, bdTurn);
    
    while ((move = getNextMove(rootNode)) !== 0) {
    
      const moveStr2 = formatMove(move);
    
      if (moveStr == moveStr2) {
        makeMoveA(rootNode, move);
        bdTurn ^= COLOR_MASK;
        break;
      }
    
    }
    
    //}}}
  }

  //{{{  compact
  
  const wList2 = new Uint8Array(16);
  const bList2 = new Uint8Array(16);
  
  let next = 0;
  
  for (let i=0; i < 16; i++) {
    const sq = wList[i];
    if (sq) {
      bdZ[sq] = next;
      wList2[next++] = sq;
    }
  }
  
  wList.set(wList2);
  
  next = 0;
  
  for (let i=0; i < 16; i++) {
    const sq = bList[i];
    if (sq) {
      bdZ[sq] = next;
      bList2[next++] = sq;
    }
  }
  
  bList.set(bList2);
  
  //}}}
  //{{{  ue
  
  net_h1_a.set(net_h1_b);
  net_h2_a.set(net_h1_b);
  
  for (let sq=0; sq < 64; sq++) {
  
    const fr    = B88[sq];
    const frObj = bdB[fr];
  
    if (frObj === 0)
      continue;
  
    const off1 = IMAP[(frObj << 8) + fr];
  
    for (let h=0; h < NET_H1_SIZE; h++) {
      const idx1 = off1 + h;
      net_h1_a[h] += net_h1_w_flat[idx1];
      net_h2_a[h] += net_h2_w_flat[idx1];
    }
  
  }
  
  //}}}

  initNode(rootNode);
  objHistory.fill(BASE_HISSLIDE);

}

//}}}
//{{{  genMoves

function genMoves (node, turn) {

  node.stage     = 0;
  node.numMoves  = 0;
  node.numMoves2 = 0;
  node.next      = 0;

  const b = bdB;
  const inCheck = node.inCheck;

  //{{{  colour based stuff
  
  if (turn === WHITE) {
  
    var offsetOrth  = -12;
    var offsetDiag1 = -13;
    var offsetDiag2 = -11;
    var homeRank    = 2;
    var promoteRank = 7;
    var rights      = bdRights & WHITE_RIGHTS;
    var pList       = wList;
    var theirKingSq = bList[0];
    var pCount      = wCount;
    var CAPTURE     = IS_BNK;
    var aligned     = ALIGNED[wList[0]];
  
    if (inCheck === 0 && rights !== 0) {
  
      if (((rights & WHITE_RIGHTS_KING) !== 0) && b[F1] === 0 && b[G1] === 0 && b[SQG2] !== B_KING && b[SQH2] !== B_KING && isAttacked(F1,BLACK) === 0)
        addCastle(node, MOVE_E1G1);
  
      if (((rights & WHITE_RIGHTS_QUEEN) !== 0) && b[B1] === 0 && b[C1] === 0 && b[D1] === 0 && b[SQB2] !== B_KING && b[SQC2] !== B_KING && isAttacked(D1,BLACK) === 0)
        addCastle(node, MOVE_E1C1);
    }
  
  }
  
  else {
  
    var offsetOrth  = 12;
    var offsetDiag1 = 13;
    var offsetDiag2 = 11;
    var homeRank    = 7;
    var promoteRank = 2;
    var rights      = bdRights & BLACK_RIGHTS;
    var pList       = bList;
    var theirKingSq = wList[0];
    var pCount      = bCount;
    var CAPTURE     = IS_WNK;
    var aligned     = ALIGNED[bList[0]];
  
    if (inCheck === 0 && rights !== 0) {
  
      if (((rights & BLACK_RIGHTS_KING) !== 0) && b[F8] === 0 && b[G8] === 0 && b[SQG7] !== B_KING && b[SQH7] !== B_KING && isAttacked(F8,WHITE) === 0)
        addCastle(node, MOVE_E8G8);
  
      if (((rights & BLACK_RIGHTS_QUEEN) !== 0) && b[B8] === 0 && b[C8] === 0 && b[D8] === 0 && b[SQB7] !== B_KING && b[SQC7] !== B_KING && isAttacked(D8,WHITE) === 0)
        addCastle(node, MOVE_E8C8);
    }
  
  }
  
  //}}}

  let next   = 0;
  let count  = 0;
  let to     = 0;
  let toObj  = 0;
  let myMove = 0;

  while (count < pCount) {

    const fr = pList[next];
    if (fr === 0) {
      next++;
      continue;
    }

    const frObj     = b[fr];
    const frPiece   = frObj & PIECE_MASK;
    const frMove    = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);
    const frRank    = RANK[fr];
    const legalMask = inCheck === 0 && aligned[fr] === 0 ? MOVE_LEGAL_MASK : 0;

    switch (frPiece) {
      case 1: {
        //{{{  P
        
        //{{{  orth
        
        to    = fr + offsetOrth;
        toObj = b[to];
        
        if (toObj === 0) {
        
          if (frRank === promoteRank)
            addPromotion(node, frMove | to | legalMask);
        
          else {
            addSlide(node, frMove | to | legalMask);
        
            if (frRank === homeRank) {
        
              to += offsetOrth;
              if (b[to] === 0)
                addSlide(node, frMove | to | MOVE_EPMAKE_MASK | legalMask);
            }
          }
        
        }
        
        //}}}
        //{{{  diag1
        
        to    = fr + offsetDiag1;
        toObj = b[to];
        
        if (CAPTURE[toObj] !== 0) {
        
          if (frRank === promoteRank)
            addPromotion(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to | legalMask);
          else
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to | legalMask);
        }
        
        else if (toObj === 0 && to === bdEp)
          addEPTake(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to | MOVE_EPTAKE_MASK);
        
        //}}}
        //{{{  diag2
        
        to    = fr + offsetDiag2;
        toObj = b[to];
        
        if (CAPTURE[toObj] !== 0) {
        
          if (frRank === promoteRank)
            addPromotion(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to | legalMask);
          else
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to | legalMask);
        }
        
        else if (toObj === 0 && to === bdEp)
          addEPTake(node, frMove | to | MOVE_EPTAKE_MASK);
        
        //}}}
        
        break;
        
        //}}}
      }
      case 2: {
        //{{{  N
        
        myMove = frMove | legalMask;
        
        to = fr + 25;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 25;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 23;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 23;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 14;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 14;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 10;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 10;
        if ((toObj = b[to]) === 0)
          addSlide(node, myMove | to);
        else if (CAPTURE[toObj] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 3: {
        //{{{  B
        
        myMove = frMove | legalMask;
        
        to = fr + 11;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 11;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 13;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 13;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 4: {
        //{{{  R
        
        myMove = frMove | legalMask;
        
        to = fr + 1;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 1;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 12;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 12;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 5: {
        //{{{  B
        
        myMove = frMove | legalMask;
        
        to = fr + 11;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 11;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 13;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 13;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        //}}}
        //{{{  R
        
        myMove = frMove | legalMask;
        
        to = fr + 1;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 1;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 12;
        while (b[to] === 0)
          addSlide(node, myMove | to), to += 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 12;
        while (b[to] === 0)
          addSlide(node, myMove | to), to -= 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addCapture(node, myMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 6: {
        //{{{  K
        
        to = fr + 11;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr - 11;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr + 13;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr - 13;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr + 1;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr - 1;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr + 12;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        to = fr - 12;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0) {
          if ((toObj = b[to]) === 0)
            addSlide(node, frMove | to);
          else if (CAPTURE[toObj] !== 0)
            addCapture(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        break;
        
        //}}}
      }
    }

    next++;
    count++

  }
}

//}}}
//{{{  genQMoves

function genQMoves (node, turn) {

  node.stage     = 0;
  node.numMoves  = 0;
  node.numMoves2 = 0;
  node.next      = 0;

  const b = bdB;

  //{{{  colour based stuff
  
  if (turn === WHITE) {
  
    var offsetOrth  = -12;
    var offsetDiag1 = -13;
    var offsetDiag2 = -11;
    var promoteRank = 7;
    var pList       = wList;
    var theirKingSq = bList[0];
    var pCount      = wCount;
    var CAPTURE     = IS_BNK;
  
  }
  
  else {
  
    var offsetOrth  = 12;
    var offsetDiag1 = 13;
    var offsetDiag2 = 11;
    var promoteRank = 2;
    var pList       = bList;
    var theirKingSq = wList[0];
    var pCount      = bCount;
    var CAPTURE     = IS_WNK;
  
  }
  
  //}}}

  let next  = 0;
  let count = 0;
  let to    = 0;
  let toObj = 0;

  while (count < pCount) {

    const fr = pList[next];
    if (fr === 0) {
      next++;
      continue;
    }

    const frObj   = b[fr];
    const frPiece = frObj & PIECE_MASK;
    const frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);
    const frRank  = RANK[fr];

    switch (frPiece) {
      case 1: {
        //{{{  P
        
        //{{{  orth
        
        to    = fr + offsetOrth;
        toObj = b[to];
        
        if (toObj === 0) {
        
          if (frRank === promoteRank)
            addQPromotion(node, MOVE_PROMOTE_MASK | frMove | to);
        
        }
        
        //}}}
        //{{{  diag1
        
        to    = fr + offsetDiag1;
        toObj = b[to];
        
        if (CAPTURE[toObj] !== 0) {
        
          if (frRank === promoteRank)
            addQPromotion(node, MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          else
            addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        else if (toObj === 0 && to === bdEp)
          addQMove(node, MOVE_EPTAKE_MASK | frMove | to);
        
        //}}}
        //{{{  diag2
        
        to    = fr + offsetDiag2;
        toObj = b[to];
        
        if (CAPTURE[toObj] !== 0) {
        
          if (frRank === promoteRank)
            addQPromotion(node, MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          else
            addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        }
        
        else if (toObj === 0 && to === bdEp)
          addQMove(node, MOVE_EPTAKE_MASK | frMove | to);
        
        //}}}
        
        break;
        
        //}}}
      }
      case 2: {
        //{{{  N
        
        to = fr + 25;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 25;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 23;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 23;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 14;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 14;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 10;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 10;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 3: {
        //{{{  B
        
        to = fr + 11;
        while (b[to] === 0)
          to += 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 11;
        while (b[to] === 0)
          to -= 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 13;
        while (b[to] === 0)
          to += 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 13;
        while (b[to] === 0)
          to -= 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 4: {
        //{{{  R
        
        to = fr + 1;
        while (b[to] === 0)
          to += 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 1;
        while (b[to] === 0)
          to -= 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 12;
        while (b[to] === 0)
          to += 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 12;
        while (b[to] === 0)
          to -= 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 5: {
        //{{{  B
        
        to = fr + 11;
        while (b[to] === 0)
          to += 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 11;
        while (b[to] === 0)
          to -= 11;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 13;
        while (b[to] === 0)
          to += 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 13;
        while (b[to] === 0)
          to -= 13;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        //}}}
        //{{{  R
        
        to = fr + 1;
        while (b[to] === 0)
          to += 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 1;
        while (b[to] === 0)
          to -= 1;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 12;
        while (b[to] === 0)
          to += 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 12;
        while (b[to] === 0)
          to -= 12;
        if (CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
      case 6: {
        //{{{  K
        
        to = fr + 11;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 11;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 13;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 13;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 1;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 1;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr + 12;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        to = fr - 12;
        if (ADJACENT[Math.abs(to-theirKingSq)] === 0 && CAPTURE[toObj = b[to]] !== 0)
          addQMove(node, frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        
        break;
        
        //}}}
      }
    }

    next++;
    count++
  }

}

//}}}
//{{{  makeMoveA

function makeMoveA (node, move) {

  const b = bdB;
  const z = bdZ;

  const fr      = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  const to      = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  const toObj   = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  const frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  const frPiece = frObj & PIECE_MASK;
  const frCol   = frObj & COLOR_MASK;

  //{{{  slide piece
  
  b[fr] = 0;
  b[to] = frObj;
  
  node.frZ = z[fr];
  node.toZ = z[to];
  
  z[fr] = NO_Z;
  z[to] = node.frZ;
  
  loHash ^= loObjPieces[(frObj << 8) + fr];
  hiHash ^= hiObjPieces[(frObj << 8) + fr];
  
  loHash ^= loObjPieces[(frObj << 8) + to];
  hiHash ^= hiObjPieces[(frObj << 8) + to];
  
  wbList[frCol >>> 3][node.frZ] = to;
  
  //}}}
  //{{{  clear rights?
  
  if (bdRights !== 0) {
  
    loHash ^= loRights[bdRights];
    hiHash ^= hiRights[bdRights];
  
    bdRights &= MASK_RIGHTS[fr] & MASK_RIGHTS[to];
  
    loHash ^= loRights[bdRights];
    hiHash ^= hiRights[bdRights];
  
  }
  
  //}}}
  //{{{  capture?
  
  if (toObj !== 0) {
  
    const toPiece = toObj & PIECE_MASK;
    const toCol   = toObj & COLOR_MASK;
  
    loHash ^= loObjPieces[(toObj << 8) + to];
    hiHash ^= hiObjPieces[(toObj << 8) + to];
  
    if (toCol === WHITE) {
  
      wList[node.toZ] = EMPTY;
  
      wCounts[toPiece]--;
      wCount--;
    }
  
    else {
  
      bList[node.toZ] = EMPTY;
  
      bCounts[toPiece]--;
      bCount--;
    }
  
    ueFunc  = netCapture;
    ueArgs0 = frObj;
    ueArgs1 = fr;
    ueArgs2 = toObj;
    ueArgs3 = to;
  
  }
  
  else {
  
    ueFunc  = netMove;
    ueArgs0 = frObj;
    ueArgs1 = fr;
    ueArgs2 = to;
  
  }
  
  //}}}
  //{{{  reset EP
  
  loHash ^= loEP[bdEp];
  hiHash ^= hiEP[bdEp];
  
  bdEp = 0;
  
  loHash ^= loEP[bdEp];
  hiHash ^= hiEP[bdEp];
  
  //}}}

  if ((move & MOVE_SPECIAL_MASK) !== 0) {
    //{{{  ikky stuff
    
    if (frCol === WHITE) {
    
      const ep = to + 12;
    
      if ((move & MOVE_EPMAKE_MASK) !== 0) {
    
        ueFunc  = netMove;
        ueArgs0 = frObj;
        ueArgs1 = fr;
        ueArgs2 = to;
    
        loHash ^= loEP[bdEp];
        hiHash ^= hiEP[bdEp];
    
        bdEp = ep;
    
        loHash ^= loEP[bdEp];
        hiHash ^= hiEP[bdEp];
      }
    
      else if ((move & MOVE_EPTAKE_MASK) !== 0) {
    
        ueFunc  = netEpCapture;
        ueArgs0 = frObj;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = B_PAWN;
        ueArgs4 = ep;
    
        b[ep]    = 0;
        node.epZ = z[ep];
        z[ep]    = NO_Z;
    
        bList[node.epZ] = EMPTY;
    
        loHash ^= loObjPieces[(B_PAWN << 8) + ep];
        hiHash ^= hiObjPieces[(B_PAWN << 8) + ep];
    
        bCounts[PAWN]--;
        bCount--;
      }
    
      else if ((move & MOVE_PROMOTE_MASK) !== 0) {
    
        const pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]     = WHITE | pro;
    
        ueFunc  = netPromote;
        ueArgs0 = W_PAWN;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = toObj;
        ueArgs4 = pro|WHITE;
    
        loHash ^= loObjPieces[(W_PAWN << 8) + to];
        hiHash ^= hiObjPieces[(W_PAWN << 8) + to];
        loHash ^= loObjPieces[((WHITE|pro) << 8) + to];
        hiHash ^= hiObjPieces[((WHITE|pro) << 8) + to];
    
        wCounts[PAWN]--;
        wCounts[pro]++;
    
      }
    
      else if (move === MOVE_E1G1) {
    
        ueFunc  = netCastle;
        ueArgs0 = W_KING;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = W_ROOK;
        ueArgs4 = H1;
        ueArgs5 = F1;
    
        b[H1] = 0;
        b[F1] = W_ROOK;
        z[F1] = z[H1];
        z[H1] = NO_Z;
    
        wList[z[F1]] = F1;
    
        loHash ^= loObjPieces[(W_ROOK << 8) + H1];
        hiHash ^= hiObjPieces[(W_ROOK << 8) + H1];
        loHash ^= loObjPieces[(W_ROOK << 8) + F1];
        hiHash ^= hiObjPieces[(W_ROOK << 8) + F1];
    
      }
    
      else if (move === MOVE_E1C1) {
    
        ueFunc  = netCastle;
        ueArgs0 = W_KING;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = W_ROOK;
        ueArgs4 = A1;
        ueArgs5 = D1;
    
        b[A1] = 0;
        b[D1] = W_ROOK;
        z[D1] = z[A1];
        z[A1] = NO_Z;
    
        wList[z[D1]] = D1;
    
        loHash ^= loObjPieces[(W_ROOK << 8) + A1];
        hiHash ^= hiObjPieces[(W_ROOK << 8) + A1];
        loHash ^= loObjPieces[(W_ROOK << 8) + D1];
        hiHash ^= hiObjPieces[(W_ROOK << 8) + D1];
    
      }
    }
    
    else {
    
      const ep = to - 12;
    
      if ((move & MOVE_EPMAKE_MASK) !== 0) {
    
        ueFunc  = netMove;
        ueArgs0 = frObj;
        ueArgs1 = fr;
        ueArgs2 = to;
    
        loHash ^= loEP[bdEp];
        hiHash ^= hiEP[bdEp];
    
        bdEp = ep;
    
        loHash ^= loEP[bdEp];
        hiHash ^= hiEP[bdEp];
      }
    
      else if ((move & MOVE_EPTAKE_MASK) !== 0) {
    
        ueFunc  = netEpCapture;
        ueArgs0 = frObj;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = W_PAWN;
        ueArgs4 = ep;
    
        b[ep]    = 0;
        node.epZ = z[ep];
        z[ep]    = NO_Z;
    
        wList[node.epZ] = EMPTY;
    
        loHash ^= loObjPieces[(W_PAWN << 8) + ep];
        hiHash ^= hiObjPieces[(W_PAWN << 8) + ep];
    
        wCounts[PAWN]--;
        wCount--;
      }
    
      else if ((move & MOVE_PROMOTE_MASK) !== 0) {
    
        const pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]     = BLACK | pro;
    
        ueFunc  = netPromote;
        ueArgs0 = B_PAWN;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = toObj;
        ueArgs4 = pro|BLACK;
    
        loHash ^= loObjPieces[(B_PAWN << 8) + to];
        hiHash ^= hiObjPieces[(B_PAWN << 8) + to];
        loHash ^= loObjPieces[((pro|BLACK) << 8) + to];
        hiHash ^= hiObjPieces[((pro|BLACK) << 8) + to];
    
        bCounts[PAWN]--;
        bCounts[pro]++;
    
      }
    
      else if (move === MOVE_E8G8) {
    
        ueFunc  = netCastle;
        ueArgs0 = B_KING;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = B_ROOK;
        ueArgs4 = H8;
        ueArgs5 = F8;
    
        b[H8] = 0;
        b[F8] = B_ROOK;
        z[F8] = z[H8];
        z[H8] = NO_Z;
    
        bList[z[F8]] = F8;
    
        loHash ^= loObjPieces[(B_ROOK << 8) + H8];
        hiHash ^= hiObjPieces[(B_ROOK << 8) + H8];
        loHash ^= loObjPieces[(B_ROOK << 8) + F8];
        hiHash ^= hiObjPieces[(B_ROOK << 8) + F8];
    
      }
    
      else if (move === MOVE_E8C8) {
    
        ueFunc  = netCastle;
        ueArgs0 = B_KING;
        ueArgs1 = fr;
        ueArgs2 = to;
        ueArgs3 = B_ROOK;
        ueArgs4 = A8;
        ueArgs5 = D8;
    
        b[A8] = 0;
        b[D8] = B_ROOK;
        z[D8] = z[A8];
        z[A8] = NO_Z;
    
        bList[z[D8]] = D8;
    
        loHash ^= loObjPieces[(B_ROOK << 8) + A8];
        hiHash ^= hiObjPieces[(B_ROOK << 8) + A8];
        loHash ^= loObjPieces[(B_ROOK << 8) + D8];
        hiHash ^= hiObjPieces[(B_ROOK << 8) + D8];
    
      }
    
    }
    
    //}}}
  }

  //{{{  flip turn in hash
  
  loHash ^= loTurn;
  hiHash ^= hiTurn;
  
  //}}}
  //{{{  push rep hash
  //
  // Repetitions are cancelled by pawn moves, castling, captures, EP
  // and promotions; i.e. moves that are not reversible.  The nearest
  // repetition is 5 indexes back from the current one and then that
  // and every other one entry is a possible rep.  Can also check for
  // 50 move rule by testing hi-lo > 100 - it's not perfect because of
  // the pawn move reset but it's a type 2 error, so safe.
  //
  
  repLoHash[repHi] = loHash;
  repHiHash[repHi] = hiHash;
  
  repHi++;
  
  if ((move & (MOVE_SPECIAL_MASK | MOVE_TOOBJ_MASK)) || frPiece === PAWN)
    repLo = repHi;
  
  //}}}

}

//}}}
//{{{  makeMoveB
//
// If the ue* data is moved into nodes, this could be deferred and
// done in evaluate().
//

function makeMoveB  () {

  ueFunc();

}

//}}}
//{{{  unmakeMove

function unmakeMove (node, move) {

  const b = bdB;
  const z = bdZ;

  const fr    = (move & MOVE_FR_MASK)    >>> MOVE_FR_BITS;
  const to    = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;
  const toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  const frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  const frCol = frObj & COLOR_MASK;

  b[fr] = frObj;
  b[to] = toObj;

  z[fr] = node.frZ;
  z[to] = node.toZ;

  wbList[frCol >>> 3][node.frZ] = fr;

  //{{{  capture?
  
  if (toObj !== 0) {
  
    const toPiece = toObj & PIECE_MASK;
    const toCol   = toObj & COLOR_MASK;
  
    if (toCol === WHITE) {
  
      wList[node.toZ] = to;
  
      wCounts[toPiece]++;
      wCount++;
    }
  
    else {
  
      bList[node.toZ] = to;
  
      bCounts[toPiece]++;
      bCount++;
    }
  
  }
  
  //}}}

  if ((move & MOVE_SPECIAL_MASK) !== 0) {
    //{{{  ikky stuff
    
    if ((frObj & COLOR_MASK) === WHITE) {
    
      const ep = to + 12;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[ep] = B_PAWN;
        z[ep] = node.epZ;
    
        bList[node.epZ] = ep;
    
        bCounts[PAWN]++;
        bCount++;
    
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        const pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        wCounts[PAWN]++;
        wCounts[pro]--;
    
      }
    
      else if (move === MOVE_E1G1) {
    
        b[H1] = W_ROOK;
        b[F1] = 0;
        z[H1] = z[F1];
        z[F1] = NO_Z;
    
        wList[z[H1]] = H1;
      }
    
      else if (move === MOVE_E1C1) {
    
        b[A1] = W_ROOK;
        b[D1] = 0;
        z[A1] = z[D1];
        z[D1] = NO_Z;
    
        wList[z[A1]] = A1;
      }
    }
    
    else {
    
      const ep = to - 12;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[ep] = W_PAWN;
        z[ep] = node.epZ;
    
        wList[node.epZ] = ep;
    
        wCounts[PAWN]++;
        wCount++;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        const pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        bCounts[PAWN]++;
        bCounts[pro]--;
    
      }
    
      else if (move === MOVE_E8G8) {
    
        b[H8] = B_ROOK;
        b[F8] = 0;
        z[H8] = z[F8];
        z[F8] = NO_Z;
    
        bList[z[H8]] = H8;
      }
    
      else if (move === MOVE_E8C8) {
    
        b[A8] = B_ROOK;
        b[D8] = 0;
        z[A8] = z[D8];
        z[D8] = NO_Z;
    
        bList[z[A8]] = A8;
      }
    }
    
    //}}}
  }

}

//}}}
//{{{  isKingAttacked

function isKingAttacked (byCol) {

  const list = wbList[(byCol ^ COLOUR_MASK) >>> 3];

  return isAttacked(list[0], byCol);

}

//}}}
//{{{  isAttacked

function isAttacked (to, byCol) {

  const b = bdB;

  let fr;

  //{{{  colour stuff
  
  if (byCol === WHITE) {
  
    if (b[to+13] === W_PAWN || b[to+11] === W_PAWN)
      return 1;
  
    var RQ = IS_WRQ;
    var BQ = IS_WBQ;
  }
  
  else {
  
    if (b[to-13] === B_PAWN || b[to-11] === B_PAWN)
      return 1;
  
    var RQ = IS_BRQ;
    var BQ = IS_BBQ;
  }
  
  const knight = KNIGHT | byCol;
  const king   = KING   | byCol;
  
  //}}}

  //{{{  knights
  
  if (b[to + -10] === knight) return 1;
  if (b[to + -23] === knight) return 1;
  if (b[to + -14] === knight) return 1;
  if (b[to + -25] === knight) return 1;
  if (b[to +  10] === knight) return 1;
  if (b[to +  23] === knight) return 1;
  if (b[to +  14] === knight) return 1;
  if (b[to +  25] === knight) return 1;
  
  //}}}
  //{{{  queen, bishop, rook
  
  fr = to + 1;  while (b[fr] === 0) fr += 1;  if (RQ[b[fr]] !== 0) return 1;
  fr = to - 1;  while (b[fr] === 0) fr -= 1;  if (RQ[b[fr]] !== 0) return 1;
  fr = to + 12; while (b[fr] === 0) fr += 12; if (RQ[b[fr]] !== 0) return 1;
  fr = to - 12; while (b[fr] === 0) fr -= 12; if (RQ[b[fr]] !== 0) return 1;
  fr = to + 11; while (b[fr] === 0) fr += 11; if (BQ[b[fr]] !== 0) return 1;
  fr = to - 11; while (b[fr] === 0) fr -= 11; if (BQ[b[fr]] !== 0) return 1;
  fr = to + 13; while (b[fr] === 0) fr += 13; if (BQ[b[fr]] !== 0) return 1;
  fr = to - 13; while (b[fr] === 0) fr -= 13; if (BQ[b[fr]] !== 0) return 1;
  
  //}}}

  return 0;

}

//}}}
//{{{  evaluate

function evaluate (turn) {

  //{{{  init
  
  const numPieces = wCount + bCount;
  
  const wNumQueens  = wCounts[QUEEN];
  const wNumRooks   = wCounts[ROOK];
  const wNumBishops = wCounts[BISHOP];
  const wNumKnights = wCounts[KNIGHT];
  const wNumPawns   = wCounts[PAWN];
  
  const bNumQueens  = bCounts[QUEEN];
  const bNumRooks   = bCounts[ROOK];
  const bNumBishops = bCounts[BISHOP];
  const bNumKnights = bCounts[KNIGHT];
  const bNumPawns   = bCounts[PAWN];
  
  //}}}
  //{{{  draw?
  
  if (numPieces === 2)
    return 0;
  
  if (numPieces === 3 && (wNumKnights !== 0 || wNumBishops !== 0 || bNumKnights !== 0 || bNumBishops !== 0))
    return 0;
  
  if (numPieces === 4 && (wNumKnights !== 0 || wNumBishops !== 0) && (bNumKnights !== 0 || bNumBishops !== 0))
    return 0;
  
  if (numPieces === 4 && (wNumKnights === 2 || bNumKnights === 2))
    return 0;
  
  if (numPieces === 5 && wNumKnights === 2 && (bNumKnights !== 0 || bNumBishops !== 0))
    return 0;
  
  if (numPieces === 5 && bNumKnights === 2 && (wNumKnights !== 0 || wNumBishops !== 0))
    return 0;
  
  if (numPieces === 5 && wNumBishops === 2 && bNumBishops !== 0)
    return 0;
  
  if (numPieces === 5 && bNumBishops === 2 && wNumBishops !== 0)
    return 0;
  
  if (numPieces === 4 && wNumRooks !== 0 && bNumRooks !== 0)
    return 0;
  
  if (numPieces === 4 && wNumQueens !== 0 && bNumQueens !== 0)
    return 0;
  
  //}}}

  if (randomEval !== 0)
    return Math.trunc((Math.random() * 1000) - 500);
  else
    return netEval(turn);

}

//}}}
//{{{  formatFen

function formatFen (turn) {

  var fen = '';
  var n   = 0;

  for (var i=0; i < 8; i++) {
    for (var j=0; j < 8; j++) {
      var sq  = B88[i*8 + j]
      var obj = bdB[sq];
      if (obj === 0)
        n++;
      else {
        if (n) {
          fen += '' + n;
          n = 0;
        }
        fen += UMAP[obj];
      }
    }
    if (n) {
      fen += '' + n;
      n = 0;
    }
    if (i < 7)
      fen += '/';
  }

  if (turn === WHITE)
    fen += ' w';
  else
    fen += ' b';

  if (bdRights) {
    fen += ' ';
    if (bdRights & WHITE_RIGHTS_KING)
      fen += 'K';
    if (bdRights & WHITE_RIGHTS_QUEEN)
      fen += 'Q';
    if (bdRights & BLACK_RIGHTS_KING)
      fen += 'k';
    if (bdRights & BLACK_RIGHTS_QUEEN)
      fen += 'q';
  }
  else
    fen += ' -';

  if (bdEp)
    fen += ' ' + COORDS[bdEp];
  else
    fen += ' -';

  fen += ' 0 1';

  return fen;

}

//}}}
//{{{  quickSee

const WB_OFFSET_DIAG1 = new Int8Array([-13, 13]);
const WB_OFFSET_DIAG2 = new Int8Array([-11, 11]);

const QS = new Uint8Array([0,0,3,3,5,9,0]);

function quickSee (turn, move) {

  if ((move & MOVE_SPECIAL_MASK) !== 0)
    return 0;

  const frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  const frPiece = frObj & PIECE_MASK;

  if (frPiece === PAWN)
    return 0;

  const to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  const toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;

  const cx = turn >>> 3;

  const nextTurn = turn ^ BLACK;

  const p1 = (bdB[to + WB_OFFSET_DIAG1[cx]] === (PAWN | nextTurn)) | 0;
  const p2 = (bdB[to + WB_OFFSET_DIAG2[cx]] === (PAWN | nextTurn)) | 0;

  if (toObj === 0 && (p1 !== 0 || p2 !== 0))
    return -1;

  const toPiece = toObj & PIECE_MASK;
  const dodgy   = (QS[frPiece] > QS[toPiece]) | 0;

  if (dodgy !== 0 && (p1 !== 0 || p2 !== 0))
    return -1;

  return 0;

}

//}}}
//{{{  addHistory

function addHistory (bonus, move) {

  const frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  const to    = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;

  objHistory[(frObj << 8) + to] += bonus;

}

//}}}
//{{{  isDraw

function isDraw () {

  if (repHi - repLo > 100)
    return 1;

  for (let i=repHi-5; i >= repLo; i -= 2) {

    if (repLoHash[i] === loHash && repHiHash[i] === hiHash)
      return 1;

  }

  const numPieces = wCount + bCount;

  if (numPieces === 2)
    return 1;

  const wNumBishops = wCounts[BISHOP];
  const wNumKnights = wCounts[KNIGHT];

  const bNumBishops = bCounts[BISHOP];
  const bNumKnights = bCounts[KNIGHT];

  if (numPieces === 3 && (wNumKnights !== 0 || wNumBishops !== 0 || bNumKnights !== 0 || bNumBishops !== 0))
    return 1;

  return 0;

}

//}}}
//{{{  formatMove

function formatMove (move) {

  let moveStr = 'NULL';

  if (move !== 0) {

    const fr = (move & MOVE_FR_MASK) >>> MOVE_FR_BITS;
    const to = (move & MOVE_TO_MASK) >>> MOVE_TO_BITS;

    moveStr = COORDS[fr] + COORDS[to];

    if ((move & MOVE_PROMOTE_MASK) !== 0)
      moveStr = moveStr + PROMOTES[(move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS];

  }

  return moveStr;

}

//}}}
//{{{  flipFen
//
// flipFen is slow. Only use for init/test/datagen.
//

function flipFen (fen) {

  const [board, color, castling, enPassant, halfmove, fullmove] = fen.split(' ');

  const mirroredBoard = board.split('/').reverse().map(row => {
    return row.split('').map(char => {
      if (char === char.toUpperCase()) {
        return char.toLowerCase();
      } else if (char === char.toLowerCase()) {
        return char.toUpperCase();
      }
      return char;
    }).join('');
  }).join('/');

  const mirroredColor = color === 'w' ? 'b' : 'w';

  const mirrorCastling = castling.split('').map(right => {
    switch(right) {
      case 'K': return 'k';
      case 'Q': return 'q';
      case 'k': return 'K';
      case 'q': return 'Q';
      default: return right;
    }
  }).join('');

  const mirroredEnPassant = enPassant === '-' ? '-' :
    enPassant[0] + (9 - parseInt(enPassant[1]));

  const newFen = [
    mirroredBoard,
    mirroredColor,
    mirrorCastling || '-',
    mirroredEnPassant,
    halfmove,
    fullmove
  ].join(' ');

  return newFen;
};

//}}}
//{{{  boardCheck

function boardCheck (turn) {

  const a1 = new Int32Array(NET_H1_SIZE);
  const a2 = new Int32Array(NET_H1_SIZE);

  //{{{  hash
  
  var loH = 0;
  var hiH = 0;
  
  if (turn) {
    loH ^= loTurn;
    hiH ^= hiTurn;
  }
  
  loH ^= loRights[bdRights];
  hiH ^= hiRights[bdRights];
  
  loH ^= loEP[bdEp];
  hiH ^= hiEP[bdEp];
  
  for (var sq=0; sq<144; sq++) {
  
    var obj = bdB[sq];
  
    if (obj === 0 || obj === EDGE)
      continue;
  
    var piece = obj & PIECE_MASK;
    var col   = obj & COLOR_MASK;
  
    loH ^= loObjPieces[(obj << 8) + sq];
    hiH ^= hiObjPieces[(obj << 8) + sq];
  
  }
  
  if (loH !== loHash)
    console.log('*************** LO',loH,loHash);
  
  if (hiH !== hiHash)
    console.log('*************** HI',hiH,hiHash);
  
  //}}}
  //{{{  accumulators
  
  a1.set(net_h1_b);
  a2.set(net_h1_b);
  
  for (let sq=0; sq < 64; sq++) {
  
    const fr    = B88[sq];
    const frObj = bdB[fr];
  
    if (frObj === 0)
      continue;
  
    const off1 = IMAP[(frObj << 8) + fr];
  
    for (let h=0; h < NET_H1_SIZE; h++) {
      const idx1 = off1 + h;
      a1[h] += net_h1_w_flat[idx1];
      a2[h] += net_h2_w_flat[idx1];
    }
  
  }
  
  for (let i=0; i < NET_H1_SIZE; i++) {
    if (a1[i] !== net_h1_a[i])
      console.log('****** A1', i, a1[i], net_h1_a[i]);
    if (a2[i] !== net_h2_a[i])
      console.log('****** A2', i, a2[i], net_h2_a[i]);
  }
  
  //}}}

}

//}}}

//}}}
//{{{  stats

let statsStartTime = 0;
let statsNodes     = 0;
let statsMoveTime  = 0;
let statsMaxNodes  = 0;
let statsTimeOut   = 0;
let statsSelDepth  = 0;
let statsBestMove  = 0;
let statsBestScore = 0;

//{{{  initStats

function initStats () {

  statsStartTime = now();
  statsNodes     = 0;
  statsMoveTime  = 0;
  statsMaxNodes  = 0;
  statsTimeOut   = 0;
  statsSelDepth  = 0;
  statsBestMove  = 0;
  statsBestScore = 0;

}

//}}}
//{{{  checkTime

function checkTime () {

  if (statsBestMove && statsMoveTime > 0 && ((now() - statsStartTime) >= statsMoveTime))

    statsTimeOut = 1;

  if (statsBestMove && statsMaxNodes > 0 && statsNodes >= statsMaxNodes * 100)

    statsTimeOut = 1;

}

//}}}

//}}}
//{{{  uci

//{{{  uciSend

function uciSend () {

  if (silentMode)
    return;

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  //fs.writeSync(1, s + '\n');

  if (nodeHost)
    console.log(s);
  else
    postMessage(s);

}

//}}}
//{{{  uciGetInt

function uciGetInt (tokens, key, def) {

  for (let i=0; i < tokens.length; i++)
    if (tokens[i] == key)
      if (i < tokens.length - 1)
        return parseInt(tokens[i+1]);

  return def;

}

//}}}
//{{{  uciGetStr

function uciGetStr (tokens, key, def) {

  const lkey = key.toLowerCase();

  for (let i=0; i < tokens.length; i++)
    if (tokens[i].toLowerCase() == key)
      if (i < tokens.length - 1)
        return tokens[i+1];

  return def;

}

//}}}
//{{{  uciGetArr

function uciGetArr (tokens, key, to) {

  var lo = 0;
  var hi = 0;

  for (let i=0; i < tokens.length; i++) {
    if (tokens[i] == key) {
      lo = i + 1;  //assumes at least one item
      hi = lo;
      for (let j=lo; j < tokens.length; j++) {
        if (tokens[j] == to)
          break;
        hi = j;
      }
    }
  }

  return {lo:lo, hi:hi};

}

//}}}
//{{{  uciExec

function uciExec (commands) {

  const cmdList = commands.split('\n');

  for (let c=0; c < cmdList.length; c++ ) {

    let cmdStr = cmdList[c].replace(/(\r\n|\n|\r)/gm,"");

    cmdStr = cmdStr.trim();
    cmdStr = cmdStr.replace(/\s+/g,' ');

    const tokens = cmdStr.split(' ');

    let cmd = tokens[0];

    if (!cmd)
      continue;

    switch (cmd) {

      case 'isready': {
        //{{{  isready
        
        uciSend('readyok');
        
        break;
        
        //}}}
      }

      case 'position':
      case 'p': {
        //{{{  position
        
        if (ttSize == 1) {
          uciSend('info do a ucinewgame or setoption name hash command first');
          break;
        }
        
        let bd     = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
        let turn   = 'w';
        let rights = 'KQkq';
        let ep     = '-';
        
        let arr = uciGetArr(tokens, 'fen', 'moves');
        
        if (arr.lo > 0) {
          if (arr.lo <= arr.hi) bd     = tokens[arr.lo]; arr.lo++;
          if (arr.lo <= arr.hi) turn   = tokens[arr.lo]; arr.lo++;
          if (arr.lo <= arr.hi) rights = tokens[arr.lo]; arr.lo++;
          if (arr.lo <= arr.hi) ep     = tokens[arr.lo]; arr.lo++;
        }
        
        const moves = [];
        
        arr = uciGetArr(tokens, 'moves', 'fen');
        
        if (arr.lo > 0) {
          for (var i=arr.lo; i <= arr.hi; i++)
            moves.push(tokens[i]);
        }
        
        position(bd, turn, rights, ep, moves);
        
        break;
        
        //}}}
      }

      case 'go':
      case 'g': {
        //{{{  go
        
        if (ttSize == 1) {
          uciSend('info do a ucinewgame or setoption name hash command first');
          break;
        }
        
        if (bdB[0] !== EDGE) {
          uciSend('info do a position command first');
          break;
        }
        
        
        initStats();
        
        let depth     = Math.max(uciGetInt(tokens, 'depth', 0), uciGetInt(tokens, 'd', 0));
        let moveTime  = uciGetInt(tokens, 'movetime', 0);
        let maxNodes  = uciGetInt(tokens, 'nodes', 0);
        let wTime     = uciGetInt(tokens, 'wtime', 0);
        let bTime     = uciGetInt(tokens, 'btime', 0);
        let wInc      = uciGetInt(tokens, 'winc', 0);
        let bInc      = uciGetInt(tokens, 'binc', 0);
        let movesToGo = uciGetInt(tokens, 'movestogo', 0);
        
        let totTime = 0;
        let movTime = 0;
        let incTime = 0;
        
        if (depth <= 0)
          depth = MAX_PLY;
        
        if (moveTime > 0)
          statsMoveTime = moveTime;
        
        if (maxNodes > 0)
          statsMaxNodes = maxNodes;
        
        if (moveTime === 0) {
        
          if (movesToGo > 0)
            movesToGo += 2;
          else
            movesToGo = 30;
        
          if (bdTurn === WHITE) {
            totTime = wTime;
            incTime = wInc;
          }
          else {
            totTime = bTime;
            incTime = bInc;
          }
        
          movTime = myround(totTime / movesToGo) + incTime;
          movTime = movTime * 0.95;
        
          if (movTime > 0)
            statsMoveTime = movTime | 0;
        
          if (statsMoveTime < 1 && (wTime || bTime))
            statsMoveTime = 1;
        }
        
        go(depth);
        
        break;
        
        //}}}
      }

      case 'ucinewgame':
      case 'u': {
        //{{{  ucinewgame
        
        newGame();
        
        break;
        
        //}}}
      }

      case 'setoption':
      case 'o': {
        //{{{  setoption
        
        const opt = uciGetStr(tokens, 'name', '').toLowerCase();
        
        if (opt == 'hash') {
        
          const mb = Math.max(uciGetInt(tokens, 'value', ttDefault), 1);
        
          console.log(mb);
        
          ttResize(mb);
        
        }
        
        break;
        
        //}}}
      }

      case 'quit':
      case 'q': {
        //{{{  quit
        
        process.exit();
        
        break;
        
        //}}}
      }

      case 'stop': {
        //{{{  stop
        
        break;
        
        //}}}
      }

      case 'uci': {
        //{{{  uci
        
        uciSend('id name Lozza', BUILD);
        uciSend('id author Colin Jenkins');
        uciSend('option name Hash type spin default', ttDefault, 'min 1 max 1024');
        uciSend('uciok');
        
        break;
        
        //}}}
      }

      case 'perft': {
        //{{{  perft
        
        uciExec('b');
        
        const depth1 = uciGetInt(tokens, 'depth', 0);
        const depth2 = uciGetInt(tokens, 'to', depth1);
        const warm = uciGetInt(tokens, 'warm', 0);
        
        for (let w=0; w < warm; w++) {
          for (let depth=depth1; depth <= depth2; depth++) {
            const nodes = perft(rootNode, depth, bdTurn);
          }
        }
        
        for (let depth=depth1; depth <= depth2; depth++) {
          const start = now();
          const nodes = perft(rootNode, depth, bdTurn);
          const elapsed = now() - start;
          const nps = nodes / elapsed * 1000 | 0;
          uciSend('depth', depth, 'nodes', nodes, 'time', elapsed, 'nps', nps);
        }
        
        break;
        
        //}}}
      }

      case 'eval':
      case 'e': {
        //{{{  eval
        
        const e = netEval(bdTurn);
        
        uciSend(e);
        
        break;
        
        //}}}
      }

      case 'board':
      case 'b': {
        //{{{  board
        
        uciSend(formatFen(bdTurn));
        
        break;
        
        //}}}
      }

      case 'bench': {
        //{{{  bench
        
        silentMode = 1;
        
        const depth = uciGetInt(tokens, 'depth', BENCH_DEPTH);
        const warm  = uciGetInt(tokens, 'warm', 1);
        
        //{{{  warmup
        
        for (let w=0; w < warm; w++) {
        
          for (var i=0; i < BENCHFENS.length; i++) {
        
            const fen = BENCHFENS[i];
        
            newGame();
            uciExec('position fen ' + fen);
            uciExec('id bench' + i);
            uciExec('go depth ' + depth);
        
          }
        
        }
        
        //}}}
        
        let nodes = 0;
        let start = now();
        
        for (let i=0; i < BENCHFENS.length; i++) {
        
          const fen = BENCHFENS[i];
        
          process.stdout.write(i.toString() + '\r');
        
          newGame();
          uciExec('position fen ' + fen);
          uciExec('id bench' + i);
          uciExec('go depth ' + depth);
        
          nodes += statsNodes;
        
        }
        
        silentMode = 0;
        
        const elapsed = now() - start;
        const nps = nodes/elapsed * 1000 | 0;
        
        uciSend('warm', warm, 'depth', depth, 'nodes', nodes, 'time', elapsed, 'nps', nps);
        
        break;
        
        //}}}
      }

      case 'qb': {
        //{{{  quick bench
        
        uciExec('bench warm 0');
        
        break;
        
        //}}}
      }

      case 'pt': {
        //{{{  perft tests
        
        let n = uciGetInt(tokens, 'n', PERFTFENS.length);
        
        silentMode = 1;
        
        const t1 = now();
        
        let errors = 0;
        let tot    = 0;
        
        for (let i=0; i < n; i++) {
        
          const p = PERFTFENS[i];
        
          const fen   = p[0];
          const depth = p[1];
          const moves = p[2];
          const id    = p[3];
        
          newGame();
          uciExec('position ' + fen);
        
          const nodes = perft(rootNode, depth, bdTurn);
        
          tot += nodes;
        
          const t2     = now();
          const sec    = Math.round((t2-t1)/100)/10;
          const secStr = sec.toString().padStart(6, ' ');
        
          let diff = nodes - moves;
        
          if (diff) {
            errors += Math.abs(diff);
            diff = '\x1b[1m' + diff + '\x1b[0m';
          }
        
          silentMode = 0;
          uciSend(secStr, id, fen, depth, diff, nodes, moves);
          silentMode = 1;
        }
        
        silentMode = 0;
        
        const elapsed = now() - t1;
        const nps = tot/elapsed * 1000 | 0;
        
        uciSend('errors', errors, 'nodes', tot, 'nps', nps);
        
        break;
        
        //}}}
      }

      case 'et': {
        //{{{  eval tests
        
        for (let i=0; i < BENCHFENS.length; i++) {
        
          uciSend();
        
          const fen = BENCHFENS[i];
        
          newGame();
          uciExec('position fen ' + fen);
          uciSend(fen, 'fen')
          uciExec('e');
        
          const flippedFen = flipFen(fen);
        
          newGame();
          uciExec('position fen ' + flippedFen);
          uciSend(flippedFen, 'flipped fen')
          uciExec('e');
        
        }
        
        break;
        
        //}}}
      }

      case 'network':
      case 'n': {
        //{{{  network
        
        uciSend('weights file', NET_WEIGHTS_FILE);
        uciSend('i_size, h1_size', NET_I_SIZE, NET_H1_SIZE);
        uciSend('qa, qb', NET_QA, NET_QB);
        uciSend('scale', NET_SCALE);
        uciSend('local', NET_LOCAL);
        
        uciExec('u');
        uciExec('p s');
        uciExec('e');
        
        break;
        
        //}}}
      }

      case 'moves':
      case 'm': {
        //{{{  moves
        
        initNode(rootNode);
        
        rootNode.inCheck = 1;
        
        let move = 0;
        
        genMoves(rootNode, bdTurn);
        
        while(move = getNextMove(rootNode))
          console.log(formatMove(move));
        
        initNode(rootNode);
        
        break;
        
        //}}}
      }

      case 'datagen': {
        //{{{  datagen
        
        datagen();
        
        break;
        
        //}}}
      }

      default: {
        //{{{  ?
        
        uciSend('unknown command', cmd);
        
        break;
        
        //}}}
      }
    }
  }

}

//}}}

//}}}
//{{{  init

const nodeHost = (typeof process) != 'undefined';

if (!nodeHost) {
  onmessage = function(e) {
    uciExec(e.data);
  }
}

const fs = (nodeHost) ? require('fs') : 0;

const nodes = Array(MAX_PLY);

let silentMode = 0;
let randomEval = 0;

//{{{  initOnce

function initOnce () {

  //{{{  init ADJACENT
  
  ADJACENT[1]  = 1;
  ADJACENT[11] = 1;
  ADJACENT[12] = 1;
  ADJACENT[13] = 1;
  
  //}}}
  //{{{  init net
  //
  // IMAP is used to map a piece+colour to an offset in the flat weights array.
  // Used when updating the accumulators.
  //
  
  for (let i = 0; i < 64; i++) {
  
    const j = B88[i];
  
    IMAP[(W_PAWN << 8) + j]    =   (0 + (PAWN-1)   * 64 + i) * NET_H1_SIZE;
    IMAP[(W_KNIGHT << 8) + j]  =   (0 + (KNIGHT-1) * 64 + i) * NET_H1_SIZE;
    IMAP[(W_BISHOP << 8) + j]  =   (0 + (BISHOP-1) * 64 + i) * NET_H1_SIZE;
    IMAP[(W_ROOK << 8) + j]    =   (0 + (ROOK-1)   * 64 + i) * NET_H1_SIZE;
    IMAP[(W_QUEEN << 8) + j]   =   (0 + (QUEEN-1)  * 64 + i) * NET_H1_SIZE;
    IMAP[(W_KING << 8) + j]    =   (0 + (KING-1)   * 64 + i) * NET_H1_SIZE;
  
    IMAP[(B_PAWN << 8) + j]    = (384 + (PAWN-1)   * 64 + i) * NET_H1_SIZE;
    IMAP[(B_KNIGHT << 8) + j]  = (384 + (KNIGHT-1) * 64 + i) * NET_H1_SIZE;
    IMAP[(B_BISHOP << 8) + j]  = (384 + (BISHOP-1) * 64 + i) * NET_H1_SIZE;
    IMAP[(B_ROOK << 8) + j]    = (384 + (ROOK-1)   * 64 + i) * NET_H1_SIZE;
    IMAP[(B_QUEEN << 8) + j]   = (384 + (QUEEN-1)  * 64 + i) * NET_H1_SIZE;
    IMAP[(B_KING << 8) + j]    = (384 + (KING-1)   * 64 + i) * NET_H1_SIZE;
  
  }
  
  netLoad();
  
  //}}}
  //{{{  init nodes
  
  for (let i=0; i < nodes.length; i++) {
    nodes[i] = new nodeStruct();
    seal(nodes[i]);
    nodes[i].ply = i;
  }
  
  for (let i=0; i < nodes.length-1; i++)
    nodes[i].childNode = nodes[i+1];
  
  for (let i=1; i < nodes.length; i++)
    nodes[i].parentNode = nodes[i-1];
  
  for (let i=2; i < nodes.length; i++)
    nodes[i].grandparentNode = nodes[i-2];
  
  //}}}
  //{{{  init LMR_LOOKUP
  
  for (let p=0; p < MAX_PLY; p++) {
    for (let m=0; m < MAX_MOVES; m++) {
      LMR_LOOKUP[(p << 7) + m] = (1 + p/5 + m/20) | 0;
    }
  }
  
  //}}}
  //{{{  init ALIGNED
  
  for (var i=0; i < 144; i++) {
    ALIGNED[i] = new Int8Array(144).fill(EDGE);
    for (let j=0; j < 64; j++) {
      ALIGNED[i][B88[j]] = 0;
    }
  }
  
  for (let i=0; i < 64; i++) {
  
    const to = B88[i];
    const a  = ALIGNED[to];
  
    let dir = 1;
    let from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = -1;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = 12;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = -12;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = 13;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = -13;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = 11;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
    dir = -11;
    from = to + dir;
    while (a[from] !== EDGE) {
      a[from] = dir;
      from += dir;
    }
  
  }
  
  //}}}

}

initOnce();

//}}}

const rootNode = nodes[0];

//}}}

if (nodeHost && process.argv.length > 2) {
  for (let i=2; i < process.argv.length; i++)
    uciExec(process.argv[i]);
}

//{{{  stdio

if (nodeHost) {

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    const chunk = process.stdin.read();
    process.stdin.resume();
    if (chunk !== null) {
      uciExec(chunk);
    }
  });

  process.stdin.on('end', function() {
    process.exit();
  });

}

//}}}

