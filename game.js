const canvas=document.querySelector("#c"),ctx=canvas.getContext("2d");
let W,H,keys={},mouse={x:0,y:0,down:false},running=false,round=1,score=0,money=0,kills=0,time=300,ranked=false,selected=0;
const weapons={
 sniper:{name:"Sniper",slot:"main",dmg:999,rate:900,ammo:5,max:5,range:1000,tier:1,head:2},
 p90:{name:"P90",slot:"main",dmg:18,rate:90,ammo:40,max:40,range:500,tier:1,head:1.8},
 smg:{name:"SMG",slot:"main",dmg:22,rate:130,ammo:30,max:30,range:520,tier:1,head:1.8},
 shotgun:{name:"Double Barrel",slot:"main",dmg:35,rate:650,ammo:2,max:2,range:230,tier:1,head:2},
 ak:{name:"AK-47",slot:"main",dmg:28,rate:150,ammo:30,max:30,range:700,tier:1,head:2},
 paint:{name:"Paintball",slot:"main",dmg:15,rate:170,ammo:20,max:20,range:450,tier:1,head:2},
 rpg:{name:"RPG",slot:"main",dmg:110,rate:1000,ammo:1,max:1,range:700,tier:1,head:1},
 pistol:{name:"Boost Pistol",slot:"pistol",dmg:25,rate:250,ammo:12,max:12,range:500,tier:1,head:2},
 knife:{name:"Knife",slot:"knife",dmg:70,rate:400,ammo:Infinity,max:Infinity,range:70,tier:1,head:1},
 bomb:{name:"Bomb",slot:"bomb",dmg:100,rate:900,ammo:2,max:2,range:180,tier:1,head:1}
};
let loadout=["p90","pistol","knife","bomb"], inv=[...loadout], bots=[],drops=[],pads=[];
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}addEventListener("resize",resize);resize();
document.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key>="1"&&e.key<="4")selected=+e.key-1; if(e.key.toLowerCase()==="r")reload();if(e.code==="Space")jump()});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener("mousedown",e=>{mouse.down=true;shoot()});addEventListener("mouseup",()=>mouse.down=false);addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
function start(){document.querySelector("#lobby").classList.add("hidden");document.querySelector("#game").classList.remove("hidden");running=true;resetRound();requestAnimationFrame(loop)}
function resetRound(){time=300;score=0;bots=[];drops=[];pads=[];for(let i=0;i<8;i++)spawnBot();for(let i=0;i<6;i++)pads.push({x:Math.random()*W,y:Math.random()*H});updateInv()}
function spawnBot(){if(bots.length>=12)return;bots.push({x:Math.random()*W,y:Math.random()*H,hp:100,gun:["p90","smg","ak","pistol"][Math.floor(Math.random()*4)],tier:Math.random()<.2?2:1,shoot:Math.random()*1000})}
function reload(){let w=weapons[inv[selected]];if(w&&w.ammo!==Infinity)w.ammo=w.max}
function jump(){player.vy=-9}
let player={x:W/2,y:H/2,vy:0,on:false,hp:100};
function shoot(){if(!running)return;let w=weapons[inv[selected]];if(!w||w.ammo<=0)return;w.ammo--;let best=null,bd=1e9;
 for(const b of bots){let d=Math.hypot(b.x-player.x,b.y-player.y);if(d<w.range&&d<bd){best=b;bd=d}}
 if(best){let dmg=w.dmg*w.tier;if(Math.abs(best.y-player.y)<28)dmg*=w.head;best.hp-=dmg;score+=Math.round(dmg);if(w.name==="Boost Pistol"){player.x+=(best.x-player.x)/Math.max(1,bd)*75;player.vy=-8}if(w.name==="RPG"&&w.tier>=2)player.vy=-15;if(best.hp<=0){kills++;money+=10;drops.push({x:best.x,y:best.y,gun:["p90","smg","ak","paint","pistol"][Math.floor(Math.random()*5)]});bots.splice(bots.indexOf(best),1);spawnBot();if(kills%5===0){w.tier++;msg("Tier up: "+w.name+" T"+w.tier)}}}
function msg(s){document.querySelector("#msg").textContent=s;setTimeout(()=>document.querySelector("#msg").textContent="",1200)}
function updateInv(){document.querySelector("#inv").innerHTML=inv.map((x,i)=>`<span class="${i===selected?"sel":""}">${i+1}. ${weapons[x].name}</span>`).join("");document.querySelector("#loadout").innerHTML=loadout.map(x=>`<span class="tag">${weapons[x].name}</span>`).join("")}
function physics(){let speed=weapons[inv[2]].name==="Knife"?6:3.5;if(keys.w)player.y-=speed;if(keys.s)player.y+=speed;if(keys.a)player.x-=speed;if(keys.d)player.x+=speed;player.vy+=.5;player.y+=player.vy;if(player.y>H-30){player.y=H-30;player.vy=0}for(const p of pads)if(Math.hypot(p.x-player.x,p.y-player.y)<35)player.vy=-18;
 for(const b of bots){let d=Math.hypot(b.x-player.x,b.y-player.y);let sees=d<380;if(sees){b.x+=(player.x-b.x)/Math.max(d,1)*.7;b.y+=(player.y-b.y)/Math.max(d,1)*.7;if(Math.random()<.02){player.hp-=weapons[b.gun].dmg*b.tier/10}}else{let other=bots.find(q=>q!==b&&Math.hypot(q.x-b.x,q.y-b.y)<220);if(other){other.hp-=1}}}
 if(player.hp<=0){player.hp=100;player.x=W/2;player.y=H/2;msg("Respawned")}time-=1/60;if(time<=0){money+=Math.floor(score/10);round++;msg("Round complete! +$"+Math.floor(score/10));resetRound()}}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle="#151b24";ctx.fillRect(0,0,W,H);ctx.strokeStyle="#252e3a";for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 for(const p of pads){ctx.fillStyle="#384d6b";ctx.beginPath();ctx.arc(p.x,p.y,28,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.fillText("BOOST",p.x-20,p.y+4)}
 for(const d of drops){ctx.fillStyle="#e6c34a";ctx.fillRect(d.x-8,d.y-8,16,16)}
 for(const b of bots){ctx.fillStyle="#d44";ctx.fillRect(b.x-15,b.y-20,30,40);ctx.fillStyle="#111";ctx.fillRect(b.x-9,b.y-13,18,8);ctx.strokeStyle="#f66";ctx.strokeRect(b.x-18,b.y-24,36,48)}
 ctx.fillStyle="#4ad";ctx.beginPath();ctx.arc(player.x,player.y,14,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.fillText("YOU",player.x-14,player.y-20);
 let near=bots.reduce((a,b)=>{let d=Math.hypot(b.x-player.x,b.y-player.y);return d<a.d?{d,b}:a},{d:1e9});if(near.b){let dx=near.b.x-player.x,dy=near.b.y-player.y;let ang=Math.atan2(dy,dx);document.querySelector("#cue").style.borderColor=`hsl(${Math.max(0,120-near.d/4)},90%,55%)`;document.querySelector("#cue").style.transform=`translate(-50%,-50%) rotate(${ang}rad)`}else document.querySelector("#cue").style.borderColor="transparent";
 document.querySelector("#stats").textContent=`HP ${Math.max(0,Math.round(player.hp))} | Score ${score} | $${money} | Kills ${kills} | Round ${round}`;
 document.querySelector("#weapon").textContent=weapons[inv[selected]].name+" T"+weapons[inv[selected]].tier;
 document.querySelector("#timer").textContent=`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,"0")}`;updateInv()}
function loop(){if(!running)return;physics();if(mouse.down)shoot();draw();requestAnimationFrame(loop)}
document.querySelector("#start").onclick=start;
document.querySelector("#daily").onclick=()=>{money+=50;document.querySelector("#lobbyMsg").textContent="Daily reward claimed: +$50";};
document.querySelector("#ranked").onclick=()=>{ranked=!ranked;document.querySelector("#lobbyMsg").textContent=ranked?"Ranked mode ON":"Ranked mode OFF"};
document.querySelector("#shop").onclick=()=>{money+=0;document.querySelector("#lobbyMsg").textContent=`Shop: gun/player/bomb skins cost $50 each. Balance: $${money}`};
updateInv();
