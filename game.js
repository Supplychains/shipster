// Версия с надёжной инициализацией: всё навешивается ПОСЛЕ загрузки DOM
function lockPiece(){
const m=st.piece.m; for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=st.px+x, gy=st.py+y; if(gy>=0) st.board[gy][gx]={color:st.piece.color}; }
const newW = st.curWeight + st.piece.wt;
if(newW>st.dwt){ for(let y=0;y<m.length;y++)for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=st.px+x, gy=st.py+y; if(gy>=0) st.board[gy][gx]=0; } warn(`Перегруз! Дедвейт ${st.dwt} т. Текущий вес: ${st.curWeight} т. Груз ${st.piece.wt} т не принят.`); return; }
st.curWeight=newW; st.revenue+=st.piece.rev;
}


const warn=(msg)=>{ warningsBox && (warningsBox.textContent=msg); };
const clrWarn=()=>{ warningsBox && (warningsBox.textContent=''); };


function updHUD(){ hudWeight.textContent=st.curWeight; hudRevenue.textContent=st.revenue; const fill=Math.round(100*filledCells()/(st.gridW*st.gridH)); hudFill.textContent=fill; hudTime.textContent=fmtTime(st.timeLeft); }
const filledCells=()=>{ let c=0; for(let y=0;y<st.gridH;y++) for(let x=0;x<st.gridW;x++) if(st.board[y][x]) c++; return c; };


function drawCell(ctx,x,y,color){ const s=st.cell; ctx.fillStyle=color; ctx.fillRect(x*s,y*s,s,s); ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=2; ctx.strokeRect(x*s+1,y*s+1,s-2,s-2); }


function render(){
bctx.clearRect(0,0,board.width,board.height);
for(let y=0;y<st.gridH;y++) for(let x=0;x<st.gridW;x++){ bctx.fillStyle=(x%2===0&&y%2===0)?'#0b1b2a':'#091621'; bctx.fillRect(x*st.cell, y*st.cell, st.cell, st.cell); bctx.strokeStyle='#0f2a45'; bctx.strokeRect(x*st.cell, y*st.cell, st.cell, st.cell); }
for(let y=0;y<st.gridH;y++) for(let x=0;x<st.gridW;x++){ const cell=st.board[y][x]; if(cell) drawCell(bctx,x,y,cell.color); }
if(st.piece){ const m=st.piece.m; for(let y=0;y<m.length;y++) for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; const gx=st.px+x, gy=st.py+y; if(gy>=0) drawCell(bctx,gx,gy,st.piece.color); } }
}


function updNext(){ nctx.clearRect(0,0,next.width,next.height); if(!st.nextPiece){ if(metaWeight) metaWeight.textContent='—'; if(metaRevenue) metaRevenue.textContent='—'; return; } if(metaWeight) metaWeight.textContent=st.nextPiece.wt; if(metaRevenue) metaRevenue.textContent=st.nextPiece.rev; const m=st.nextPiece.m, cell=20, w=m[0].length*cell, h=m.length*cell, ox=(next.width-w)/2, oy=(next.height-h)/2; for(let y=0;y<m.length;y++) for(let x=0;x<m[0].length;x++){ if(!m[y][x]) continue; nctx.fillStyle=st.nextPiece.color; nctx.fillRect(ox+x*cell,oy+y*cell,cell,cell); nctx.strokeStyle='rgba(0,0,0,.35)'; nctx.lineWidth=2; nctx.strokeRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2); } }


function loop(ts){ if(!st.running) return; if(st.paused){ requestAnimationFrame(loop); return; } if(!st.lastTick) st.lastTick=ts; const dt=ts-st.lastTick; st.timeLeft-=dt/1000; if(st.timeLeft<=0){ gameOver(); return; } const interval = keyDown.has('ArrowDown') ? st.fallAcc : st.fallInterval; if(dt>=interval){ st.lastTick=ts; tryFall(); } updHUD(); render(); requestAnimationFrame(loop); }


function tryFall(){ if(!st.piece) return; if(!collides(st.px, st.py+1, st.piece.m)) st.py++; else { lockPiece(); clrWarn(); spawn(); } }
function hardDrop(){ while(!collides(st.px, st.py+1, st.piece.m)) st.py++; lockPiece(); spawn(); }
function move(dx){ if(!st.piece) return; const nx=st.px+dx; if(!collides(nx, st.py, st.piece.m)) st.px=nx; }
function rotate(){ if(!st.piece) return; const r=rotM(st.piece.m); if(!collides(st.px, st.py, r)) st.piece.m=r; else if(!collides(st.px-1, st.py, r)){ st.px-=1; st.piece.m=r; } else if(!collides(st.px+1, st.py, r)){ st.px+=1; st.piece.m=r; } }


const keyDown=new Set();
on(window,'keydown',(e)=>{ if(!st.running) return; keyDown.add(e.key); if(e.key==='ArrowLeft'){ e.preventDefault(); move(-1);} if(e.key==='ArrowRight'){ e.preventDefault(); move(1);} if(e.key==='ArrowUp'||e.key==='r'||e.key==='R'){ e.preventDefault(); rotate(); } if(e.key===' '){ e.preventDefault(); hardDrop(); } if(e.key==='p'||e.key==='P'){ togglePause(); } });
on(window,'keyup',(e)=> keyDown.delete(e.key));


function togglePause(){ if(!st.running) return; st.paused=!st.paused; if(btnPause) btnPause.textContent = st.paused? 'Продолжить' : 'Пауза'; }


function startGame(){
const ship = SHIPS[shipSizeSel.value]; const duration=Number(durationSel.value);
initBoard(ship.w, ship.h);
st.dwt=ship.dwt; st.curWeight=0; st.revenue=0; st.over=false; st.running=true; st.paused=false;
st.durationSec=duration; st.timeLeft=duration; st.lastTick=0;
hudSize.textContent=ship.label; hudDwt.textContent=ship.dwt; $('#res-size').textContent=ship.label; $('#res-dwt').textContent=ship.dwt;
clrWarn(); st.nextPiece=pickPiece(); spawn(); setScreen(scrGame); if(btnPause) btnPause.textContent='Пауза'; requestAnimationFrame(loop);
}


function gameOver(){ st.running=false; st.over=true; $('#res-weight').textContent=st.curWeight; $('#res-revenue').textContent=st.revenue; const fill=Math.round(100*filledCells()/(st.gridW*st.gridH)); $('#res-fill').textContent=fill; const eff=((st.revenue/Math.max(1,st.dwt))*(fill/100)).toFixed(3); $('#res-eff').textContent=eff; setScreen(scrResult); }


on(btnStart,'click',startGame);
on(btnPause,'click',togglePause);
on(btnRestart,'click',startGame);
on(btnMenu,'click',()=>setScreen(scrMenu));


console.log('Ship Tetris — инициализация завершена');
}


if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
})();
