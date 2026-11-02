// Original generated PCM instruments; no commercial samples or melodies.
export const SAMPLE_RATE=22050,ROOT_NOTE=60;
export const PATCHES={brass:{attack:.018,release:.09},guitar:{attack:.003,release:.07},strings:{attack:.09,release:.2},bell:{attack:.003,release:.22},bass:{attack:.004,release:.045},kick:{attack:.001,release:.04,drum:true},snare:{attack:.001,release:.04,drum:true},hat:{attack:.001,release:.02,drum:true},tom:{attack:.001,release:.06,drum:true}};
export const ARRANGEMENTS={menu:{lead:'bell',counter:'strings',bpm:110,description:'ベルと弦の静かな通信'},0:{lead:'brass',counter:'guitar',bpm:154,description:'ブラス × 疾走するロック'},1:{lead:'guitar',counter:'brass',bpm:140,description:'ギター × 重いドラム'},2:{lead:'bell',counter:'strings',bpm:126,description:'ベル × 弦の幻想的な旋律'},3:{lead:'strings',counter:'brass',bpm:160,description:'弦 × ブラスの最終決戦'},boss:{lead:'guitar',counter:'brass',bpm:172,description:'ギター × 緊迫するリズム'},victory:{lead:'brass',counter:'bell',bpm:132,description:'勝利のファンファーレ'}};
export function makeSample(name,rate=SAMPLE_RATE){
 if(!PATCHES[name])throw Error('Unknown instrument');const drum=PATCHES[name].drum,a=new Float32Array(Math.ceil(rate*(drum?.55:2.2))),f=261.625565;let seed=112358,low=0,phase=0;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/2147483648-1;};
 for(let i=0;i<a.length;i++){const t=i/rate,q=t*f*2*Math.PI;let v=0;
 if(name==='brass')for(let h=1;h<=12;h++)v+=Math.sin(q*h+.012*h*Math.sin(t*34))/h*Math.exp(-h*.13)*(1-Math.exp(-t*95));
 if(name==='guitar'){for(let h=1;h<=12;h++)v+=Math.sin(q*h)/(h*.9)*Math.exp(-t*(2+h*.7));v=Math.tanh(v*2.4)*.7;}
 if(name==='strings')for(let h=1;h<=8;h++)v+=(Math.sin(q*h*.998)+Math.sin(q*h*1.002))/(h*3)*(1-Math.exp(-t*20));
 if(name==='bell')v=Math.sin(q+2.4*Math.sin(q*2.76)*Math.exp(-t*6))*.5*Math.exp(-t*2.1)+Math.sin(q*2)*.14*Math.exp(-t*4);
 if(name==='bass')v=(Math.sin(q)*.72+Math.sin(q*2)*.23*Math.exp(-t*7)+Math.sin(q*3)*.12*Math.exp(-t*10))*Math.exp(-t*.7);
 if(drum){const n=noise();low+=.18*(n-low);if(name==='kick'){phase+=2*Math.PI*(47+140*Math.exp(-t*40))/rate;v=Math.sin(phase)*Math.exp(-t*11)+n*.06*Math.exp(-t*100);}if(name==='snare')v=(n-low)*.63*Math.exp(-t*18)+Math.sin(t*2*Math.PI*185)*.3*Math.exp(-t*25);if(name==='hat')v=(n-low)*.32*Math.exp(-t*75);if(name==='tom'){phase+=2*Math.PI*(90+75*Math.exp(-t*25))/rate;v=Math.sin(phase)*.8*Math.exp(-t*12);}}
 const fade=Math.min(1,i/32,(a.length-1-i)/128);a[i]=Math.round(Math.max(-.96,Math.min(.96,v*.65))*2048)/2048*Math.max(0,fade);
 }return a;
}
export function scoreStep(score,track,step){
 const cfg=ARRANGEMENTS[track]||ARRANGEMENTS.menu,eighth=30/cfg.bpm,i=step%score.lead.length,bar=Math.floor(step/8)%32,beat=step%8,root=score.roots[Math.floor(i/8)%score.roots.length],melody=score.lead[i],events=[],breakdown=track!=='victory'&&bar>=16&&bar<20,chorus=bar%16>=8;
 const add=(patch,note,duration,volume,pan=0,offset=0)=>events.push({patch,note,duration,volume,pan,offset});
 if(melody!==null)add(breakdown?'strings':cfg.lead,melody,eighth*(score.lead[(i+1)%score.lead.length]===null?1.8:.84),.28,track===2?-.12:.08);
 if(beat===0||beat===4)for(const[k,int]of[0,3,7].entries())add('strings',root+12+int,eighth*3.8,track==='menu'?.075:.052,[-.65,0,.65][k]);
 if((beat%2===1||chorus)&&!breakdown&&track!=='victory')add(cfg.counter,root+[24,19,27,19,24,22,27,19][beat],eighth*.65,chorus?.11:.065,beat%2?.48:-.48);
 add('bass',root-12+[0,0,7,0,12,0,7,10][beat],eighth*.88,.38,-.08);
 if(!breakdown||beat===0){if([0,4].includes(beat)||(track===1&&beat===3))add('kick',60,.32,.54);if([2,6].includes(beat))add('snare',60,.22,.36,.12);if(track!=='menu'&&track!=='victory')add('hat',60,.08,beat%2?.26:.17,-.4);}
 if(bar%4===3&&beat>=6&&!breakdown)add('tom',64-(beat-6)*5,.26,.26,beat===6?-.5:.5,eighth/2);return events;
}
