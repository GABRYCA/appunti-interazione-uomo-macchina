// HMI Lab — labs.js: 7 canvas interactivi, vanilla, accessibili
(function(){
  const $ = id => document.getElementById(id);
  function ctx2d(c){ const dpr = Math.min(2, window.devicePixelRatio||1); const w=c.width,h=c.height; c.style.aspectRatio = w+'/'+h; const x=c.getContext('2d'); return {x,w,h}; }
  function axes(x,w,h,pad=28){
    x.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#ccc';
    x.lineWidth=1; x.beginPath(); x.moveTo(pad,8); x.lineTo(pad,h-22); x.lineTo(w-8,h-22); x.stroke();
    x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#888';
    x.font='11px system-ui'; x.fillText('A', 6, 16); x.fillText('t →', w-34, h-8);
  }

  /* LAB 1 aliasing */
  const aF=$('aliasF'), aFs=$('aliasFs');
  function drawAlias(){
    if(!aF) return;
    const f=+aF.value, fs=+aFs.value;
    $('aliasFOut').textContent=f; $('aliasFsOut').textContent=fs;
    const {x,w,h}=ctx2d($('aliasCanvas')); x.clearRect(0,0,w,h); axes(x,w,h);
    const pad=28, W=w-pad-12, H=h-40;
    const T=2, N=400;
    // segnale originale
    x.lineWidth=2.5; x.strokeStyle='#0f6f6a'; x.beginPath();
    for(let i=0;i<=N;i++){ const t=i/N*T, y=Math.sin(2*Math.PI*f*t); const px=pad+i/N*W, py=(h-22)-((y+1)/2)*H; i?x.lineTo(px,py):x.moveTo(px,py); }
    x.stroke();
    // campioni
    const ns=Math.max(2,Math.floor(T*fs));
    x.fillStyle='#c2542b';
    const pts=[];
    for(let n=0;n<=ns;n++){ const t=n/fs; if(t>T) break; const y=Math.sin(2*Math.PI*f*t); pts.push([t,y]); const px=pad+t/T*W, py=(h-22)-((y+1)/2)*H; x.beginPath(); x.arc(px,py,3.4,0,7); x.fill(); }
    // alias ricostruito: f_alias = |f - round(f/fs)*fs|
    // Nota: i campioni valgono sin(2π·f·n/fs) = sin(2π·(f-k·fs)·n/fs),
    // quindi la sinusoide apparente deve usare la frequenza con segno
    // fall = f-k·fs (non solo |fall|): sin è dispari, perciò se fall<0
    // la ricostruzione è invertita (-sin(2π·fa·t)) e solo così passa
    // esattamente per i punti campionati (cfr. figura LaTeX con -sin).
    const k=Math.round(f/fs), fall=f-k*fs, fa=Math.abs(fall);
    const ok = fs > 2*f;
    if(!ok){
      x.setLineDash([6,4]); x.lineWidth=2; x.strokeStyle='#b42318'; x.beginPath();
      for(let i=0;i<=N;i++){ const t=i/N*T, v=Math.sin(2*Math.PI*fall*t); const px=pad+i/N*W, py=(h-22)-((v+1)/2)*H; i?x.lineTo(px,py):x.moveTo(px,py); }
      x.stroke(); x.setLineDash([]);
    }
    // legenda colori (stessi colori delle curve)
    try{
      const inkA=((getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#1b2a30').trim()||'#1b2a30');
      x.font='11px system-ui'; x.lineWidth=2.5;
      x.strokeStyle='#0f6f6a'; x.beginPath(); x.moveTo(pad+6,15); x.lineTo(pad+32,15); x.stroke();
      x.fillStyle='#c2542b'; x.beginPath(); x.arc(pad+118,15,3.4,0,7); x.fill();
      x.fillStyle=inkA; x.fillText('originale '+f+' Hz', pad+36, 19); x.fillText('campioni fs='+fs+' Hz', pad+126, 19);
      if(!ok){ x.strokeStyle='#b42318'; x.setLineDash([6,4]); x.lineWidth=2; x.beginPath(); x.moveTo(pad+258,15); x.lineTo(pad+284,15); x.stroke(); x.setLineDash([]); x.fillStyle=inkA; x.fillText('alias '+fa.toFixed(1)+' Hz', pad+288, 19); }
    }catch(e){}
    x.fillStyle='#1b2a30'; x.font='12px system-ui';
    const inv = !ok && fall < 0 ? ' (con inversione di fase: la ricostruzione corretta è −sin(2π·'+fa.toFixed(1)+'·t), non +sin)' : '';
    $('aliasResult').innerHTML = ok
      ? `Condizione rispettata: f<sub>s</sub> = ${fs} Hz superiore a 2·${f} = ${2*f} Hz. Ricostruzione fedele.`
      : `Aliasing: sarebbero necessari oltre ${2*f} Hz, contro i ${fs} Hz impostati. Frequenza apparente: circa <strong>${fa.toFixed(1)} Hz</strong>${inv} (frequenza di Nyquist: ${(fs/2).toFixed(1)} Hz).`;
  }
  aF?.addEventListener('input',drawAlias); aFs?.addEventListener('input',drawAlias); drawAlias();

  /* LAB 2 quant */
  const qB=$('qBits'), qF=$('qFs'), qV=$('qVin');
  function drawQuant(){
    if(!qB) return;
    const b=+qB.value, fs=+qF.value, vin=+qV.value;
    $('qBitsOut').textContent=b; $('qFsOut').textContent=fs; $('qVinOut').textContent=vin.toFixed(2);
    const L=2**b, Vmin=0, Vmax=5, d=(Vmax-Vmin)/(L-1);
    const lvl=Math.round((vin-Vmin)/d), sqnr=(6.02*b+1.76), R=b*fs;
    const {x,w,h}=ctx2d($('quantCanvas')); x.clearRect(0,0,w,h); axes(x,w,h);
    const pad=28,W=w-pad-12,H=h-40;
    x.lineWidth=2;x.strokeStyle='#0f6f6a';x.beginPath();
    for(let i=0;i<=300;i++){ const t=i/300, y=Math.sin(t*Math.PI*4)*2.5+2.5; const px=pad+t*W, py=(h-22)-(y/5)*H; i?x.lineTo(px,py):x.moveTo(px,py);}
    x.stroke();
    x.strokeStyle='rgba(178,35,24,.8)';x.lineWidth=1.4;
    for(let l=0;l<L;l++){ const v=Vmin+l*d, py=(h-22)-(v/5)*H; x.globalAlpha=.5; x.beginPath(); x.moveTo(pad,py); x.lineTo(pad+W,py); x.stroke(); }
    x.globalAlpha=1;
    const qv=Vmin+lvl*d, qy=(h-22)-(qv/5)*H, vy=(h-22)-(vin/5)*H;
    x.fillStyle='#16794c'; x.beginPath(); x.arc(pad+W*0.62,vy,5,0,7); x.fill();
    x.fillStyle='#b42318'; x.beginPath(); x.arc(pad+W*0.62,qy,5,0,7); x.fill();
    $('quantResult').innerHTML=`L = <strong>${L}</strong> livelli; Δ circa <strong>${(d*1000).toFixed(1)} mV</strong>; V<sub>in</sub> = ${vin.toFixed(2)} V, corrispondente al livello <strong>${lvl}</strong> (${qv.toFixed(3)} V). SQNR circa <strong>${sqnr.toFixed(2)} dB</strong>; bitrate <strong>${R} bps</strong>.`;
  }
  qB?.addEventListener('input',drawQuant); qF?.addEventListener('input',drawQuant); qV?.addEventListener('input',drawQuant); drawQuant();

  /* LAB energia */
  const eA=$('enA'), eF=$('enF');
  function drawEnergy(){
    if(!eA) return;
    const A=+eA.value, f=+eF.value;
    $('enAOut').textContent=A; $('enFOut').textContent=f;
    const P=A*A/2, T=1/f, E=P*T;
    $('energyResult').innerHTML=`P = A²/2 = <strong>${P.toFixed(2)}</strong> (indipendente dalla frequenza). Energia su un periodo T = ${T.toFixed(3)} s: <strong>${E.toFixed(3)}</strong>. Su tempo infinito, E = <strong>∞</strong>: al variare di f, P resta pari a <strong>${P.toFixed(2)}</strong>.`;
  }
  eA?.addEventListener('input',drawEnergy); eF?.addEventListener('input',drawEnergy); drawEnergy();

  /* LAB 3 filtri */
  let sig=[2,3,2,20,3,2,1];
  const fW=$('filtW');
  function med(a){ const s=[...a].sort((p,q)=>p-q); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; }
  function filtMean(a,W){ const k=(W-1)/2; return a.map((_,i)=>{ let s=0,c=0; for(let j=-k;j<=k;j++){ const v=a[i+j]; if(v!==undefined){s+=v;c++;} } return s/c; }); }
  function filtMed(a,W){ const k=(W-1)/2; return a.map((_,i)=>{ const win=[]; for(let j=-k;j<=k;j++){ const v=a[i+j]; if(v!==undefined) win.push(v);} return med(win); }); }
  function drawFilter(){
    if(!fW) return;
    const W=+fW.value; $('filtWOut').textContent=W;
    const m1=filtMean(sig,W), m2=filtMed(sig,W);
    const {x,w,h}=ctx2d($('filterCanvas')); x.clearRect(0,0,w,h);
    const pad=30,Wpx=w-pad-16,Hpx=h-50, max=Math.max(...sig,...m1,...m2,10);
    function bars(arr,color,off,bw){
      x.fillStyle=color;
      arr.forEach((v,i)=>{ const bw2=Wpx/arr.length*.22; const px=pad+i*(Wpx/arr.length)+Wpx/arr.length/2-bw2*1.5+off; const ph=(v/max)*Hpx; x.fillRect(px,(h-26)-ph,bw2,ph); });
    }
    x.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted'); x.font='11px system-ui';
    x.fillText('max '+max.toFixed(1), 4, 14);
    bars(sig,'#94a3b8',0); bars(m1,'#2563eb',14); bars(m2,'#16794c',28);
    const ink = (getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#1b2a30').trim() || '#1b2a30';
    x.font='11px system-ui';
    // legenda a tre campioni, con colori identici alle barre
    x.fillStyle='#94a3b8'; x.fillRect(8,h-14,10,10);
    x.fillStyle='#2563eb'; x.fillRect(96,h-14,10,10);
    x.fillStyle='#16794c'; x.fillRect(172,h-14,10,10);
    x.fillStyle=ink;
    x.fillText('originale', 22, h-5); x.fillText('media', 110, h-5); x.fillText('mediano', 186, h-5);
    const spikeIdx=sig.indexOf(Math.max(...sig));
    $('filterResult').innerHTML=`W=${W}: in corrispondenza del valore anomalo (indice ${spikeIdx}, valore ${Math.max(...sig)}) la media restituisce <strong>${m1[spikeIdx].toFixed(2)}</strong> (errore distribuito ai campioni vicini), il mediano restituisce <strong>${m2[spikeIdx].toFixed(2)}</strong> (outlier escluso). Sequenza originale: [${sig.join(', ')}]`;
  }
  fW?.addEventListener('input',drawFilter);
  $('filtSpike')?.addEventListener('click',()=>{ const i=1+Math.floor(Math.random()*(sig.length-2)); sig[i]=18+Math.round(Math.random()*14); drawFilter(); });
  $('filtReset')?.addEventListener('click',()=>{ sig=[2,3,2,20,3,2,1]; drawFilter(); });
  drawFilter();

  /* LAB bias */
  const bC=$('biasC');
  function drawBias(){
    if(!bC) return;
    const c=+bC.value; $('biasOut').textContent=c;
    const {x,w,h}=ctx2d($('biasCanvas')); x.clearRect(0,0,w,h);
    const pad=34,W=w-pad-14,H=h-44;
    function curve(fn,color){ x.strokeStyle=color;x.lineWidth=2.4;x.beginPath(); for(let i=0;i<=100;i++){ const cx=1+i/100*9, v=fn(cx); const px=pad+i/100*W, py=(h-26)-(v/10)*H; i?x.lineTo(px,py):x.moveTo(px,py);} x.stroke(); }
    curve(cx=>9*Math.exp(-cx/2.2)+0.6,'#0f6f6a');      // bias
    curve(cx=>0.4+0.09*cx*cx,'#c2542b');               // variance
    curve(cx=>9*Math.exp(-cx/2.2)+0.09*cx*cx+1.0,'#16794c'); // totale = bias + varianza
    const inkCol = (getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#1b2a30').trim() || '#1b2a30';
    const px=pad+(c-1)/9*W; x.strokeStyle=inkCol; x.setLineDash([4,4]); x.beginPath(); x.moveTo(px,8); x.lineTo(px,h-26); x.stroke(); x.setLineDash([]);
    x.font='11px system-ui'; x.fillStyle='#0f6f6a'; x.fillText('bias',pad+4,16); x.fillStyle='#c2542b'; x.fillText('varianza',w-90,16); x.fillStyle='#16794c'; x.fillText('errore totale',w-160,h-30);
    const label = c<=3?'<strong>Underfitting</strong> (bias elevato): modello troppo semplice, con errori sistematici su train e test.':c>=8?'<strong>Overfitting</strong> (varianza elevata): il modello riproduce il rumore di train e degrada sul test.':'<strong>Punto di ottimo</strong>: compromesso che massimizza la generalizzazione.';
    $('biasResult').innerHTML=`Complessità ${c}/10 → ${label}`;
  }
  bC?.addEventListener('input',drawBias); drawBias();

  /* LAB metriche */
  function drawMetrics(){
    const tp=+$('mTP').value||0, tn=+$('mTN').value||0, fp=+$('mFP').value||0, fn=+$('mFN').value||0;
    $('cTP').textContent=tp; $('cTN').textContent=tn; $('cFP').textContent=fp; $('cFN').textContent=fn;
    const tot=tp+tn+fp+fn||1, acc=(tp+tn)/tot, prec=tp/(tp+fp||1), rec=tp/(tp+fn||1), f1=2*prec*rec/((prec+rec)||1);
    $('metricsResult').innerHTML=`Accuracy <strong>${(acc*100).toFixed(1)}%</strong> · Precision <strong>${(prec*100).toFixed(1)}%</strong> · Recall <strong>${(rec*100).toFixed(1)}%</strong> · F1 <strong>${f1.toFixed(3)}</strong>${acc>0.9&&(tp+fn)<(tn+fp)/4?' — Nota: accuracy elevata ma classi sbilanciate; si considerino <strong>F1 e Recall</strong>.':''}`;
  }
  ['mTP','mTN','mFP','mFN'].forEach(id=>$(id)?.addEventListener('input',drawMetrics)); drawMetrics();

  /* LAB Russell */
  const info={'HA-HV':['Arousal elevato e valenza positiva','Stati di eccitazione, felicità ed entusiasmo. Correlati tipici: picchi SCR ampi e frequenza cardiaca elevata.'],'HA-LV':['Arousal elevato e valenza negativa','Stati di rabbia, ansia e tensione. Quadrante caratteristico dello stress: HRV ridotta (RMSSD in calo) e picchi EDA frequenti.'],'LA-LV':['Arousal ridotto e valenza negativa','Stati di tristezza e apatia. Correlati tipici: segnali stabili e di bassa ampiezza, frequenza cardiaca contenuta, SCL in calo.'],'LA-HV':['Arousal ridotto e valenza positiva','Stati di rilassamento e calma. Correlati tipici: HRV elevata e respiro lento; condizione di riferimento per il neurofeedback.']};
  document.querySelectorAll('#russellQuads rect').forEach(r=>{
    function show(){ const [t,d]=info[r.dataset.q]; $('russellResult').innerHTML=`<strong>${t}:</strong> ${d}`; }
    r.addEventListener('click',show); r.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(); } });
  });

  /* LAB EEG */
  document.querySelectorAll('#eegTable tr[data-band]').forEach(tr=>{
    function show(){ document.querySelectorAll('#eegTable tr').forEach(o=>o.classList.remove('sel')); tr.classList.add('sel'); $('eegResult').innerHTML='<strong>'+tr.cells[0].textContent.trim()+' ('+tr.cells[1].textContent.trim()+'):</strong> '+tr.dataset.band; }
    tr.addEventListener('click',show); tr.addEventListener('keydown',e=>{ if(e.key==='Enter'){show();} });
  });

  /* LAB P300 */
  const pN=$('p300N');
  function drawP300(){
    if(!pN) return;
    const N=+pN.value; $('p300Out').textContent=N;
    const {x,w,h}=ctx2d($('p300Canvas')); x.clearRect(0,0,w,h); axes(x,w,h);
    const pad=28,W=w-pad-12,H=h-40;
    // segnale: rumore + picco a 300ms
    let seed=N*7919;
    function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff-0.5; }
    x.lineWidth=2; x.strokeStyle='#0f6f6a'; x.beginPath();
    const noiseAmp = 3/Math.sqrt(N);
    for(let i=0;i<=400;i++){ const t=i/400*0.8; const p300=2.2*Math.exp(-((t-0.3)**2)/(2*0.03**2)); const nse=rnd()*noiseAmp; const v=p300+nse; const px=pad+t/0.8*W, py=(h-22)-((v+2)/6)*H; i?x.lineTo(px,py):x.moveTo(px,py); }
    x.stroke();
    const px300=pad+0.3/0.8*W; x.strokeStyle='#b42318'; x.setLineDash([5,4]); x.beginPath(); x.moveTo(px300,10); x.lineTo(px300,h-22); x.stroke(); x.setLineDash([]);
    $('p300Result').innerHTML=`N = ${N} trial: rumore residuo proporzionale a 1/√N = <strong>${(1/Math.sqrt(N)).toFixed(2)}</strong>, con SNR migliorato di un fattore <strong>${Math.sqrt(N).toFixed(1)}</strong>. ${N<8?'Con questo numero di trial il picco P300 resta difficilmente distinguibile dal rumore.':'Il picco P300 a 300 ms risulta chiaramente distinguibile.'}`;
  }
  pN?.addEventListener('input',drawP300); drawP300();

  window.addEventListener('resize', ()=>{ drawAlias(); drawQuant(); drawFilter(); drawBias(); drawP300(); });
})();
