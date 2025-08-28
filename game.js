(() => {
// ====== Утилиты ======
const $ = (sel) => document.querySelector(sel);
const on = (el, ev, fn) => el.addEventListener(ev, fn);


function fmtTime(sec) {
sec = Math.max(0, Math.floor(sec));
const m = String(Math.floor(sec / 60)).padStart(2, '0');
const s = String(sec % 60).padStart(2, '0');
return `${m}:${s}`;
}


// ====== Параметры судов ======
const SHIPS = {
small: { w: 8, h: 14, dwt: 8000, label: 'Малое 8×14' },
medium: { w: 10, h: 16, dwt: 20000, label: 'Среднее 10×16' },
large: { w: 12, h: 18, dwt: 35000, label: 'Крупное 12×18' },
};


// ====== Грузы (фигуры) ======
// Каждая фигура: матрица 1/0, вес (т), доход ($)
// Вес и доход масштабируются от количества клеток
const SHAPES = [
{ name: 'Контейнер', m: [[1,1],[1,1]], wt: 4, rev: 9000, color: '#37a2ff' }, // 2x2
{ name: 'Уголь', m: [[1,1,1]], wt: 3, rev: 7000, color: '#a9a9a9' }, // 3x1
{ name: 'Зерно', m: [[1,1,1,1]], wt: 5, rev: 9000, color: '#ffd166' }, // 4x1
{ name: 'Оборудование',m: [[1,1,1],[1,0,0]], wt: 6, rev: 14000, color: '#8be28b' }, // L
{ name: 'Авто', m: [[0,1,0],[1,1,1]], wt: 6, rev: 15000, color: '#ff6b6b' }, // T
{ name: 'Техника', m: [[1,1,0],[0,1,1]], wt: 6, rev: 15000, color: '#c792ea' }, // Z
{ name: 'ТехЗет', m: [[0,1,1],[1,1,0]], wt: 6, rev: 15000, color: '#eab308' }, // S
];


function cloneMatrix(m){ return m.map(r => r.slice()); }
function rotateMatrix(m){ // 90°
const h = m.length, w = m[0].length;
const res = Array.from({length: w}, () => Array(h).fill(0));
for (let y=0; y<h; y++) for (let x=0; x<w; x++) res[x][h-1-y] = m[y][x];
return res;
}


// ====== Состояние игры ======
const state = {
gridW: 10,
gridH: 16,
cell: 30, // px
board: [], // gridH x gridW (0 или {color})


dwt: 20000,
curWeight: 0,
revenue: 0,


running: false,
paused: false,
over: false,


durationSec: 120,
timeLeft: 120,
lastTick: 0,
fallInterval: 650, // мс между шагами падения
fallAcc: 70, // ускорение при зажатой ↓


piece: null,
nextPiece: null,
px: 0,
py: 0,
};
})();
