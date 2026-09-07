// HMI Lab — quiz.js: verifica a risposta multipla con feedback e spiegazione
(function(){
  const Q=[
    {q:'Segnale sin(2π·100t) campionato a 150 Hz. Quale fenomeno si verifica?',o:['Nessun fenomeno, dato che 150 è superiore a 100','Aliasing con frequenza apparente di circa 50 Hz','Aliasing con frequenza apparente di 250 Hz','È sufficiente aumentare il numero di bit'],a:1,w:'Il teorema di Nyquist richiede fs superiore a 2·100 = 200 Hz. Con 150 Hz la componente si ripiega a |150 − 100| = 50 Hz.'},
    {q:'ADC con intervallo 0–5 V e risoluzione a 8 bit: livelli, passo e SQNR?',o:['256 livelli, passo di circa 19,6 mV, SQNR di circa 49,9 dB','255 livelli, passo di 20 mV, SQNR di circa 48 dB','1024 livelli, passo di circa 5 mV, SQNR di circa 62 dB','128 livelli, passo di circa 39 mV, SQNR di circa 44 dB'],a:0,w:'L = 2⁸ = 256; passo = 5/255, circa 19,6 mV; SQNR circa 6,02·8 + 1,76 = 49,9 dB.'},
    {q:'Sequenza [2,3,2,20,3,2,1] con finestra W = 3 sul valore anomalo: esito dei due filtri?',o:['Entrambi restituiscono 3','La media restituisce circa 8,3 (errore distribuito), il mediano 3 (outlier escluso)','La media restituisce 3, il mediano circa 8,3','Entrambi restituiscono 20'],a:1,w:'Media: (2 + 20 + 3)/3, circa 8,33, con alterazione dei campioni vicini. Mediano di {2, 20, 3}: 3.'},
    {q:'TP = 40, TN = 950, FP = 10, FN = 5. Quale lettura è corretta?',o:['Accuracy del 98,5%, quindi modello privo di criticità','Accuracy fuorviante per lo sbilanciamento; F1 di circa 0,84 più informativo','Precision pari a 88,9%','Recall pari a 80%'],a:1,w:'Acc = 990/1005 = 98,5%, dominata dai veri negativi. Prec = 40/50 = 80%; Rec = 40/45, circa 88,9%; F1 circa 0,84.'},
    {q:'Segnale x(t) = 10·cos(2πft) su tempo infinito: energia e potenza?',o:['Energia finita, potenza infinita','Energia infinita, potenza pari a A²/2 = 50','Energia pari a 50T, potenza dipendente da f','Energia e potenza nulle'],a:1,w:'Sinusoide su tempo infinito: segnale di potenza con E infinita e P = A²/2 = 50, indipendente dalla frequenza.'},
    {q:'Tracciato EDA con picco impulsivo da contatto accidentale: sequenza corretta per stimare la SCL?',o:['Prima filtro di media, poi filtro mediano','Solo filtro passa-alto a 50 Hz','Prima filtro mediano, poi media o passa-basso','Incremento del numero di bit'],a:2,w:'Il filtro mediano elimina il valore anomalo senza distribuirlo; successivamente si estrae il trend lento.'},
    {q:'Perché la Random Forest supera generalmente il singolo albero di decisione?',o:['Perché utilizza un kernel RBF','Perché bagging e voto di maggioranza riducono varianza e overfitting','Perché presenta bias maggiore','Perché non richiede validazione'],a:1,w:'Ensemble su campioni e feature con voto di maggioranza: riduzione della varianza complessiva.'},
    {q:'Classi disposte a cerchio (A al centro, B ad anello). Come procedere con una SVM?',o:['È sufficiente un iperpiano lineare','È necessario un kernel RBF o polinomiale','È sufficiente K = 1','È sufficiente un filtro notch a 50 Hz'],a:1,w:'Classi non linearmente separabili: il kernel proietta i dati in uno spazio di dimensione superiore.'},
    {q:'Overfitting in termini di bias e varianza?',o:['Bias elevato, varianza ridotta','Bias ridotto, varianza elevata','Bias elevato, varianza elevata','Bias ridotto, varianza ridotta'],a:1,w:'Il modello riproduce i dati di train, rumore incluso (bias ridotto), ma risulta ipersensibile alle fluttuazioni (varianza elevata).'},
    {q:'Quale procedura costituisce data leakage?',o:['Validazione LOSO-CV','Normalizzazione su intero dataset prima della suddivisione','K-Fold con K = 5','Z-score con parametri stimati sul solo train'],a:1,w:'I parametri stimati sul test contaminano il train. La stima dei parametri va effettuata sul solo train.'},
    {q:'P300: perché si ricorre alla media sincrona (averaging) su N trial?',o:['Per incrementare la frequenza di campionamento','Perché il rapporto segnale-rumore cresce con √N e il picco emerge dal rumore','Per modificare la valenza dello stimolo','Per eliminare il kernel'],a:1,w:'La media sincrona preserva la componente coerente e attenua il rumore come 1/√N.'},
    {q:'DEAP: in cosa consiste la modality fusion?',o:['Utilizzo del solo EEG','Combinazione di EEG, segnali periferici e MCA degli stimoli, superiore al singolo segnale','Registrazione del solo volto','Somministrazione dei soli questionari SAM'],a:1,w:'La combinazione di EEG, segnali periferici e feature dei video-stimolo (MCA) produce le prestazioni migliori.'}
  ];
  const box=document.getElementById('quizBox'); if(!box) return;
  const scoreEl=document.getElementById('quizScore'), prog=document.getElementById('quizProg'), bestEl=document.getElementById('quizBest');
  let best=+(localStorage.getItem('hmi-quiz-best')||-1);
  if(best>=0) bestEl.textContent='miglior punteggio: '+best+' / '+Q.length;
  let score=0, done=0;
  const letters=['A','B','C','D'];
  Q.forEach((item,i)=>{
    const d=document.createElement('article'); d.className='q'; d.id='q'+i;
    d.innerHTML=`<h4>${i+1}. ${item.q}</h4><div class="opts"></div><p class="why" hidden></p>`;
    const opts=d.querySelector('.opts'), why=d.querySelector('.why');
    item.o.forEach((t,j)=>{
      const b=document.createElement('button'); b.type='button'; b.className='opt'; b.innerHTML=`<strong>${letters[j]}</strong> · ${t}`;
      b.addEventListener('click',()=>{
        if(d.classList.contains('done')) return;
        d.classList.add('done'); done++;
        const ok = j===item.a;
        [...opts.children].forEach((c,k)=>{ if(k===item.a) c.classList.add('correct'); });
        if(!ok) b.classList.add('wrong'); else score++;
        why.hidden=false; why.innerHTML=(ok?'<strong>Risposta corretta.</strong> ':'<strong>Risposta errata.</strong> ')+item.w;
        scoreEl.textContent=`Punteggio: ${score} / ${Q.length}`;
        prog.style.width=(done/Q.length*100)+'%';
        if(done===Q.length){
          const msg = score===Q.length?'Punteggio massimo: preparazione completa su questi contenuti.':score>=8?'Buon risultato: si consiglia di rivedere le risposte errate.':score>=6?'Risultato sufficiente: si consiglia di ripassare formulario e laboratori.':'Si consiglia di rivedere i laboratori e il formulario, quindi di ripetere la verifica.';
          why.innerHTML+=' <br><strong>'+msg+'</strong>';
          if(score>best){ best=score; localStorage.setItem('hmi-quiz-best',best); bestEl.textContent='miglior punteggio: '+best+' / '+Q.length; }
        }
      });
      opts.appendChild(b);
    });
    box.appendChild(d);
  });
  document.getElementById('quizReset')?.addEventListener('click',()=>{
    score=0; done=0; scoreEl.textContent='Punteggio: 0 / '+Q.length; prog.style.width='0';
    box.querySelectorAll('.q').forEach(q=>{ q.classList.remove('done'); q.querySelectorAll('.opt').forEach(o=>o.classList.remove('correct','wrong')); q.querySelector('.why').hidden=true; });
    document.getElementById('quiz').scrollIntoView({behavior:'smooth'});
  });
})();
