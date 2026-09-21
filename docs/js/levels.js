export const STEP=1/60, HEIGHT=540, SAVE_KEY='pulseRunner.v1';
export const WEAPONS=[
 {id:'pulse',name:'パルスバスター',short:'P',color:'#75e7ff',cost:0,cooldown:.18,note:'直進する通常弾。長押しで装甲を貫くチャージ弾。',field:'弾数無制限。すべてのボスを攻略できる。',next:null},
 {id:'arc',name:'アークブーメラン',short:'A',color:'#ffe39b',cost:3,cooldown:.4,note:'往復する電撃刃。帰りの刃で背面も狙える。',field:'発電装置を起動 → 橋を架け、炉の罠を停止。',next:1},
 {id:'flame',name:'フレアホイール',short:'F',color:'#ff9b7e',cost:3.5,cooldown:.45,note:'地面を走り、装甲を貫く火炎車輪。',field:'氷壁を溶かす → 氷の保管庫の隠し通路を開く。',next:2},
 {id:'frost',name:'フロストランサー',short:'I',color:'#b4c8ff',cost:3,cooldown:.32,note:'敵を凍らせる氷槍。凍った敵は足場になる。',field:'強風装置を凍結 → 風を止め、氷の橋を作る。',next:0}
];
export const DIFFICULTIES={
 assist:{name:'アシスト',hp:28,damage:.55,speed:.72,gravity:1510,jump:690,double:true,tip:'二段ジャンプ・高い体力。はじめての人に。'},
 normal:{name:'スタンダード',hp:20,damage:1,speed:1,gravity:1700,jump:680,double:false,tip:'攻撃を見切って、ジャンプとダッシュで攻略。'},
 expert:{name:'エキスパート',hp:16,damage:1.35,speed:1.14,gravity:1700,jump:680,double:false,tip:'速い敵と重いダメージ。腕に自信がある人へ。'}
};
export const STAGES=[
 {id:0,code:'01',name:'ネオン・スカイライン',en:'NEON SKYLINE',sub:'夜明けの空中都市',boss:'ヴォルト・ファルコン',theme:'city',accent:'#75e7ff',sky:['#080f24','#203e56','#385e70'],tile:'#29455b',dark:'#15283d',reward:'arc',weak:'frost',hp:52,gimmick:'動く足場 / 電撃ドローン'},
 {id:1,code:'02',name:'フレア・ファウンドリー',en:'FLARE FOUNDRY',sub:'眠らない溶鉱炉',boss:'フレア・ゴーレム',theme:'fire',accent:'#ff9b7e',sky:['#1c1425','#482b3e','#825047'],tile:'#573e47',dark:'#2d2436',reward:'flame',weak:'arc',hp:60,gimmick:'コンベア / 火柱'},
 {id:2,code:'03',name:'フロスト・アーカイブ',en:'FROST ARCHIVE',sub:'氷に閉ざされた記憶',boss:'フロスト・マンティス',theme:'ice',accent:'#b4c8ff',sky:['#11182f','#304062','#617e98'],tile:'#425b77',dark:'#24344d',reward:'frost',weak:'flame',hp:56,gimmick:'氷の床 / 冷却レーザー'},
 {id:3,code:'Ω',name:'ネクサス・コア',en:'NEXUS CORE',sub:'すべてをつなぐ心臓',boss:'ネクサス・プライム',theme:'core',accent:'#ff8ecb',sky:['#100c25','#39284f','#724057'],tile:'#503e5b',dark:'#2d223e',reward:null,weak:null,hp:96,gimmick:'3つのボス撃破で解放'}
];
const INTEL=[
 {district:'AEROSPACE / 01',brief:'空中都市の送電網が暴走。空を守っていたファルコンを解放せよ。',bossTip:'羽根弾の隙間を抜け、急降下の予告線から離れる。',route:'氷でタービン停止・空中ショートカット',patterns:['feather','dive','storm'],gimmick:'強風タービン / 空中足場'},
 {district:'INDUSTRIAL / 02',brief:'終わらない増産命令で炉心が過熱。ゴーレムを止めて工場を冷却せよ。',bossTip:'着地の衝撃波をジャンプ。火柱の予告から退避。',route:'電撃で発電装置起動・炉の罠を停止',patterns:['quake','furnace','flamewall'],gimmick:'溶鉱炉 / プレス機 / コンベア'},
 {district:'ARCHIVE / 03',brief:'都市の記憶を封じた冷却施設。氷壁の奥でマンティスが待つ。',bossTip:'戻る鎌に注意。天井の氷柱は影を見て回避。',route:'炎で氷壁を溶かす・保管庫への裏道',patterns:['scythe','skate','icicle'],gimmick:'氷壁 / 滑る床 / 警備ロボット'},
 {district:'CONTROL / Ω',brief:'守護機の記憶をつなぎ、暴走命令の発信源ネクサスへ。3つの力で都市を取り戻せ。',bossTip:'各守護機の技を連続使用。特殊武器すべてが有効。',route:'発電・融解・凍結の3つを使い分ける',patterns:['storm','skate','quake','scythe','furnace'],gimmick:'3つの力で制御中枢を攻略'}
];
STAGES.forEach((stage,i)=>Object.assign(stage,INTEL[i]));
export function createLevel(id){
 id=Number.isInteger(id)&&id>=0&&id<4?id:0;
 const meta=STAGES[id]||STAGES[0],l={...meta,width:5480,gate:4576,bossX:4910,solids:[],platforms:[],enemies:[],items:[],hazards:[],devices:[],checkpoints:[{x:2232,y:420},{x:4410,y:420}],signs:[]};
 const ground=(x,w,kind='solid')=>l.solids.push({x,y:420,w,h:180,kind});
 const ledge=(x,y,w,kind='solid')=>l.solids.push({x,y,w,h:24,kind,oneWay:true});
 const foe=(x,y,type='walker')=>l.enemies.push({x,y,type});
 const item=(x,y,type='energy')=>l.items.push({id:`${id}:${l.items.length}`,x,y,type});
 const layouts=[[[0,736],[864,608],[1600,896],[2624,736],[3520,608],[4256,1224]],[[0,704],[832,736],[1696,672],[2496,768],[3392,704],[4224,1256]],[[0,768],[896,704],[1728,672],[2528,768],[3424,640],[4192,1288]],[[0,704],[832,736],[1696,704],[2528,736],[3392,704],[4224,1256]]];
 layouts[id].forEach(([x,w],i)=>ground(x,w,id===2?'ice':id===1&&i%2?'belt':id===3&&i===2?'belt':id===3&&i===3?'ice':'solid'));
 const shelves=[[[480,340,128],[1016,332,160],[1240,260,128],[1744,330,144],[1976,250,144],[2208,332,128],[2768,330,128],[2952,254,160],[3168,330,128],[3680,334,112],[3904,268,128]],[[464,340,144],[952,330,176],[1192,254,176],[1400,336,96],[1808,328,160],[2048,246,160],[2640,330,144],[2856,250,176],[3096,330,112],[3536,330,144],[3760,258,160],[3960,334,96]],[[480,338,144],[1032,328,160],[1264,250,160],[1864,332,144],[2072,252,144],[2680,334,128],[2888,252,144],[3096,330,144],[3584,332,144],[3816,252,144]],[[480,330,144],[1056,332,144],[1280,250,144],[1824,330,144],[2048,250,160],[2656,330,160],[2872,250,144],[3096,328,120],[3552,330,144],[3776,250,144]]];
 shelves[id].forEach(([x,y,w])=>ledge(x,y,w,id===2?'ice':'solid'));
 const cores=[[[1300,228],[2044,218],[3952,236]],[[1280,222],[2128,214],[3832,226]],[[1344,218],[2144,220],[3888,220]],[[1352,218],[2120,218],[3848,218]]];cores[id].forEach(([x,y])=>item(x,y,'core'));
 if(id===0)l.platforms.push({x:3312,y:338,w:100,h:20,range:120,speed:1.05});
 if(id===1||id===3)for(const [x,offset]of[[1360,0],[3024,1.4],[3590,.5]])l.hazards.push({x,y:326,w:34,h:94,kind:'vent',period:3.8,offset});
 if(id===2||id===3)for(const[x,offset]of[[1456,0],[3140,1]])l.hazards.push({x,y:296,w:26,h:124,kind:'laser',period:4.2,offset});
 foe(570,390);foe(1120,388,'turret');foe(1350,224,'drone');foe(1860,390,'hopper');foe(2330,390);
 foe(2790,304,'turret');foe(3030,215,'drone');foe(3650,390,'hopper');foe(4000,390,'turret');
 for(const s of l.solids)if(!s.oneWay&&s.x>0&&s.x<4300)for(let k=0;k<5;k++)item(s.x-116+k*28,334-Math.sin(k/4*Math.PI)*35);
 for(const x of[620,1930,2740,4310])item(x,390,'health');for(const x of[430,990,1810,2790,3610,4360])item(x,374);
 l.solids.push({x:1800,y:120,w:32,h:140,kind:'solid'});
 const hints=['走る・跳ぶ・撃つ','炉のリズムを読もう','氷の上は少し滑る','最後のシグナルへ'];
 l.signs.push({x:220,y:304,text:['送電塔へ — 空中ダッシュで進もう','炉心へ — 予告を見て突破','記憶庫へ — 滑る床に注意','制御中枢へ — 特殊武器を使い分けよう'][id]});
 // Each district has a different silhouette and obstacle rhythm; the ground route is buster-clearable.
 const blocks=[[[928,356,64,64],[1656,332,80,88],[2744,348,64,72]],[[936,364,96,56],[1736,348,72,72],[3440,364,72,56]],[[976,364,64,56],[1760,340,64,80],[3488,360,72,60]],[[944,348,64,72],[1736,364,64,56],[3440,348,64,72]]];
 for(const[x,y,w,h]of blocks[id])l.solids.push({x,y,w,h,kind:id===2?'ice':'solid'});
 // Encounters teach one idea before combining it with platforming.
 l.enemies=[];
 const encounters=[
 [[480,398,'helmet'],[990,302,'drone'],[1270,398,'shield'],[1780,270,'drone'],[2120,398,'hopper'],[2380,398,'helmet'],[2890,398,'turret'],[3200,246,'drone'],[3740,398,'shield'],[4050,198,'sentry']],
 [[480,398,'helmet'],[1080,398,'shield'],[1400,198,'sentry'],[1880,398,'hopper'],[2320,398,'helmet'],[2790,298,'turret'],[3160,398,'shield'],[3660,398,'hopper'],[3980,190,'sentry']],
 [[510,398,'shield'],[1110,302,'drone'],[1440,398,'helmet'],[1890,398,'shield'],[2300,198,'sentry'],[2740,398,'hopper'],[3030,222,'drone'],[3720,398,'helmet'],[4000,398,'shield']],
 [[510,398,'helmet'],[1120,398,'shield'],[1370,210,'drone'],[1870,398,'hopper'],[2380,198,'sentry'],[2760,398,'helmet'],[3160,240,'drone'],[3660,398,'shield'],[4020,190,'sentry']]
 ];encounters[id].forEach(([x,y,type])=>foe(x,y,type));
 const fan=(x,name,bridge)=>({id:name,x,y:330,w:46,h:90,kind:'wind',weapon:'frost',label:'FROST → WIND OFF',bridge});
 const relay=(x,name,bridge)=>({id:name,x,y:352,w:36,h:68,kind:'relay',weapon:'arc',label:'ARC → POWER ON',bridge});
 const ice=(x,y,name,bridge)=>({id:name,x,y,w:46,h:150,kind:'icewall',weapon:'flame',label:'FLAME → MELT',bridge});
 if(id===0){l.devices.push(fan(2876,'city-fan',{x:3360,y:330,w:160,h:20,kind:'ice'}));l.items.push({id:'upgrade:0',type:'upgrade',x:3430,y:304,requires:'city-fan'});}
 if(id===1){l.devices.push(relay(2268,'forge-relay',{x:2368,y:330,w:128,h:20,kind:'bridge'}));l.items.push({id:'upgrade:1',type:'upgrade',x:2412,y:304,requires:'forge-relay'});for(const[x,offset]of[[1950,.8],[3800,2]])l.hazards.push({x,y:240,w:54,h:180,kind:'press',period:4.6,offset});}
 if(id===2){l.devices.push(ice(1988,178,'archive-ice',{x:1940,y:270,w:260,h:18,kind:'bridge'}));l.items.push({id:'upgrade:2',type:'upgrade',x:2060,y:244,requires:'archive-ice'});}
 if(id===3){l.devices.push(relay(1120,'core-relay',{x:1568,y:390,w:128,h:18,kind:'bridge'}),ice(2790,270,'core-ice',{x:2810,y:328,w:300,h:18,kind:'bridge'}),fan(3610,'core-fan',{x:4096,y:348,w:128,h:18,kind:'ice'}));}
 for(const d of l.devices)l.signs.push({x:d.x-90,y:d.y-32,text:d.label});
 return l;
}
export const freshSave=()=>({version:1,cleared:[],upgrades:[],cores:{},best:{},checkpoint:null,difficulty:'normal',muted:false,autoFire:false,reducedMotion:false});
export function validateSave(raw){
 const s=freshSave();if(!raw||raw.version!==1)return s;
 s.cleared=[...new Set(Array.isArray(raw.cleared)?raw.cleared.filter(n=>Number.isInteger(n)&&n>=0&&n<4):[])];
 s.upgrades=[...new Set(Array.isArray(raw.upgrades)?raw.upgrades.filter(n=>Number.isInteger(n)&&n>=0&&n<3):[])];
 s.difficulty=Object.hasOwn(DIFFICULTIES,raw.difficulty)?raw.difficulty:'normal';for(const k of['muted','autoFire','reducedMotion'])s[k]=raw[k]===true;
 for(let i=0;i<4;i++){if(Number.isFinite(raw.cores?.[i]))s.cores[i]=Math.max(0,Math.min(3,Math.floor(raw.cores[i])));if(Number.isFinite(raw.best?.[i]))s.best[i]=Math.max(0,Math.floor(raw.best[i]));}
 const c=raw.checkpoint;
 if(c&&Number.isInteger(c.stage)&&c.stage>=0&&c.stage<4&&[0,1,2].includes(c.index)&&(c.stage<3||[0,1,2].every(i=>s.cleared.includes(i)))){
  const valid=new Set(createLevel(c.stage).items.map(i=>i.id));s.checkpoint={stage:c.stage,index:c.index,score:Number.isFinite(Number(c.score))?Math.max(0,Math.min(100000,Number(c.score))):0,collected:[...new Set(Array.isArray(c.collected)?c.collected.filter(i=>valid.has(i)):[])]};
 }return s;
}
