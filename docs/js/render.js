import{STAGES,WEAPONS,HEIGHT}from'./levels.js';import{clamp}from'./engine.js';
const r=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
const txt=(c,s,x,y,size=14,col='#effaff',align='left')=>{c.font=`600 ${size}px ui-monospace,monospace`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y);};
const hash=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
const poly=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
export function robot(c,x,y,{face=1,t=0,run=false,air=false,dash=false,shooting=false,charge=0,scale=1,color='#3aafff'}={}){
 c.save();c.translate(Math.round(x+14*scale),Math.round(y+22*scale));c.scale(scale*face,scale);
 const ink='#07152e',blue=color,shade='#175b9e',light='#b5f3ff',step=run?Math.sin(t*22)*8:0;
 if(dash){c.translate(0,7);c.rotate(-.28);}
 const front=air?6:step,back=air?-7:-step;
 // Compact helmet, separate face and articulated boots keep the silhouette readable at phone size.
 poly(c,[[-8,-3],[-22,-7+Math.sin(t*9)*2],[-17,0],[-25,4],[-8,5]],'#ffb27a');
 for(const [xx,k,col]of[[-8,back,shade],[4,front,blue]]){poly(c,[[xx-4,7],[xx+5,7],[xx+7+k*.55,18],[xx+4+k,24],[xx-4+k,22]],ink);r(c,xx-2,9,6,8,col);r(c,xx-5+k,17,12,9,ink);r(c,xx-4+k,18,11,7,col);r(c,xx-3+k,18,7,2,light);r(c,xx-5+k,25,15,3,ink);r(c,xx-4+k,24,13,2,col);}
 r(c,-12,-5,8,13,ink);r(c,-13,-4,7,11,shade);r(c,-13,4,7,5,blue);r(c,-12,-3,3,3,light);
 poly(c,[[-9,-8],[8,-8],[12,-2],[9,11],[-9,11],[-12,-1]],ink);r(c,-8,-6,16,13,blue);r(c,-7,-5,13,3,light);r(c,-7,7,16,5,shade);r(c,-3,0,7,5,'#f7e1a3');r(c,-1,0,3,4,'#fff9df');
 poly(c,[[-11,-23],[-7,-29],[8,-29],[14,-23],[14,-10],[8,-7],[-8,-7],[-12,-12]],ink);
 poly(c,[[-10,-22],[-6,-27],[8,-27],[12,-22],[12,-11],[8,-9],[-8,-9],[-10,-13]],blue);
 r(c,-5,-27,7,9,light);r(c,-3,-27,3,8,'#eaffff');
 poly(c,[[-2,-20],[12,-20],[12,-11],[8,-9],[1,-10],[-2,-14]],'#ffe8c1');r(c,5,-18,3,6,ink);r(c,5,-18,2,3,'#efffff');r(c,10,-17,2,4,ink);r(c,4,-11,6,1,'#bd8a79');
 r(c,-12,-20,7,10,ink);r(c,-11,-19,6,8,shade);r(c,-10,-18,4,4,light);r(c,-7,-11,5,3,blue);
 const a=shooting||charge>.2?-5:1;r(c,7,a-2,10,10,ink);r(c,8,a-1,8,7,blue);r(c,14,a-3,14,14,ink);r(c,15,a-2,12,12,blue);r(c,16,a-1,8,3,light);r(c,24,a,6,8,shade);r(c,27,a+1,3,6,'#d8ffff');r(c,28,a+2,2,4,ink);
 if(shooting)poly(c,[[31,a],[39,a-4],[36,a+3],[43,a+5],[35,a+6],[38,a+11],[30,a+8]],'#fff4b3');
 if(charge>.35){const col=charge>=1?'#ffe39b':'#75e9ff';c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(20,a+4,14+Math.sin(t*25)*3,0,Math.PI*2);c.stroke();for(let k=0;k<6;k++){const q=t*9+k*Math.PI/3,dist=23-(t*35+k*4)%14;r(c,20+Math.cos(q)*dist,a+4+Math.sin(q)*dist,3,3,col);}}
 c.restore();
}
export function bossArt(c,x,y,s,t=0,state='idle',face=-1,hurt=false,scale=1){
 c.save();c.translate(Math.round(x+34*scale),Math.round(y+40*scale));c.scale(face*scale,scale);
 const a=hurt?'#fff':s.accent,ink='#081329',shell=['#2475b0','#874943','#697caf','#693c82'][s.id];
 if(s.id===0){
  const flap=['tell','dive'].includes(state)?Math.sin(t*14)*12:Math.sin(t*3)*3;
  for(const dir of[-1,1]){poly(c,[[dir*15,-20],[dir*74,-48+flap],[dir*55,-15],[dir*33,1]],ink);poly(c,[[dir*23,-20],[dir*67,-41+flap],[dir*49,-15],[dir*31,-3]],a);for(let k=0;k<3;k++)poly(c,[[dir*(32+k*11),-19+k*3],[dir*(59+k*5),-33+flap],[dir*(42+k*10),-6+k*3]],shell);}
  poly(c,[[-25,-19],[24,-19],[19,18],[0,31],[-20,18]],ink);poly(c,[[-20,-16],[20,-16],[14,14],[0,23],[-14,13]],shell);poly(c,[[-15,-14],[16,-14],[0,9]],a);
  r(c,-16,-38,32,23,ink);r(c,-13,-37,27,17,shell);poly(c,[[-17,-37],[-9,-53],[0,-35],[12,-48],[17,-30]],a);r(c,-10,-30,24,6,ink);r(c,2,-29,11,3,'#ffdd84');poly(c,[[13,-26],[30,-20],[12,-17]],'#ffe5a4');
  for(const dir of[-1,1]){poly(c,[[dir*7,19],[dir*17,19],[dir*23,36],[dir*7,36]],shell);for(let k=0;k<3;k++)poly(c,[[dir*(7+k*5),32],[dir*(11+k*5),32],[dir*(15+k*5),42]],a);}
 }else if(s.id===1){
  r(c,-35,-24,70,55,ink);r(c,-31,-21,62,45,shell);r(c,-26,-16,52,31,'#2a1a2b');r(c,-22,-12,44,25,'#df663f');r(c,-16,-8,32,16,a);for(let k=-18;k<24;k+=10)r(c,k,-15,5,33,'#442c37');
  for(const dir of[-1,1]){r(c,dir*34-13,-27,27,20,ink);r(c,dir*34-10,-24,22,15,shell);r(c,dir*42-14,-4,29,32,ink);r(c,dir*42-11,-1,24,25,shell);r(c,dir*42-9,0,20,5,a);r(c,dir*17-13,26,27,17,ink);r(c,dir*17-11,28,23,12,shell);r(c,dir*17-10,29,21,4,a);r(c,dir*24-4,-45,8,22,'#3e2c38');}
  r(c,-22,-44,44,22,ink);r(c,-19,-41,38,17,shell);r(c,-15,-37,30,7,'#1e1729');r(c,-12,-35,10,3,'#fff4ae');r(c,5,-35,10,3,'#fff4ae');r(c,-15,-25,30,4,a);
 }else if(s.id===2){
  for(const dir of[-1,1]){poly(c,[[dir*16,-13],[dir*42,-34],[dir*65,-18],[dir*49,21],[dir*53,-12],[dir*40,-20],[dir*27,3]],ink);poly(c,[[dir*24,-12],[dir*41,-28],[dir*59,-17],[dir*50,11],[dir*51,-15],[dir*41,-21]],a);}
  poly(c,[[-20,-25],[20,-25],[17,12],[0,28],[-16,12]],ink);poly(c,[[-15,-22],[16,-22],[12,9],[0,20],[-12,8]],shell);poly(c,[[0,-19],[10,-5],[0,9],[-10,-5]],a);
  poly(c,[[-19,-31],[-11,-48],[0,-39],[13,-49],[21,-31],[10,-18],[-11,-18]],ink);poly(c,[[-15,-31],[-10,-42],[0,-35],[12,-42],[16,-30],[9,-23],[-9,-23]],shell);r(c,-13,-32,28,6,ink);r(c,-10,-31,9,3,'#ffb5e9');r(c,5,-31,9,3,'#ffb5e9');
  for(const dir of[-1,1]){poly(c,[[dir*7,14],[dir*16,13],[dir*24,32],[dir*33,39],[dir*8,39],[dir*13,30]],shell);poly(c,[[dir*10,34],[dir*31,38],[dir*6,42]],a);}
 }else{
  c.strokeStyle=a;c.lineWidth=3;c.beginPath();c.arc(0,-4,65,0,Math.PI*2);c.stroke();for(let k=0;k<8;k++){const q=t*.7+k*Math.PI/4;poly(c,[[Math.cos(q)*69,Math.sin(q)*69-4],[Math.cos(q+.08)*53,Math.sin(q+.08)*53-4],[Math.cos(q-.08)*53,Math.sin(q-.08)*53-4]],k%2?a:'#bbf6ff');}
  poly(c,[[-29,-22],[29,-22],[34,23],[0,42],[-34,23]],ink);poly(c,[[-24,-18],[24,-18],[26,18],[0,33],[-26,18]],shell);poly(c,[[0,-18],[18,3],[0,23],[-18,3]],a);poly(c,[[0,-10],[10,3],[0,15],[-10,3]],'#fff5d7');
  poly(c,[[-21,-29],[-26,-49],[-10,-41],[0,-52],[11,-41],[27,-49],[21,-28]],a);r(c,-19,-32,38,17,ink);r(c,-14,-29,29,7,shell);r(c,-10,-26,8,3,'#ffb3e1');r(c,5,-26,8,3,'#ffb3e1');
  for(const dir of[-1,1]){r(c,dir*36-9,-12,18,34,ink);r(c,dir*36-7,-10,14,29,shell);r(c,dir*36-5,0,10,11,a);}
 }
 if(state==='tell'||state==='stagger'){c.strokeStyle=state==='stagger'?'#fff7ad':a;c.lineWidth=2;c.beginPath();c.arc(0,-5,47+Math.sin(t*24)*5,0,Math.PI*2);c.stroke();}
 c.restore();
}
function skyline(c,s,w,cam=0,t=0){
 const sky=c.createLinearGradient(0,0,0,540);s.sky.forEach((col,i)=>sky.addColorStop(i/2,col));c.fillStyle=sky;c.fillRect(0,0,w,540);
 const sx=w*.72-cam*.025;c.fillStyle=s.theme==='fire'?'#aa6355':s.theme==='core'?'#8b5084':'#668c9e';c.globalAlpha=.36;c.beginPath();c.arc(sx,155,68,0,Math.PI*2);c.fill();c.strokeStyle=s.accent;c.globalAlpha=.25;c.lineWidth=2;c.beginPath();c.arc(sx,155,87,-.5,Math.PI*1.4);c.stroke();c.globalAlpha=1;
 for(let i=0;i<38;i++)r(c,(hash(i+21)*2200-cam*.045+w*3)%w,hash(i+77)*260,i%7?1:2,i%7?1:2,'#8aafc5');
 for(let layer=0;layer<3;layer++){const stride=layer===0?126:106,speed=[.1,.23,.4][layer],base=[365,401,448][layer],left=Math.floor(cam*speed/stride)-1,right=left+Math.ceil(w/stride)+3;
  for(let i=left;i<right;i++){const seed=i+layer*513,x=i*stride-cam*speed,bh=74+hash(seed+900)*[166,194,158][layer],bw=58+hash(seed+181)*52,y=base-bh;
   const cols=s.theme==='fire'?['#362536','#402c3d','#302432']:s.theme==='core'?['#292039','#352541','#271e36']:['#1c334a','#234057','#172e44'];r(c,x,y,bw,bh,cols[layer]);r(c,x+4,y-5,bw-8,6,cols[layer]);if(hash(seed+32)>.55){r(c,x+bw*.6,y-31,3,31,cols[layer]);r(c,x+bw*.6,y-34,3,3,s.accent);}
   if(s.theme==='fire'&&i%3===0){r(c,x+8,y-28,13,28,cols[layer]);for(let k=0;k<3;k++){c.globalAlpha=.1;r(c,x+5+Math.sin(t+k)*8,y-55-k*20,24+k*8,18,'#af8480');c.globalAlpha=1;}}
   for(let row=0;row<Math.floor(bh/20)-1;row++)for(let col=0;col<Math.floor(bw/16)-1;col++)if(hash(seed*83+row*19+col)>.54)r(c,x+9+col*16,y+14+row*20,3+(layer===2?2:0),6,layer===2?'#568c9e':s.theme==='fire'?'#9b6761':'#44738a');
   if(layer===1&&i%3===0){r(c,x+6,y+bh*.4,bw-12,2,s.accent);c.globalAlpha=.1;r(c,x+6,y+bh*.4-5,bw-12,14,s.accent);c.globalAlpha=1;}if(layer===2&&i%2===0){r(c,x+bw,base-60,stride-bw+2,5,cols[layer]);r(c,x+bw+10,base-59,4,20,cols[layer]);}if(s.theme==='ice')poly(c,[[x,y],[x+bw,y],[x+bw,y+6],[x+bw*.6,y+3],[x+bw*.35,y+11],[x,y+5]],'#6b95b1');
  }
 }
 if(s.theme==='ice')for(let i=0;i<40;i++)r(c,(hash(i+301)*w+t*(10+hash(i)*20))%w,(hash(i+811)*530+t*16)%540,2,2,'#bacfe5');
 else for(let i=0;i<14;i++){c.globalAlpha=.35;r(c,(hash(i+111)*w+t*6)%w,200+(hash(i+216)*310-t*9+10000)%310,2,3,s.accent);c.globalAlpha=1;}
 const fog=c.createLinearGradient(0,400,0,540);fog.addColorStop(0,'#090f2200');fog.addColorStop(1,'#090f22');c.fillStyle=fog;c.fillRect(0,400,w,140);
}
export function background(c,s,w,cam=0,t=0){
 if(s.id===0){
  skyline(c,s,w,cam,t);
  for(let i=Math.floor(cam*.18/400)-1;i<Math.floor(cam*.18/400)+w/400+3;i++){const x=i*400-cam*.18;r(c,x+170,208,9,224,'#24475e');r(c,x+90,283,173,7,'#2f5267');c.save();c.translate(x+174,209);c.rotate(t*.6+i);for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);poly(c,[[0,-6],[72,-14],[54,1],[0,6]],'#395f72');}c.restore();r(c,x+167,201,16,16,'#8fc3d0');}
  return;
 }
 const grad=c.createLinearGradient(0,0,0,540);s.sky.forEach((col,i)=>grad.addColorStop(i/2,col));c.fillStyle=grad;c.fillRect(0,0,w,540);
 if(s.id===1){
  // Furnace hall: suspended crucibles, giant gears, pipes and flowing molten metal.
  for(let i=Math.floor(cam*.16/220)-1;i<Math.floor(cam*.16/220)+w/220+3;i++){
   const x=i*220-cam*.16;r(c,x+18,0,26,540,'#302132');r(c,x+23,0,5,540,'#573442');r(c,x+38,85,185,17,'#322234');
   r(c,x+83,118,80,255,'#372330');r(c,x+89,132,68,222,'#9d4239');r(c,x+97,143,52,200,'#e1814c');r(c,x+105,144,14,198,'#ffc476');
   for(let j=0;j<7;j++)r(c,x+87,126+j*37,72,8,'#4c2c38');
   c.save();c.translate(x+43,220);c.rotate(t*.3+i);for(let j=0;j<10;j++){c.rotate(Math.PI/5);r(c,-8,-58,16,30,'#49313d');}c.fillStyle='#251d2d';c.beginPath();c.arc(0,0,40,0,Math.PI*2);c.fill();c.restore();
   poly(c,[[x+168,50],[x+201,50],[x+197,160],[x+176,160]],'#68413f');r(c,x+178,160,14,47+Math.sin(t*2+i)*16,'#ffbb6d');
  }
  for(let i=0;i<28;i++)r(c,(hash(i+11)*w-t*(4+hash(i)*12)+w*100)%w,540-(hash(i+34)*540+t*35)%540,2,4,i%3?'#ffa469':'#ffdf97');
 }else if(s.id===2){
  // Glacial archive: far ice peaks and close memory-bank towers, rather than city recoloring.
  for(let i=-1;i<w/240+2;i++){const x=i*240-(cam*.08)%240;poly(c,[[x-90,390],[x+100,60+hash(i+51)*80],[x+290,390]],'#304b72');poly(c,[[x+100,70+hash(i+51)*80],[x+100,330],[x+290,390]],'#496887');}
  for(let i=Math.floor(cam*.24/180)-1;i<Math.floor(cam*.24/180)+w/180+3;i++){
   const x=i*180-cam*.24;r(c,x+10,130,126,318,'#20354f');r(c,x+15,135,116,6,'#90c4d5');r(c,x+20,154,106,267,'#314e6b');
   for(let j=0;j<5;j++){r(c,x+29,166+j*48,86,35,'#192c48');r(c,x+33,171+j*48,4,5,'#a9e1e7');r(c,x+45,171+j*48,51,2,'#658fab');r(c,x+44,181+j*48,64,2,'#476987');}
   poly(c,[[x+10,130],[x+137,130],[x+120,157],[x+102,139],[x+63,173],[x+49,139],[x+19,155]],'#739cb8');
  }
  for(let i=0;i<45;i++)r(c,(hash(i+301)*w+t*(10+hash(i)*20))%w,(hash(i+811)*540+t*22)%540,2,2,'#bce6f3');
 }else{
  // Control core: circuit conduits and a suspended central reactor.
  for(let i=Math.floor(cam*.22/144)-1;i<Math.floor(cam*.22/144)+w/144+3;i++){const x=i*144-cam*.22;r(c,x,30,116,460,'#20182f');r(c,x+4,34,108,3,'#5d3766');for(let j=0;j<5;j++){const yy=72+j*76;c.strokeStyle='#533251';c.lineWidth=2;c.beginPath();c.moveTo(x+10,yy);c.lineTo(x+42,yy);c.lineTo(x+63,yy+20);c.lineTo(x+105,yy+20);c.stroke();r(c,x+42,yy-3,5,5,Math.sin(t*2+i+j)>.3?'#f19bd2':'#7d5483');}}
  const x=w*.67-(cam*.04)%70;c.save();c.translate(x,220);for(let i=0;i<3;i++){c.rotate(t*.02*(i%2?-1:1));c.strokeStyle=['#704977','#ae70a9','#c993bb'][i];c.lineWidth=5-i;c.beginPath();c.ellipse(0,0,100-i*20,165-i*30,t*.12*(i%2?-1:1),0,Math.PI*2);c.stroke();}poly(c,[[0,-95],[52,0],[0,95],[-52,0]],'#794e86');poly(c,[[0,-67],[33,0],[0,67],[-33,0]],'#d796cf');poly(c,[[0,-43],[15,0],[0,43],[-15,0]],'#ffdbee');c.restore();
 }
 const fog=c.createLinearGradient(0,400,0,540);fog.addColorStop(0,'#0a102000');fog.addColorStop(1,'#0a1020');c.fillStyle=fog;c.fillRect(0,400,w,140);
}
function deviceArt(c,d,t){
 const col=WEAPONS.find(w=>w.id===d.weapon).color;
 if(d.kind==='icewall'){
  if(d.active)return;poly(c,[[d.x+5,d.y],[d.x+d.w-6,d.y+8],[d.x+d.w,d.y+d.h],[d.x,d.y+d.h],[d.x+3,d.y+20]],'#779abd');poly(c,[[d.x+8,d.y+8],[d.x+22,d.y+20],[d.x+14,d.y+d.h-4],[d.x+3,d.y+d.h]],'#c9efff');poly(c,[[d.x+24,d.y+18],[d.x+40,d.y+10],[d.x+34,d.y+d.h],[d.x+18,d.y+d.h-13]],'#a2cde7');txt(c,'F',d.x+23,d.y+d.h/2,18,'#24374e','center');
 }else if(d.kind==='relay'){
  r(c,d.x-4,d.y,d.w+8,d.h,'#101d30');r(c,d.x,d.y+4,d.w,d.h-8,d.active?'#426d58':'#4c5062');r(c,d.x+5,d.y+10,d.w-10,28,'#102334');poly(c,[[d.x+21,d.y+12],[d.x+10,d.y+28],[d.x+19,d.y+28],[d.x+14,d.y+37],[d.x+29,d.y+21],[d.x+21,d.y+21]],d.active?'#aaffbc':col);for(let k=0;k<3;k++)r(c,d.x+6+k*9,d.y+47,5,5,d.active?'#aaffbc':'#787081');
 }else{
  const cx=d.x+d.w/2,cy=d.y+37;r(c,d.x-4,d.y+65,d.w+8,25,'#2b4055');c.save();c.translate(cx,cy);c.strokeStyle=d.active?'#d8f7ff':'#678ba2';c.lineWidth=5;c.beginPath();c.arc(0,0,33,0,Math.PI*2);c.stroke();c.rotate(d.active?0:t*9);for(let k=0;k<4;k++){c.rotate(Math.PI/2);poly(c,[[0,-4],[27,-13],[27,0],[5,7]],d.active?'#aeddf3':'#4c7b98');}r(c,-5,-5,10,10,d.active?'#ebfbff':'#b0d6e6');c.restore();
  if(!d.active){c.strokeStyle='#b4d7e466';c.lineWidth=2;for(let k=0;k<4;k++){const x=d.x-155+(t*130+k*43)%130;c.beginPath();c.moveTo(x,cy-30+k*18);c.lineTo(x-26,cy-30+k*18);c.stroke();}}
 }
 if(d.active){txt(c,'LINKED',d.x+d.w/2,d.y-12,10,'#a7ffd0','center');}else{r(c,d.x+d.w/2-11,d.y-25,22,18,'#11243b');txt(c,WEAPONS.find(w=>w.id===d.weapon).short,d.x+d.w/2,d.y-11,12,col,'center');}
}
function projectile(c,b,t){
 const cx=b.x+b.w/2,cy=b.y+b.h/2;
 if(b.trail)for(let i=0;i<b.trail.length;i++){const p=b.trail[i];c.globalAlpha=i/b.trail.length*.3;r(c,p.x-3,p.y-3,6,6,b.color);}c.globalAlpha=1;
 if(b.weapon==='arc'||b.kind==='scythe'){
  c.save();c.translate(cx,cy);c.rotate(t*(b.weapon==='arc'?24:12));for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);poly(c,[[0,-3],[19,-10],[11,2],[1,8]],b.color);poly(c,[[1,-2],[13,-6],[8,1]],'#fff9e1');}c.restore();
 }else if(b.weapon==='flame'||b.kind==='fireball'){
  const radius=b.w*.53;for(let k=0;k<7;k++){const a=t*16+k*Math.PI*2/7;poly(c,[[cx+Math.cos(a)*radius*.4,cy+Math.sin(a)*radius*.4],[cx+Math.cos(a+.4)*(radius+5),cy+Math.sin(a+.4)*(radius+5)],[cx+Math.cos(a+.8)*radius*.8,cy+Math.sin(a+.8)*radius*.8]],'#ed6f50');}c.fillStyle='#ffbc71';c.beginPath();c.arc(cx,cy,radius*.68,0,Math.PI*2);c.fill();c.fillStyle='#fff3b1';c.beginPath();c.arc(cx,cy,radius*.35,0,Math.PI*2);c.fill();
 }else if(b.weapon==='frost'||b.kind==='feather'){
  const dir=b.vx>0?1:-1;poly(c,[[cx+dir*b.w*.7,cy],[cx-dir*b.w*.35,cy-b.h*.7],[cx-dir*b.w*.1,cy],[cx-dir*b.w*.35,cy+b.h*.7]],b.color);poly(c,[[cx+dir*b.w*.6,cy],[cx-dir*b.w*.25,cy-2],[cx-dir*b.w*.25,cy+2]],'#f3ffff');
 }else if(b.kind==='wave'){poly(c,[[b.x-6,b.y+b.h],[cx,b.y-12],[b.x+b.w+6,b.y+b.h]],b.color);poly(c,[[b.x+5,b.y+b.h],[cx,b.y+3],[b.x+b.w-5,b.y+b.h]],'#fff4d1');}
 else{c.globalAlpha=.2;r(c,b.x-5,b.y-4,b.w+10,b.h+8,b.color);c.globalAlpha=1;c.fillStyle=b.color;c.beginPath();c.ellipse(cx,cy,b.w*.55,b.h*.55,0,0,Math.PI*2);c.fill();r(c,b.x+3,b.y+2,Math.max(2,b.w-7),Math.max(2,b.h-4),'#fffadd');}
}
function effectArt(c,e){const a=1-e.life/e.max;c.globalAlpha=Math.min(1,e.life/e.max*2);c.strokeStyle=e.color;c.lineWidth=2;
 if(e.kind==='ring'||e.kind==='freeze'){c.beginPath();c.arc(e.x,e.y,Math.max(1,e.size*a),0,Math.PI*2);c.stroke();}
 else{for(let k=0;k<7;k++){const angle=k*Math.PI*2/7,inner=e.size*a*.5,outer=e.size*(.2+a);c.beginPath();c.moveTo(e.x+Math.cos(angle)*inner,e.y+Math.sin(angle)*inner);c.lineTo(e.x+Math.cos(angle)*outer,e.y+Math.sin(angle)*outer);c.stroke();}if(a<.4)r(c,e.x-4,e.y-4,8,8,'#fff7d9');}
 c.globalAlpha=1;
}
function platform(c,p,s,t){const{x,y,w,h}=p;r(c,x,y,w,h,s.dark);r(c,x,y+4,w,Math.min(h-4,28),s.tile);r(c,x,y,w,3,p.kind==='ice'?'#c5e5ff':s.accent);r(c,x+2,y+4,w-4,2,'#80a8b5');
 for(let xx=x+6;xx<x+w-4;xx+=32){r(c,xx,y+12,20,9,s.dark);r(c,xx+1,y+12,18,1,'#476172');r(c,xx+24,y+11,2,2,'#7c9bab');if(!p.oneWay&&h>40){r(c,xx-3,y+38,28,h-40,s.tile);r(c,xx,y+40,2,h-48,s.dark);}}
 if(p.oneWay){r(c,x+7,y+h,4,7,s.tile);r(c,x+w-11,y+h,4,7,s.tile);}if(p.kind==='belt')for(let xx=x+8;xx<x+w-8;xx+=28){const a=t*30%14;poly(c,[[xx+a,y+6],[xx+7+a,y+6],[xx+13+a,y+12],[xx+7+a,y+18],[xx+a,y+18],[xx+6+a,y+12]],'#e9b477');}
 if(p.kind==='ice')for(let xx=x+10;xx<x+w;xx+=43)poly(c,[[xx,y],[xx+9,y],[xx+4,y+10]],'#a4daef');if(p.kind==='moving'){r(c,x+12,y+h,14,5,'#68e8ff');r(c,x+w-26,y+h,14,5,'#68e8ff');}
}
function enemy(c,e,t){const col=e.hit>0?'#fff':e.slow>0?'#acd5ff':e.type==='drone'?'#c395de':e.type==='hopper'?'#eaa57c':'#e1b475';c.save();c.translate(Math.round(e.x+e.w/2),Math.round(e.y));
 if(e.type==='helmet'){r(c,-17,18,34,12,'#152439');if(e.open){r(c,-11,8,22,20,'#456980');r(c,-7,12,15,7,'#0b1c32');r(c,-4,13,4,3,'#fff3b0');r(c,5,13,4,3,'#fff3b0');}poly(c,[[-18,e.open?8:23],[-15,e.open?-1:7],[-8,e.open?-6:2],[9,e.open?-6:2],[16,e.open?0:8],[19,e.open?8:23]],col);r(c,-21,e.open?8:22,42,5,'#f0cf75');r(c,-3,e.open?-5:4,6,12,'#354b63');r(c,-15,28,12,4,'#65798c');r(c,5,28,12,4,'#65798c');}
 else if(e.type==='shield'){r(c,-13,4,25,25,col);r(c,-8,-3,18,11,'#243751');r(c,-6,0,14,4,'#ffe79d');r(c,-12,30,9,12,'#4c6680');r(c,5,30,9,12,'#4c6680');const sx=e.face>0?12:-23;r(c,sx-2,1,14,42,'#0b1c33');r(c,sx,3,10,37,'#607e92');r(c,sx+2,5,3,32,'#caf4e9');r(c,-7,15,9,6,'#102337');}
 else if(e.type==='sentry'){r(c,-20,-7,40,8,'#4d536f');r(c,-13,0,26,17,col);r(c,-7,10,14,13,'#1d2944');r(c,-4,16,8,7,e.tell>0?'#fff4b4':'#e99dcc');}
 else if(e.type==='drone'){r(c,-19,7,38,9,'#172239');r(c,-13,3,26,18,col);r(c,-8,0,16,5,col);r(c,-10,10,20,7,'#122239');r(c,-7,11,4,3,'#fff0ae');r(c,3,11,4,3,'#fff0ae');for(const d of[-1,1]){r(c,d*22-7,7,14,3,col);r(c,d*22-9-Math.sin(t*30)*2,2,18,2,'#6c99bb');}r(c,-5,23,10,3,'#6ee6ff');}
 else if(e.type==='turret'){r(c,-19,24,38,6,'#172139');r(c,-14,20,28,5,col);r(c,-12,2,24,21,'#18273e');r(c,-10,0,20,19,col);r(c,-7,5,14,7,'#10243a');r(c,e.face>0?5:-25,8,20,9,'#718195');r(c,e.face>0?21:-26,9,5,7,e.tell>0?'#fff4b6':'#ffc486');}
 else{const st=e.type==='hopper'?4:Math.sin(t*10)*4;r(c,-14,2,28,22,'#142139');r(c,-12,0,24,20,col);r(c,-14,6,28,3,col);r(c,-10,7,20,7,'#1b2a42');r(c,-7,9,4,3,'#fff4bc');r(c,3,9,4,3,'#fff4bc');r(c,-11-st*.5,23,8,7,'#49546d');r(c,4+st*.5,23,8,7,'#49546d');r(c,-13-st*.5,28,12,3,col);r(c,3+st*.5,28,12,3,col);if(e.type==='hopper'){r(c,-9,-4,3,6,col);r(c,6,-4,3,6,col);}}
 if(e.frozen>0){c.globalAlpha=.5;r(c,-e.w/2-5,-4,e.w+10,e.h+7,'#b4e6ff');c.globalAlpha=1;c.strokeStyle='#dcfbff';c.strokeRect(-e.w/2-5,-4,e.w+10,e.h+7);r(c,-e.w/2-6,-5,e.w+12,3,'#efffff');}
 if(e.tell>0)txt(c,'!',0,-9,18,'#ffcb8b','center');c.restore();
}
export class Renderer{
 constructor(canvas,game){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.game=game;this.w=960;this.menuClock=0;}
 resize(){const b=this.canvas.getBoundingClientRect();this.w=clamp(Math.round(b.width/Math.max(1,b.height)*HEIGHT),480,1440);this.canvas.width=this.w;this.canvas.height=HEIGHT;this.c.imageSmoothingEnabled=false;this.game.viewW=this.w;}
 render(dt=0){
  const g=this.game,c=this.c,w=this.w,menu=['title','select'].includes(g.mode);this.menuClock+=g.save.reducedMotion?0:Math.min(dt,.05);const t=g.save.reducedMotion?0:menu?this.menuClock:g.clock,s=menu?STAGES[0]:g.level,cam=menu?t*9:g.camera;background(c,s,w,g.save.reducedMotion?0:cam,t);
  if(menu){const x=w*.76;platform(c,{x:x-165,y:410,w:340,h:130,kind:'solid'},s,t);robot(c,x-34,287+Math.sin(t*2)*2,{scale:2.55,t});txt(c,'PR–01',x-4,473,13,'#5e8a9f','center');txt(c,'SIGNAL FOUND_',x+15,240,12,'#7aaec0','center');c.strokeStyle='#4b7e9766';c.strokeRect(x-105,260,210,132);return;}
  c.save();if(!g.save.reducedMotion&&g.shake>0)c.translate((Math.random()-.5)*g.shake,(Math.random()-.5)*g.shake);c.translate(-Math.round(cam),0);const visible=p=>p.x+p.w>cam-60&&p.x<cam+w+60;
  for(const p of [...g.level.solids,...g.platforms,...g.devices.filter(d=>d.active&&d.bridge).map(d=>({...d.bridge,oneWay:true}))])if(visible(p))platform(c,p,s,t);
  for(const cp of g.level.checkpoints){if(cp.x<cam-60||cp.x>cam+w+60)continue;const active=g.level.checkpoints.indexOf(cp)<g.checkpoint;r(c,cp.x,cp.y-72,4,72,'#88a7bc');r(c,cp.x-8,cp.y-5,20,5,'#5b849e');poly(c,[[cp.x+4,cp.y-71],[cp.x+36,cp.y-61],[cp.x+4,cp.y-50]],active?'#a1ffc7':'#a0c7d6');r(c,cp.x-2,cp.y-76,8,6,active?'#a1ffc7':'#fff1b8');}
  for(const q of g.level.signs)if(q.x>cam-160&&q.x<cam+w)txt(c,q.text,q.x,q.y,12,'#cae4ec');
  for(const i of g.items){if(i.dead||!visible(i)||(i.requires&&!g.devices.some(d=>d.id===i.requires&&d.active)))continue;const x=i.x+9,y=i.y+7+Math.sin(t*3+i.x)*3;
   if(i.type==='upgrade'){c.strokeStyle='#a9ffd1';c.lineWidth=2;c.strokeRect(x-14,y-16,28,32);r(c,x-10,y-12,20,24,'#92deb1');r(c,x-3,y-9,6,18,'#153b3b');r(c,x-9,y-3,18,6,'#153b3b');txt(c,'LIFE +2',x,y-24,10,'#c7ffe1','center');}
   else if(i.type==='core'){c.strokeStyle='#f7d898';c.lineWidth=1;c.strokeRect(x-13,y-13,26,26);poly(c,[[x,y-10],[x+9,y],[x,y+10],[x-9,y]],'#ffdb96');poly(c,[[x,y-6],[x+5,y],[x,y+6],[x-5,y]],'#fff5cc');}
   else if(i.type==='health'){r(c,x-9,y-10,18,21,'#163547');r(c,x-8,y-9,16,19,'#8fe9ba');r(c,x-2,y-5,4,12,'#164251');r(c,x-6,y-1,12,4,'#164251');}
   else poly(c,[[x+1,y-10],[x-7,y+1],[x-1,y+1],[x-3,y+10],[x+8,y-3],[x+2,y-3]],'#b6edee');
  }
  for(const d of g.devices)if(visible(d))deviceArt(c,d,t);
  for(const h of g.level.hazards){if(!visible(h))continue;if(h.kind==='press'){r(c,h.x+12,0,h.w-24,h.active?404:h.y,'#516078');r(c,h.x-6,h.active?394:h.y,h.w+12,26,h.warning?'#ffdb9e':'#997769');if(h.disabled)txt(c,'OFF',h.x+h.w/2,h.y-12,11,'#a4ffca','center');continue;}r(c,h.x-5,h.y+h.h-9,h.w+10,9,'#1b283b');if(h.active){c.globalAlpha=.24;r(c,h.x-7,h.y,h.w+14,h.h,s.accent);c.globalAlpha=1;r(c,h.x+5,h.y+Math.sin(t*30)*6,h.w-10,h.h,'#fff0cb');r(c,h.x,h.y,h.w,4,s.accent);if(h.kind==='vent')for(let k=0;k<5;k++)poly(c,[[h.x+k*7,h.y+20],[h.x+k*7+4,h.y-4-Math.sin(t*20+k)*11],[h.x+k*7+8,h.y+30]],'#ffbb86');}else if(h.warning){txt(c,'!',h.x+h.w/2,h.y+20,25,'#ffdc92','center');r(c,h.x,h.y+h.h-6,h.w,5,'#ffe0a8');}}
  const gate=g.level.gate;r(c,gate-8,254,40,166,'#15263a');r(c,gate,263,24,157,'#334e65');for(let y=274;y<420;y+=18)r(c,gate+3,y,18,4,g.boss.active&&!g.boss.dead?s.accent:'#5c798d');txt(c,'BOSS',gate+12,243,12,s.accent,'center');
  for(const e of g.enemies)if(!e.dead&&visible(e))enemy(c,e,t);const b=g.boss;if(!b.dead&&visible(b))bossArt(c,b.x,b.y,s,t,b.state,b.face,b.hit>0);
  if(b.active&&!b.dead&&b.state==='tell'){
   const names={feather:'FEATHER',dive:'DIVE',storm:'THUNDER',quake:'QUAKE',furnace:'FIREBALL',flamewall:'FIRE WALL',scythe:'SCYTHE',skate:'DASH',icicle:'ICICLE'};txt(c,names[b.action],b.x+34,b.y-58,13,s.accent,'center');
   if(['dive','skate'].includes(b.action)){c.strokeStyle=s.accent;c.globalAlpha=.6;c.setLineDash([8,8]);c.beginPath();c.moveTo(b.x+34,b.y+40);c.lineTo(b.targetX+14,414);c.stroke();c.setLineDash([]);c.globalAlpha=1;}
  }
  for(const z of g.dangerZones){c.globalAlpha=z.tell>0?.12:.8;r(c,z.x,z.y,z.w,z.h,z.color);c.globalAlpha=1;r(c,z.x-8,z.y+z.h-5,z.w+16,5,z.color);if(z.tell>0)txt(c,'!',z.x+z.w/2,z.y+z.h-15,22,z.color,'center');else{for(let yy=z.y;yy<z.y+z.h;yy+=24)poly(c,[[z.x+z.w*.2,yy],[z.x+z.w*.8,yy+7],[z.x+z.w*.35,yy+24]],'#fff2dc');}}
  for(const shot of [...g.bullets,...g.enemyBullets])projectile(c,shot,t);
  for(const a of g.afterimages){c.globalAlpha=a.life/.2*.26;robot(c,a.x,a.y,{face:a.face,dash:true,t,color:WEAPONS.find(w=>w.id===a.weapon).color});}c.globalAlpha=1;
  const p=g.player;if(p.hp>0&&(p.invincible<=0||Math.floor(g.clock*15)%2===0))robot(c,p.x,p.y,{face:p.face,t,run:Math.abs(p.vx)>25&&p.ground,air:!p.ground,dash:p.dashTime>0,shooting:p.shootAnim>0,charge:p.charge,color:p.weapon==='pulse'?'#3aafff':WEAPONS.find(w=>w.id===p.weapon).color});
  for(const p of g.particles){c.globalAlpha=clamp(p.life/p.max,0,1);r(c,p.x-p.size/2,p.y-p.size/2,p.size,p.size,p.color);}c.globalAlpha=1;for(const f of g.floats){c.globalAlpha=Math.min(1,f.life*2);txt(c,f.text,f.x,f.y,12,f.color,'center');}c.globalAlpha=1;for(const e of g.effects)effectArt(c,e);c.restore();
  if(g.bossIntro>0){const a=Math.min(1,g.bossIntro*2);c.globalAlpha=a;r(c,0,182,w,116,'#0a142aee');r(c,0,182,w,3,s.accent);r(c,0,295,w,3,s.accent);txt(c,'WARNING — GUARDIAN SIGNAL',w/2,212,16,s.accent,'center');txt(c,s.boss,w/2,248,24,'#f0f9ff','center');txt(c,s.bossTip,w/2,277,12,'#b6d0e0','center');c.globalAlpha=1;}
  if(g.intro>0&&g.mode==='playing'&&p.x<700){c.globalAlpha=Math.min(1,g.intro);txt(c,s.en,w/2,138,19,'#e8f7ff','center');txt(c,s.sub,w/2,164,12,'#a6c7d8','center');c.globalAlpha=1;}
 }
}
export function stagePreview(canvas,id){const c=canvas.getContext('2d'),s=STAGES[id];canvas.width=400;canvas.height=174;c.save();c.scale(400/640,174/350);background(c,s,640,600,0);platform(c,{x:0,y:306,w:640,h:100,kind:id===1?'belt':id===2?'ice':'solid'},s,0);platform(c,{x:72,y:232,w:142,h:22,kind:'solid',oneWay:true},s,0);bossArt(c,400,180,s,0,'idle',-1,false,1.5);robot(c,114,184,{t:1,shooting:true});c.restore();}
