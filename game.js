// Версия с надёжной инициализацией: всё навешивается ПОСЛЕ загрузки DOM
(function(){
const $ = (sel) => document.querySelector(sel);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
const fmtTime = (sec) => { sec=Math.max(0,Math.floor(sec)); const m=String(Math.floor(sec/60)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; };


const SHIPS = {
small: { w: 8, h: 14, dwt: 8000, label: 'Малое 8×14' },
medium: { w: 10, h: 16, dwt: 20000, label: 'Среднее 10×16' },
large: { w: 12, h: 18, dwt: 35000, label: 'Крупное 12×18' },
};


const SHAPES = [
{ name: 'Контейнер', m: [[1,1],[1,1]], wt: 4, rev: 9000, color: '#37a2ff' },
{ name: 'Уголь', m: [[1,1,1]], wt: 3, rev: 7000, color: '#a9a9a9' },
{ name: 'Зерно', m: [[1,1,1,1]], wt: 5, rev: 9000, color: '#ffd166' },
{ name: 'Оборуд.', m: [[1,1,1],[1,0,0]], wt: 6, rev: 14000, color: '#8be28b' },
{ name: 'Авто', m: [[0,1,0],[1,1,1]], wt: 6, rev: 15000, color: '#ff6b6b' },
{ name: 'Z', m: [[1,1,0],[0,1,1]], wt: 6, rev: 15000, color: '#c792ea' },
{ name: 'S', m: [[0,1,1],[1,1,0]], wt: 6, rev: 15000, color: '#eab308' },
];
const cloneM = (m)=>m.map(r=>r.slice());
const rotM = (m)=>{ const h=m.length,w=m[0].length,res=Array.from({length:w},()=>Array(h).fill(0)); for(let y=0;y<h;y++) for(let x=0;x<w;x++) res[x][h-1-y]=m[y][x]; return res; };


function init(){
// DOM-элементы запрашиваем только после загрузки
const board = $('#board');
const next = $('#next');
const bctx = board.getContext('2d');
const nctx = next.getContext('2d');


const scrMenu=$('#screen-menu'), scrGame=$('#screen-game'), scrResult=$('#screen-result');
const hudSize=$('#hud-size'), hudDwt=$('#hud-dwt'), hudWeight=$('#hud-weight'), hudRevenue=$('#hud-revenue'), hudFill=$('#hud-fill'), hudTime=$('#hud-time');
const metaWeight=$('#meta-weight'), metaRevenue=$('#meta-revenue'), warningsBox=$('#warnings');
const shipSizeSel=$('#ship-size'), durationSel=$('#game-duration');
const btnStart=$('#btn-start'), btnPause=$('#btn-pause'), btnRestart=$('#btn-restart'), btnMenu=$('#btn-menu');


// Если чего-то нет — выведем подсказку и не свалимся с ошибкой
if(!board || !bctx){ console.error('Canvas #board не найден или не поддерживается'); return; }


const st = {
gridW: 10, gridH: 16, cell: 30, board: [],
dwt: 20000, curWeight: 0, revenue: 0,
running:false, paused:false, over:false,
durationSec:120, timeLeft:120, lastTick:0,
fallInterval:650, fallAcc:70,
piece:null, nextPiece:null, px:0, py:0,
};


const setScreen=(s)=>{ [scrMenu,scrGame,scrResult].forEach(x=>x.classList.remove('active')); s.classList.add('active'); };
const initBoard=(w,h)=>{ st.gridW=w; st.gridH=h; board.width=w*st.cell; board.height=h*st.cell; st.board=Array.from({length:h},()=>Array(w).fill(0)); };
const pickPiece=()=>{ const b=SHAPES[(Math.random()*SHAPES.length)|0]; return {name:b.name,m:cloneM(b.m),wt:b.wt,rev:b.rev,color:b.color}; };


function spawn(){ st.piece = st.nextPiece || pickPiece(); st.nextPiece = pickPiece(); st.px = Math.floor((st.gridW - st.piece.m[0].length)/2); st.py = -st.piece.m.length; updNext(); if (collides(st.px, st.py, st.piece.m)) gameOver(); }


const collides=(px,py,m)=>{ for(let y=0;y<m.length;y++) for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=px+x, gy=py+y; if(gx<0||gx>=st.gridW||gy>=st.gridH) return true; if(gy>=0 && st.board[gy][gx]) return true; } return false; };


function lockPiece(){
const m=st.piece.m; for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=st.px+x, gy=st.py+y; if(gy>=0) st.board[gy][gx]={color:st.piece.color}; }
const newW = st.curWeight + st.piece.wt;
if(newW>st.dwt){ for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=st.px+x, gy=st.py+y; if(gy>=0) st.board[gy][gx]=0; } warn(`Перегруз! Дедвейт ${st.dwt} т. Текущий вес: ${st.curWeight} т. Груз ${st.piece.wt} т не принят.`); return; }
})();
