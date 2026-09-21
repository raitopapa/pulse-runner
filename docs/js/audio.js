// New score/patches, using the envelope and look-ahead technique from Bramble's Dash.
// Original 16-bar scores: pulse lead + countermelody + triangle bass + noise percussion.
const notes=s=>s.trim().split(/\s+/).map(n=>n==='-'?null:Number(n));
const phrase=(a,b)=>{a=notes(a);b=notes(b);return [...a,...a.map((n,i)=>n===null?null:i>23?n+2:n),...b,...a.map((n,i)=>n===null?null:i>23?n-2:n)];};
export const SCORES={
 menu:{title:'REBOOT / 星の通信',bpm:116,roots:[45,41,48,43,45,41,46,43,45,48,41,43,46,43,40,45],duty:.5,lead:phrase('69 - 76 73 71 - 69 - 65 - 72 69 67 - 65 - 72 76 - 79 76 74 72 - 67 71 74 - 76 74 71 -','81 - 79 76 74 - 73 - 77 76 74 72 69 - 72 - 74 - 76 79 81 79 76 74 73 - 71 - 69 - - -')},
 0:{title:'SKY CIRCUIT / 蒼い回路',bpm:158,roots:[45,45,41,43,45,48,46,40,41,43,45,48,46,43,40,45],duty:.25,lead:phrase('76 76 - 79 81 - 79 76 74 - 72 74 76 79 76 - 77 77 - 76 74 72 69 72 74 - 76 74 71 - 67 -','81 - 84 83 81 79 76 79 77 - 81 79 77 76 74 - 76 79 81 - 84 83 81 79 76 - 74 71 69 - 71 74')},
 1:{title:'IRON HEART / 炉心の鼓動',bpm:144,roots:[40,40,43,38,40,40,41,47,36,38,40,43,41,38,47,40],duty:.125,lead:phrase('64 - 64 67 - 66 64 - 71 70 67 - 64 - 62 - 64 - 67 71 - 74 71 67 65 64 62 - 59 62 64 -','76 74 71 - 74 71 67 - 72 - 71 67 66 64 - 62 64 67 71 74 76 - 74 71 65 - 64 62 59 - 62 -')},
 2:{title:'CRYSTAL MEMORY / 氷の記憶',bpm:134,roots:[47,43,45,42,47,50,43,42,43,45,47,50,43,40,42,47],duty:.5,lead:phrase('78 - 76 74 73 - 71 - 74 - 78 81 78 76 74 - 76 - 73 69 73 76 78 - 73 - 71 70 66 - - -','83 - 81 78 76 - 78 81 79 - 78 74 71 - 74 - 76 78 81 78 76 73 71 - 70 - 73 76 78 - 76 -')},
 3:{title:'LAST SIGNAL / 最後のシグナル',bpm:168,roots:[42,38,45,40,42,38,43,37,38,40,42,45,43,40,37,42],duty:.25,lead:phrase('78 73 78 81 - 80 78 76 74 - 73 69 74 73 71 - 81 76 81 83 - 81 80 76 76 75 73 - 71 69 68 -','85 - 83 81 80 78 76 73 81 - 80 78 76 74 73 - 78 81 85 83 81 80 78 76 73 - 71 68 66 - 68 73')},
 boss:{title:'GUARDIAN / 暴走守護機',bpm:180,roots:[40,39,40,43,38,37,38,47,40,43,41,38,40,39,47,40],duty:.125,lead:phrase('76 - 76 75 76 79 76 - 75 72 75 78 75 - 72 - 74 - 74 73 74 77 74 - 71 70 71 74 77 74 71 -','83 79 76 79 83 - 81 79 77 - 76 74 71 - 74 - 76 75 76 79 81 79 76 75 71 - 74 77 76 - - -')},
 victory:{title:'WEAPON GET / 新たな力',bpm:132,roots:[48,53,55,48],duty:.25,lead:notes('72 - 76 - 79 - 84 - 81 79 77 76 77 - 81 - 79 81 83 - 86 84 83 - 84 - - - - - - -')}
};
const tracks=SCORES;
const hz=n=>440*2**((n-69)/12);
export class Sound{
 constructor(muted=false){this.muted=muted;this.track='menu';this.paused=false;this.nodes=new Set();this.step=0;}
 unlock(){try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.48;this.master.connect(this.ctx.destination);this.music=this.ctx.createGain();this.music.gain.value=.26;this.music.connect(this.master);this.fx=this.ctx.createGain();this.fx.gain.value=.68;this.fx.connect(this.master);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*.18,this.ctx.sampleRate);const a=this.noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;this.next=this.ctx.currentTime+.07;this.timer=setInterval(()=>this.schedule(),35);}if(!this.paused)this.ctx.resume().catch(()=>{});}catch{}}
 tone(f,dur=.1,vol=.15,type='square',delay=0,end=f,music=false){if(!this.ctx||this.muted||this.paused)return;const t=this.ctx.currentTime+Math.max(0,delay),o=this.ctx.createOscillator(),g=this.ctx.createGain();if(music&&type==='square'&&this.ctx.createPeriodicWave){const duty=(tracks[this.track]||tracks.menu).duty;this.waves??=new Map();if(!this.waves.has(duty)){const real=new Float32Array(33),imag=new Float32Array(33);for(let k=1;k<33;k++){real[k]=Math.sin(2*Math.PI*k*duty)/(Math.PI*k);imag[k]=(1-Math.cos(2*Math.PI*k*duty))/(Math.PI*k);}this.waves.set(duty,this.ctx.createPeriodicWave(real,imag));}o.setPeriodicWave(this.waves.get(duty));}else o.type=type;o.frequency.setValueAtTime(Math.max(1,f),t);o.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(music?this.music:this.fx);o.start(t);o.stop(t+dur+.02);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};}
 hiss(vol=.2,dur=.1,delay=0,music=false){if(!this.ctx||this.muted||this.paused)return;const t=this.ctx.currentTime+Math.max(0,delay),s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();s.buffer=this.noise;f.type='highpass';f.frequency.value=music?5800:900;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(music?this.music:this.fx);s.start(t);s.stop(t+dur);this.nodes.add(s);s.onended=()=>{this.nodes.delete(s);s.disconnect();g.disconnect();f.disconnect();};}
 stopNodes(){for(const n of this.nodes)try{n.stop();}catch{}this.nodes.clear();}
 setTrack(id){if(this.track===id)return;this.track=id;this.step=0;if(this.ctx){this.stopNodes();this.next=this.ctx.currentTime+.09;}}
 setMuted(v){this.muted=v;if(this.master){this.master.gain.setTargetAtTime(v?0:.48,this.ctx.currentTime,.025);this.next=this.ctx.currentTime+.06;}}
 setPaused(v){this.paused=v;if(!this.ctx)return;if(v){this.stopNodes();this.ctx.suspend().catch(()=>{});}else{this.next=this.ctx.currentTime+.08;this.ctx.resume().catch(()=>{});}}
 schedule(){
  if(!this.ctx||this.muted||this.paused||this.ctx.state!=='running')return;
  const cfg=tracks[this.track]||tracks.menu,eighth=60/cfg.bpm/2;
  if(this.next<this.ctx.currentTime-.2)this.next=this.ctx.currentTime+.025;
  for(let n=0;n<8&&this.next<this.ctx.currentTime+.14;n++){
   const i=this.step%cfg.lead.length,bar=Math.floor(i/8),beat=i%8,root=cfg.roots[bar%cfg.roots.length],delay=Math.max(0,this.next-this.ctx.currentTime),melody=cfg.lead[i];
   if(melody!==null)this.tone(hz(melody),eighth*(cfg.lead[(i+1)%cfg.lead.length]===null?1.7:.78),.11,'square',delay,hz(melody),true);
   // The counter voice enters in the bridge; arpeggios leave room around the main hook.
   if(this.track!=='victory'&&(beat%2===1||bar>=8)){const arp=[12,19,24,19,15,19,22,19][beat],note=root+arp;this.tone(hz(note),eighth*.48,bar>=8?.045:.025,'square',delay,hz(note),true);}
   const bass=root-12+([0,0,7,0,12,0,7,10][beat]);this.tone(hz(bass),eighth*.83,.27,'triangle',delay,hz(bass),true);
   if(beat===0||beat===4||(this.track===1&&beat===3))this.tone(145,.12,.24,'sine',delay,38,true);
   if(beat===2||beat===6){this.hiss(.12,.07,delay,true);this.tone(180,.065,.05,'triangle',delay,80,true);}
   if(this.track!=='menu'&&this.track!=='victory')this.hiss(beat%2?.033:.021,.022,delay,true);
   if(bar%4===3&&beat>=6){this.hiss(.075,.04,delay+eighth/2,true);this.tone(90+beat*10,.08,.07,'triangle',delay+eighth/2,45,true);}
   this.next+=eighth;this.step++;
  }
 }
 effect(name){
  if(name==='arc'){this.tone(1400,.13,.12,'triangle',0,360);this.tone(450,.17,.1,'square',.06,1000);}
  else if(name==='flame'){this.hiss(.24,.17);this.tone(140,.23,.16,'sawtooth',0,65);}
  else if(name==='frost'){[1600,2100,2800].forEach((f,i)=>this.tone(f,.13,.08,'triangle',i*.025,f*.7));}
  else if(name==='deflect'){this.tone(1600,.06,.12,'square',0,700);}
  else if(name==='weak'){this.tone(260,.13,.18,'sawtooth',0,80);this.tone(1400,.09,.1,'square',.03,450);}
  else if(name==='device'){[523,784,1047,1568].forEach((f,i)=>this.tone(f,.16,.12,'triangle',i*.075));}
  else if(name==='warning'){for(let i=0;i<3;i++)this.tone(660,.19,.09,'square',i*.38,880);}
  else if(name==='shot')this.tone(880,.085,.12,'square',0,240);
  else if(name==='charge'){this.tone(190,.18,.22,'sawtooth',0,1100);this.hiss(.14,.1);}
  else if(name==='ready'){this.tone(1200,.06,.1,'sine');this.tone(1800,.09,.09,'sine',.07);}
  else if(name==='jump')this.tone(270,.13,.13,'square',0,600);
  else if(name==='dash'){this.hiss(.18,.14);this.tone(200,.12,.13,'sawtooth',0,440);}
  else if(name==='pickup'||name==='checkpoint'){this.tone(988,.07,.1);this.tone(1480,.13,.1,'triangle',.06);}
  else if(name==='hit')this.tone(145,.065,.18,'square',0,60);
  else if(name==='hurt'){this.hiss(.22,.13);this.tone(270,.22,.15,'sawtooth',0,80);}
  else if(name==='explode'){this.hiss(.26,.16);this.tone(90,.15,.2,'triangle',0,30);}
  else if(name==='enemyShot')this.tone(180,.14,.15,'sawtooth',0,540);
  else if(name==='die')[440,370,280,165].forEach((f,i)=>this.tone(f,.13,.13,'triangle',i*.1));
  else if(name==='win')[523,659,784,1047,988,1175,1319].forEach((f,i)=>this.tone(f,.22,.17,'triangle',i*.115));
  else this.tone(660,.06,.08,'triangle');
 }
}
