import {createLevel,WEAPONS,STAGES,DIFFICULTIES} from './levels.js';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const approach=(a,b,v)=>a<b?Math.min(a+v,b):Math.max(a-v,b);
const EMPTY={left:false,right:false,jump:false,fire:false,dash:false,weapon:false};
export class Game{
 constructor(save,emit=()=>{}){this.save=save;this.emit=emit;this.viewW=960;this.load(0);this.mode='title';}
 load(id,resume=false){
  if(id===3&&![0,1,2].every(i=>this.save.cleared.includes(i)))return false;
  this.level=createLevel(id);this.difficulty=DIFFICULTIES[this.save.difficulty];const c=resume&&this.save.checkpoint?.stage===id?this.save.checkpoint:null;
  this.checkpoint=c?.index||0;this.collected=new Set(c?.collected||[]);this.score=c?.score||0;this.clock=0;this.elapsed=0;this.deaths=0;this.intro=2.5;this.announcedPhase=false;this.bossIntro=0;this.newWeapon=false;
  this.spawn();this.mode='playing';this.emit('music',id);return true;
 }
 spawn(){
  const l=this.level,d=this.difficulty,cp=this.checkpoint?l.checkpoints[this.checkpoint-1]:{x:112,y:420};
  this.player={x:cp.x,y:cp.y-44,w:28,h:44,vx:0,vy:0,hp:d.hp,maxHp:d.hp,energy:28,face:1,ground:false,wall:0,coyote:0,buffer:0,invincible:1.2,dashTime:0,dashCooldown:0,airDash:true,airJump:true,jumpLock:0,charge:0,cooldown:0,shootAnim:0,weapon:'pulse'};
  const player=this.player;player.maxHp=player.hp=d.hp+(this.save.upgrades?.length||0)*2;player.ammo={arc:28,flame:28,frost:28};
  Object.defineProperty(player,'energy',{enumerable:true,configurable:true,get:()=>player.weapon==='pulse'?28:player.ammo[player.weapon],set:v=>{if(player.weapon!=='pulse')player.ammo[player.weapon]=clamp(v,0,28);}});
  l.hazards.forEach(h=>{h.disabled=false;h.active=false;h.warning=false;});
  this.devices=l.devices.map(o=>({...o,active:false,flash:0}));this.effects=[];this.dangerZones=[];this.afterimages=[];
  this.enemies=l.enemies.map((e,i)=>{const h=e.type==='shield'?42:e.type==='drone'||e.type==='sentry'?24:30;return {...e,y:['drone','sentry'].includes(e.type)?e.y:e.y+22-h,startX:e.x,startY:e.y,w:e.type==='shield'?34:30,h,hp:({shield:6,helmet:3,turret:5,hopper:4,sentry:4,drone:3,walker:3})[e.type],vx:-48,vy:0,face:-1,time:i*.47,cooldown:1.3+i*.31,tell:0,hit:0,slow:0,frozen:0,open:false,dead:false,ground:false};});
  this.platforms=l.platforms.map(p=>({...p,startX:p.x,dx:0,oneWay:true,kind:'moving'}));
  this.items=l.items.filter(i=>!this.collected.has(i.id)&&!(i.type==='upgrade'&&this.save.upgrades?.includes(l.id))).map(i=>({...i,w:18,h:18,dead:false}));
  this.bullets=[];this.enemyBullets=[];this.particles=[];this.floats=[];this.shake=0;this.hitstop=0;this.stateTime=0;this.previous={...EMPTY};this.previousJump=false;
  this.boss={x:l.bossX,y:340,w:68,h:80,vx:0,vy:0,hp:l.hp,maxHp:l.hp,active:false,dead:false,state:'sleep',timer:1,pattern:0,face:-1,hit:0,phase:1,action:'shoot'};
  this.camera=clamp(this.player.x-this.viewW*.3,0,l.width-this.viewW);
 }
 unlockedWeapons(){return WEAPONS.filter(w=>w.id==='pulse'||this.save.cleared.some(i=>STAGES[i].reward===w.id));}
 equipWeapon(id){if(!this.unlockedWeapons().some(w=>w.id===id))return false;this.player.weapon=id;this.player.charge=0;this.emit('weapon',id);return true;}
 cycleWeapon(){const w=this.unlockedWeapons(),p=this.player;this.equipWeapon(w[(w.findIndex(w=>w.id===p.weapon)+1)%w.length].id);}
 persistCheckpoint(){this.save.checkpoint={stage:this.level.id,index:this.checkpoint,score:this.score,collected:[...this.collected]};this.emit('save');}
 retry(){this.deaths++;this.difficulty=DIFFICULTIES[this.save.difficulty];this.announcedPhase=false;this.spawn();this.mode='playing';this.emit('music',this.level.id);}
 pause(){if(this.mode==='playing'){this.mode='paused';this.player.charge=0;this.emit('pause');}}
 resume(){if(this.mode==='paused'){this.mode='playing';this.previous={...EMPTY};this.emit('resume');}}
 burst(x,y,color,count=12,force=140){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=force*(.3+Math.random());this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.25+Math.random()*.4,max:.65,color,size:2+Math.random()*4});}if(this.particles.length>180)this.particles.splice(0,this.particles.length-180);}
 float(x,y,text,color='#effaff'){this.floats.push({x,y,text,color,life:1});}
 solidsFor(p){const terrain=[...this.level.solids,...this.devices.filter(d=>d.kind==='icewall'&&!d.active),...this.devices.filter(d=>d.active&&d.bridge).map(d=>({...d.bridge,oneWay:true}))];const s=terrain.filter(s=>s.x<p.x+p.w+30&&s.x+s.w>p.x-30);if(this.boss.active&&!this.boss.dead)s.push({x:this.level.gate,y:0,w:24,h:600});return s;}
 move(p,dt,platforms=false){
  p.wall=0;p.x+=p.vx*dt;
  for(const s of this.solidsFor(p)){if(s.oneWay||!overlap(p,s))continue;if(p.vx>0){p.x=s.x-p.w;p.wall=1;}else if(p.vx<0){p.x=s.x+s.w;p.wall=-1;}p.vx=0;}
  p.x=clamp(p.x,0,this.level.width-p.w);const feet=p.y+p.h;p.y+=p.vy*dt;p.ground=false;p.floorKind='';
  for(const s of [...this.solidsFor(p),...(platforms?[...this.platforms,...this.enemies.filter(e=>e.frozen>0&&!e.dead).map(e=>({x:e.x-5,y:e.y,w:e.w+10,h:e.h,kind:'ice',oneWay:true}))]:[])]){
   if(!overlap(p,s))continue;
   if(p.vy>=0&&feet<=s.y+6){p.y=s.y-p.h;p.vy=0;p.ground=true;p.floorKind=s.kind;if(s.kind==='moving')p.x+=s.dx;}
   else if(!s.oneWay&&p.vy<0&&p.y+p.h>s.y+s.h){p.y=s.y+s.h;p.vy=0;}
  }
 }
 effect(x,y,color,kind='ring',size=30,life=.35){this.effects.push({x,y,color,kind,size,life,max:life});if(this.effects.length>64)this.effects.shift();}
 activateDevice(d,weapon){
  if(d.active||d.weapon!==weapon)return false;d.active=true;d.flash=1;this.effect(d.x+d.w/2,d.y+d.h/2,WEAPONS.find(w=>w.id===weapon).color,'ring',90,.7);this.burst(d.x+d.w/2,d.y+d.h/2,'#d4f9ff',28,190);this.emit('sfx','device');
  if(d.kind==='relay')this.level.hazards.forEach(h=>{if(h.x>d.x)h.disabled=true;});
  this.emit('route',d.kind==='relay'?'電源復旧！ 橋が出現・先の罠が停止':d.kind==='icewall'?'氷壁を融解！ 隠しルートが開通':'タービン凍結！ 強風停止・氷の橋が出現');return true;
 }
 fire(charge=0){
  const p=this.player;let weapon=p.weapon,cfg=WEAPONS.find(w=>w.id===weapon),full=charge>.92,charged=charge>.4,cost=cfg.cost*(charged?1.8:1);
  if(weapon!=='pulse'&&p.energy<cost){weapon='pulse';cfg=WEAPONS[0];}else if(weapon!=='pulse')p.energy-=cost;
  // Keep at most three uncharged buster pellets on screen, without suppressing charge releases.
  if(weapon==='pulse'&&!charged&&this.bullets.filter(b=>b.weapon==='pulse'&&b.damage===1).length>=3){p.cooldown=.08;return;}
  const damage=full?6:charged?3:weapon==='pulse'?1:2,color=cfg.color,x=p.x+(p.face>0?p.w+4:-18),y=p.y+16;
  const base={x,y,w:charged?32:16,h:charged?22:10,vx:p.face*800,vy:0,damage,weapon,color,life:1.2,age:0,face:p.face,hitIds:new Set(),pierce:full,trail:[],charged};
  if(weapon==='arc'){
   for(const offset of(full?[-.3,0,.3]:[0]))this.bullets.push({...base,y:y-4,w:26,h:26,vx:p.face*560,vy:offset*200,life:1.6,pierce:true,offset,hitIds:new Set(),trail:[]});
  }else if(weapon==='flame')this.bullets.push({...base,y:y-7,w:charged?38:26,h:charged?38:26,vx:p.face*390,vy:110,life:2.8,pierce:true,ground:false});
  else if(weapon==='frost')this.bullets.push({...base,w:charged?40:28,h:charged?22:12,vx:p.face*660,life:1.5,pierce:full});
  else this.bullets.push(base);
  p.shootAnim=.16;p.cooldown=cfg.cooldown;this.emit('sfx',weapon==='pulse'?(charged?'charge':'shot'):weapon);this.effect(x,y+5,color,'muzzle',charged?28:14,.16);this.burst(x,y,color,charged?10:3,90);
 }
 hurt(damage,x){
  const p=this.player;if(this.mode!=='playing'||p.invincible>0||p.dashTime>0)return;
  p.hp=Math.max(0,p.hp-Math.max(1,Math.round(damage*this.difficulty.damage)));p.invincible=1.1;p.vx=(p.x<x?-1:1)*175;p.vy=-190;p.jumpLock=.18;p.charge=0;
  this.shake=5;this.hitstop=.045;this.effect(p.x+14,p.y+20,'#ffb59a','impact',38,.25);this.burst(p.x+14,p.y+20,'#ffbe9e');this.emit('sfx','hurt');if(p.hp<=0)this.die();
 }
 die(){if(this.mode!=='playing')return;this.player.hp=0;this.mode='dying';this.stateTime=.7;this.effect(this.player.x+14,this.player.y+20,'#75e7ff','ring',110,.7);this.burst(this.player.x+14,this.player.y+20,'#77e8ff',35,230);this.emit('sfx','die');this.persistCheckpoint();}
 tick(dt,input=EMPTY){
  if(!['playing','dying','clearing'].includes(this.mode))return;this.clock+=dt;
  for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);
  for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);for(const a of this.afterimages)a.life-=dt;this.afterimages=this.afterimages.filter(a=>a.life>0);
  for(const f of this.floats){f.y-=28*dt;f.life-=dt;}this.floats=this.floats.filter(f=>f.life>0);this.shake=Math.max(0,this.shake-dt*22);
  if(this.mode==='dying'||this.mode==='clearing'){this.stateTime-=dt;if(this.stateTime<=0){this.mode=this.mode==='dying'?'dead':'clear';this.emit(this.mode);}return;}
  if(this.hitstop>0){this.hitstop-=dt;return;}
  const edge=Object.fromEntries(Object.keys(EMPTY).map(k=>[k,!!input[k]&&!this.previous[k]])),release=!input.fire&&this.previous.fire;this.previous={...input};this.elapsed+=dt;this.intro=Math.max(0,this.intro-dt);this.bossIntro=Math.max(0,this.bossIntro-dt);
  for(const s of this.platforms){const x=s.x;s.x=s.startX+Math.sin(this.clock*s.speed)*s.range;s.dx=s.x-x;}
  const p=this.player,d=this.difficulty,dir=Number(!!input.right)-Number(!!input.left);
  for(const k of['invincible','dashTime','dashCooldown','jumpLock','cooldown','shootAnim'])p[k]=Math.max(0,p[k]-dt);for(const key of Object.keys(p.ammo))p.ammo[key]=Math.min(28,p.ammo[key]+dt*.65);
  if(p.ground){p.coyote=.12;p.airDash=true;p.airJump=true;}else p.coyote=Math.max(0,p.coyote-dt);
  p.buffer=edge.jump?.14:Math.max(0,p.buffer-dt);if(edge.weapon)this.cycleWeapon();
  if(p.jumpLock<=0&&p.dashTime<=0){const a=p.floorKind==='ice'&&p.ground?1050:4200;p.vx=approach(p.vx,dir*260,dt*(dir?a:p.floorKind==='ice'?550:4600));if(dir)p.face=dir;}
  if(edge.dash&&p.dashCooldown<=0&&(p.ground||p.airDash)){p.dashTime=.18;p.dashCooldown=.48;p.vx=p.face*640;p.vy=0;if(!p.ground)p.airDash=false;this.emit('sfx','dash');this.burst(p.x+14,p.y+36,'#82e9ff',8,80);}
  if(p.buffer>0){
   if(p.coyote>0){p.vy=-d.jump;this.effect(p.x+14,p.y+44,'#bfefff','dust',22,.22);p.ground=false;p.coyote=0;p.buffer=0;this.emit('sfx','jump');}
   else if(p.wall&&!p.ground){p.vy=-d.jump*.94;p.vx=-p.wall*340;p.face=-p.wall;p.jumpLock=.18;p.buffer=0;p.airDash=true;this.emit('sfx','jump');}
   else if(d.double&&p.airJump){p.vy=-d.jump*.88;p.airJump=false;p.buffer=0;this.burst(p.x+14,p.y+44,'#a8ebff',10,70);this.emit('sfx','jump');}
  }
  if(!input.jump&&this.previousJump&&p.vy<-220)p.vy*=.5;this.previousJump=!!input.jump;
  if(p.dashTime<=0)p.vy=Math.min(850,p.vy+d.gravity*dt);else{p.vy=0;if(Math.floor(this.clock*60)%2===0)this.particles.push({x:p.x+14,y:p.y+22,vx:-p.face*80,vy:0,life:.18,max:.18,size:18,color:'#6ae0ff'});}
  if(p.wall&&p.vy>100&&dir===p.wall)p.vy=100;if(p.ground&&p.floorKind==='belt')p.x+=66*dt;
  for(const device of this.devices){device.flash=Math.max(0,device.flash-dt);if(device.kind==='wind'&&!device.active&&Math.abs(p.x-device.x)<170&&p.y>230)p.vx-=95*dt*8;}
  if(p.dashTime>0&&Math.floor(this.clock*60)%3===0)this.afterimages.push({x:p.x,y:p.y,face:p.face,weapon:p.weapon,life:.2});
  this.move(p,dt,true);if(p.y>590){this.die();return;}
  if(edge.fire){p.charge=0;if(p.cooldown<=0)this.fire();}if(input.fire){p.charge=Math.min(1.2,p.charge+dt);if(p.charge<.48&&p.cooldown<=0)this.fire();if(p.charge>=1&&p.charge-dt<1)this.emit('sfx','ready');}
  if(release){if(p.charge>=.4)this.fire(p.charge);p.charge=0;}if(this.save.autoFire&&!input.fire&&p.cooldown<=0)this.fire();
  this.level.checkpoints.forEach((cp,i)=>{if(i+1>this.checkpoint&&p.x+p.w>cp.x&&p.x<cp.x+42&&p.y+p.h>cp.y-90){this.checkpoint=i+1;p.hp=p.maxHp;for(const k of Object.keys(p.ammo))p.ammo[k]=28;this.persistCheckpoint();this.float(cp.x,cp.y-90,'CHECKPOINT','#9effc5');this.emit('checkpoint');this.burst(cp.x+8,cp.y-48,'#9effc5',25,90);}});
  for(const i of this.items){if(i.dead||(i.requires&&!this.devices.some(d=>d.id===i.requires&&d.active))||!overlap(p,i))continue;i.dead=true;this.collected.add(i.id);if(i.type==='upgrade'){this.save.upgrades??=[];if(!this.save.upgrades.includes(this.level.id)){this.save.upgrades.push(this.level.id);p.maxHp+=2;p.hp=p.maxHp;this.emit('save');this.emit('upgrade');this.effect(i.x,i.y,'#a9ffc7','ring',100,.7);}}else if(i.type==='health'){p.hp=Math.min(p.maxHp,p.hp+6);this.float(i.x,i.y,'+ HP','#a5ffc9');}else if(i.type==='core'){this.score+=300;this.float(i.x,i.y,'DATA CORE','#ffda8e');this.emit('core');}else{const key=p.weapon!=='pulse'?p.weapon:Object.keys(p.ammo).sort((a,b)=>p.ammo[a]-p.ammo[b])[0];p.ammo[key]=Math.min(28,p.ammo[key]+6);this.score+=30;}this.emit('sfx','pickup');this.burst(i.x+9,i.y+9,'#fae5a8',7,65);}
  for(const h of this.level.hazards){const f=(this.clock+h.offset)%h.period;h.warning=!h.disabled&&f>h.period-1.8&&f<=h.period-1.1;h.active=!h.disabled&&f>h.period-1.1;if(h.active&&overlap(p,h))this.hurt(3,h.x+h.w/2);}
  this.updateEnemies(dt);
  if(!this.boss.active&&p.x>this.level.gate+36){this.boss.active=true;this.boss.state='wake';this.boss.timer=1.8;this.bossIntro=1.8;p.hp=p.maxHp;for(const k of Object.keys(p.ammo))p.ammo[k]=28;this.emit('sfx','warning');this.enemyBullets=[];this.enemies.forEach(e=>e.dead=true);this.emit('boss',this.level.boss);this.emit('music','boss');}
  this.updateBoss(dt);this.updateDangerZones(dt);this.updateBullets(dt);
  const min=this.boss.active&&!this.boss.dead?Math.min(this.level.gate-60,this.level.width-this.viewW):0;
  const target=clamp(p.x-this.viewW*.38+p.face*44,min,this.level.width-this.viewW);this.camera+=(target-this.camera)*(1-Math.exp(-dt*7));
 }
 updateEnemies(dt){
  const p=this.player,speed=this.difficulty.speed;
  for(const e of this.enemies){
   if(e.dead||Math.abs(e.x-p.x)>1000)continue;e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);e.frozen=Math.max(0,e.frozen-dt);
   if(e.frozen>0){e.vx=0;e.vy=0;continue;}e.time+=dt;e.face=p.x<e.x?-1:1;const es=speed*(e.slow>0?.42:1);
   if(e.type==='drone'){e.x=e.startX+Math.sin(e.time*.8)*76;e.y=e.startY+Math.sin(e.time*2)*29;}
   else if(e.type==='walker'||e.type==='shield'){
    e.vx=(e.type==='shield'?e.face:(e.vx>=0?1:-1))*(e.type==='shield'?36:65)*es;
    const ahead={x:e.x+(e.vx>0?e.w+8:-8),y:e.y+e.h+4,w:4,h:10};if(e.ground&&!this.level.solids.some(s=>overlap(ahead,s)))e.vx=e.type==='shield'?0:-e.vx;
    e.vy=Math.min(700,e.vy+1700*dt);const vx=e.vx;this.move(e,dt);if(e.wall)e.vx=-vx;
   }else if(e.type==='hopper'){if(e.ground&&e.cooldown<=0){e.vy=-490;e.vx=e.face*145*es;e.cooldown=1.7/es;this.effect(e.x+15,e.y+30,'#eaa57c','dust',18,.2);}e.vy=Math.min(700,e.vy+1700*dt);this.move(e,dt);e.cooldown-=dt;if(e.ground)e.vx=0;}
   if(e.type==='helmet'){
    e.open=e.time%3>1.65;e.tell=e.time%3>1.25&&!e.open?.3:0;e.cooldown-=dt*es;
    if(e.open&&e.cooldown<=0&&Math.abs(e.x-p.x)<560){for(const a of[-.2,0,.2])this.enemyShot(e.x+15,e.y+12,p.x+14,p.y+22,210*speed,'#ffe59a',a);e.cooldown=3;}
   }
   if(e.type==='sentry'){
    e.cooldown-=dt*es;e.tell=e.cooldown<=.65&&e.cooldown>0?e.cooldown:0;
    if(e.cooldown<=0&&Math.abs(e.x-p.x)<740){this.dangerZones.push({x:e.x+4,y:e.y+24,w:22,h:420-e.y-24,tell:.48,life:.65,color:'#ffb4ed',kind:'beam'});e.cooldown=3.2;}
   }
   if(e.type==='turret'||e.type==='drone'){
    e.cooldown-=dt*es;e.tell=e.cooldown<=.48&&e.cooldown>0?e.cooldown:0;
    if(e.cooldown<=0){if(Math.abs(e.x-p.x)<680)this.enemyShot(e.x+15,e.y+12,p.x+14,p.y+22,(e.type==='turret'?240:205)*speed,'#ffb77a');e.cooldown=e.type==='turret'?2.25:2.9;e.tell=0;}
   }
   if(e.y>600)e.dead=true;if(overlap(p,e))this.hurt(3,e.x+15);
  }
 }
 defeatEnemy(e,index){e.dead=true;this.score+=100;this.burst(e.x+e.w/2,e.y+e.h/2,'#ffc086',18,180);this.effect(e.x+e.w/2,e.y+e.h/2,e.frozen>0?'#b4eaff':'#ffc086','impact',42,.32);this.emit('sfx','explode');this.hitstop=.025;if(index%3===0)this.items.push({x:e.x+5,y:e.y+4,w:18,h:18,type:index%2?'energy':'health',id:'drop:'+index,dead:false});}
 enemyShot(x,y,tx,ty,speed,color='#ff9c94',angle=0,kind='orb'){const a=Math.atan2(ty-y,tx-x)+angle;this.enemyBullets.push({x,y,w:kind==='wave'?28:12,h:kind==='wave'?28:12,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:5,color,kind,age:0});return this.enemyBullets.at(-1);}
 updateDangerZones(dt){
  for(const z of this.dangerZones){if(z.tell>0){z.tell-=dt;if(z.tell<=0){this.emit('sfx','enemyShot');this.effect(z.x+z.w/2,z.y+z.h,z.color,'impact',32,.25);}}else{z.life-=dt;if(overlap(this.player,z))this.hurt(4,z.x+z.w/2);}}
  this.dangerZones=this.dangerZones.filter(z=>z.life>0);
 }
 updateBoss(dt){
  const b=this.boss,p=this.player,l=this.level;if(!b.active||b.dead)return;b.hit=Math.max(0,b.hit-dt);b.timer-=dt;b.phase=b.hp<=b.maxHp*.5?2:1;
  if(!['rush','dive','leap'].includes(b.state))b.face=p.x<b.x?-1:1;
  if(b.phase===2&&!this.announcedPhase){this.announcedPhase=true;this.emit('rage');this.effect(b.x+34,b.y+40,l.accent,'ring',100,.6);}
  const fast=this.difficulty.speed*(b.phase===2?1.18:1),idle=(seconds=1.1)=>{b.state='idle';b.timer=seconds/fast;b.vx=0;b.vy=0;b.y=340;};
  if(b.state==='stagger'){b.y=Math.min(340,b.y+200*dt);if(b.timer<=0)idle(.8);return;}
  if((b.state==='idle'||b.state==='wake')&&b.timer<=0){
   b.action=l.patterns[b.pattern++%l.patterns.length];b.state='tell';b.timer=(b.action==='dive'||b.action==='storm'?.95:.75)/fast;b.vx=0;b.targetX=clamp(p.x,l.gate+60,l.width-110);b.attackFace=p.x<b.x?-1:1;
   if(b.action==='dive')b.y=180;
  }else if(b.state==='tell'&&b.timer<=0){
   const shot=(angle=0,kind='orb',speed=245)=>this.enemyShot(b.x+34,b.y+34,p.x+14,p.y+20,speed*fast,l.accent,angle,kind);
   if(b.action==='feather'){for(const a of(b.phase===2?[-.5,-.25,0,.25,.5]:[-.3,0,.3]))shot(a,'feather',250);idle();}
   else if(b.action==='dive'){b.state='dive';b.vx=(b.targetX-b.x)*2.3;b.vy=370;b.timer=.65;}
   else if(b.action==='storm'||b.action==='icicle'){
    const xs=b.action==='storm'?[b.targetX-150,b.targetX+120,...(b.phase===2?[b.targetX+280]:[])]:[b.targetX-130,b.targetX,b.targetX+130];
    for(const x of xs)this.dangerZones.push({x:clamp(x,l.gate+35,l.width-45),y:105,w:b.action==='storm'?30:24,h:315,tell:.95/fast,life:.38,color:l.accent,kind:b.action==='storm'?'lightning':'icicle'});idle(1.6);
   }else if(b.action==='skate'){b.state='rush';b.face=b.attackFace;b.vx=b.face*390*fast;b.timer=.95/fast;b.trailClock=0;}
   else if(b.action==='quake'){b.state='leap';b.vy=-640;b.vx=clamp((b.targetX-b.x)*1.35,-270,270);b.timer=2;}
   else if(b.action==='furnace'){
    for(const v of[-.25,0,.25]){const q=shot(v,'fireball',240);q.vx=b.attackFace*(200+v*180);q.vy=-390-Math.abs(v)*150;q.gravity=680;q.life=2.2;}idle(1.6);
   }else if(b.action==='flamewall'){
    for(let i=0;i<(b.phase===2?5:3);i++){const x=b.x+b.attackFace*(110+i*100);if(x>l.gate+28&&x<l.width-35)this.dangerZones.push({x,y:328,w:38,h:92,tell:.65+i*.22,life:.42,color:l.accent,kind:'flame'});}idle(1.8);
   }else if(b.action==='scythe'){
    for(const off of(b.phase===2?[-.2,.2]:[0])){const q=shot(off,'scythe',310);q.ownerX=b.x+34;q.ownerY=b.y+30;q.returning=false;q.life=2.4;}idle(1.7);
   }
   this.emit('sfx','enemyShot');
  }
  if(b.state==='dive'){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.timer<=0||b.y>=340){b.y=340;this.effect(b.x+34,420,l.accent,'impact',70,.4);idle(1.3);}}
  if(b.state==='rush'){b.x+=b.vx*dt;b.trailClock+=dt;if(b.trailClock>.22){b.trailClock=0;this.effect(b.x+34,418,l.accent,'dust',35,.4);}if(b.timer<=0||b.x<=l.gate+42||b.x>=l.width-92)idle();}
  if(b.state==='leap'){b.vy+=1540*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y+b.h>=420&&b.vy>0){idle(1.3);this.shake=7;for(const dir of[-1,1])this.enemyShot(b.x+30,392,b.x+30+dir*100,392,255*fast,l.accent,0,'wave');this.effect(b.x+34,416,l.accent,'ring',100,.45);this.emit('sfx','explode');}}
  b.x=clamp(b.x,l.gate+38,l.width-90);if(b.state!=='wake'&&overlap(p,b))this.hurt(4,b.x+34);
 }
 updateBullets(dt){
  for(const b of this.bullets){
   const x=b.x,oldY=b.y;b.age=(b.age||0)+dt;b.life-=dt;
   if(b.weapon==='arc'){
    if(b.age>.42){const dx=this.player.x+14-b.x,dy=this.player.y+14-b.y,len=Math.max(1,Math.hypot(dx,dy));b.vx=dx/len*610;b.vy=dy/len*610;if(len<24){b.life=0;this.effect(b.x,b.y,b.color,'ring',20,.15);continue;}}
   }else if(b.weapon==='flame'){b.vy=Math.min(640,b.vy+1200*dt);}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.weapon==='flame')for(const solid of [...this.level.solids,...this.platforms,...this.devices.filter(d=>d.active&&d.bridge).map(d=>d.bridge)])if(b.vy>=0&&b.x+b.w>solid.x&&b.x<solid.x+solid.w&&oldY+b.h<=solid.y+8&&b.y+b.h>=solid.y){b.y=solid.y-b.h;b.vy=0;b.ground=true;break;}
   if(b.trail){b.trail.push({x:b.x+b.w/2,y:b.y+b.h/2});if(b.trail.length>7)b.trail.shift();}
   const swept={x:Math.min(x,b.x),y:Math.min(oldY,b.y),w:b.w+Math.abs(b.x-x),h:b.h+Math.abs(b.y-oldY)};
   for(const device of this.devices)if(overlap(swept,device)){this.activateDevice(device,b.weapon);if(device.kind==='icewall'&&!device.active)b.life=0;}
   if(b.weapon!=='arc'&&this.level.solids.some(s=>!s.oneWay&&overlap({x:b.x,y:b.y,w:b.w,h:b.h-1},s))){this.effect(b.x,b.y,b.color,'impact',18,.18);b.life=0;}
   if(b.life<=0)continue;
   for(let i=0;i<this.enemies.length;i++){
    const e=this.enemies[i];if(e.dead||b.hitIds.has(i)||!overlap(swept,e))continue;
    const armor=(e.type==='helmet'&&!e.open)||(e.type==='shield'&&Math.sign(b.vx)===-e.face&&b.damage<6);
    if(armor&&e.frozen<=0&&!['flame','frost'].includes(b.weapon)){b.deflectIds??=new Set();if(!b.deflectIds.has(i)){this.effect(b.x,b.y,'#fff0ba','deflect',26,.2);this.emit('sfx','deflect');b.deflectIds.add(i);}if(b.weapon!=='arc'){b.life=0;b.hitIds.add(i);}continue;}
    b.hitIds.add(i);e.hp-=b.damage;e.hit=.1;
    if(b.weapon==='frost'){e.slow=2;e.frozen=3.8;e.vx=0;e.vy=0;this.effect(e.x+15,e.y+15,'#c3e9ff','freeze',35,.4);}
    else if(e.frozen>0&&b.damage>=3)e.hp=0;
    this.effect(b.x,b.y,b.color,'impact',b.damage>2?36:20,.22);if(!b.pierce)b.life=0;
    if(e.hp<=0)this.defeatEnemy(e,i);else this.emit('sfx','hit');if(b.life<=0)break;
   }
   const boss=this.boss;
   if(b.life>0&&boss.active&&!boss.dead&&boss.state!=='wake'&&boss.hit<=0&&!b.hitIds.has('boss')&&overlap(swept,boss)){
    b.hitIds.add('boss');const weak=b.weapon===this.level.weak||(this.level.id===3&&b.weapon!=='pulse'),damage=b.damage*(weak?2:1);boss.hp=Math.max(0,boss.hp-damage);boss.hit=.13;b.life=0;
    if(weak){boss.state='stagger';boss.timer=.38;boss.vx=0;boss.vy=0;this.emit('sfx','weak');}
    this.float(boss.x+20,boss.y,weak?`${damage} WEAK`:String(damage),b.color);this.effect(b.x,b.y,b.color,'impact',weak?64:34,.28);this.burst(b.x,b.y,b.color,12,170);this.hitstop=.045;this.shake=weak?5:2;this.emit('sfx','hit');if(boss.hp<=0)this.win();
   }
  }
  for(const b of this.enemyBullets){
   b.age=(b.age||0)+dt;if(b.gravity)b.vy+=b.gravity*dt;
   if(b.kind==='scythe'&&b.age>.85){const dx=this.boss.x+34-b.x,dy=this.boss.y+30-b.y,len=Math.max(1,Math.hypot(dx,dy));b.vx=dx/len*320;b.vy=dy/len*320;if(len<22)b.life=0;}
   b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
   if(!['wave','scythe','feather'].includes(b.kind)&&this.level.solids.some(s=>!s.oneWay&&overlap(b,s)))b.life=0;
   if(b.life>0&&overlap(b,this.player)){this.hurt(b.kind==='wave'?4:3,b.x);b.life=0;}
  }
  this.bullets=this.bullets.filter(b=>b.life>0&&b.y<620);this.enemyBullets=this.enemyBullets.filter(b=>b.life>0);
 }
 win(){const id=this.level.id;this.boss.dead=true;this.dangerZones=[];this.newWeapon=!this.save.cleared.includes(id);this.effect(this.boss.x+34,this.boss.y+40,this.level.accent,'ring',180,1);this.mode='clearing';this.stateTime=1.25;this.enemyBullets=[];this.burst(this.boss.x+34,this.boss.y+40,this.level.accent,60,260);this.shake=9;this.score+=1500;
  const cores=this.level.items.filter(i=>i.type==='core'&&this.collected.has(i.id)).length;if(!this.save.cleared.includes(id))this.save.cleared.push(id);this.save.cores[id]=Math.max(this.save.cores[id]||0,cores);this.save.best[id]=Math.max(this.save.best[id]||0,this.score);this.save.checkpoint=null;this.emit('save');this.emit('sfx','win');this.emit('music','victory');}
}
