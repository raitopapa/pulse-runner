const button=document.getElementById('update'),status=document.getElementById('status');
const waitFor=(worker,states)=>new Promise((resolve,reject)=>{const check=()=>{if(states.includes(worker.state)){worker.removeEventListener('statechange',check);resolve();}else if(worker.state==='redundant'){worker.removeEventListener('statechange',check);reject(new Error('install failed'));}};worker.addEventListener('statechange',check);check();});
button.onclick=async()=>{button.disabled=true;status.textContent='新しいゲームデータを確認しています…';try{
 if(!('serviceWorker' in navigator)){location.replace('./');return;}
 const reg=await navigator.serviceWorker.register('./sw.js?v=2.0.2',{scope:'./',updateViaCache:'none'});await reg.update();
 const worker=reg.installing||reg.waiting;
 if(worker){await waitFor(worker,['installed','activating','activated']);if(worker.state==='installed')worker.postMessage({type:'APPLY_UPDATE'});await waitFor(worker,['activated']);}
 status.textContent='更新完了。ゲームを開きます。';location.replace('./');
 }catch{status.textContent='更新できませんでした。通信状態を確認して、もう一度お試しください。';button.disabled=false;}};
