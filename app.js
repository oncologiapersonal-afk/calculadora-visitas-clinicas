const studies={
'BENITO':{r:21,i:null,n:'C1 e C7 têm visitas adicionais D2, D3, D8 e D15. Após C18, EOT/FUP: consultar protocolo.'},
'CA224-127':{r:null,i:84,n:'Retorno não parametrizado. Imagens a cada 12 semanas; ECG se necessário.'},
'REG 2055':{r:null,i:84,n:'FUP1–FUP4: 12 semanas; após FUP4: 24 semanas.'},
'AZ SAMETA':{r:null,i:84,n:'Imagens a cada 12 semanas; coletas em ciclos pares; ECG sempre.'},
'MK6482-012':{r:null,i:84,n:'Imagens a cada 12 semanas; coleta D1 ciclos pares e ECG D1 ciclos ímpares.'},
'GO42784':{r:null,i:'year',n:'Imagens anuais (ano-calendário; confirmar regra de datas).'},
'COSMIC 312':{r:21,i:null,n:'Sem coleta e sem ECG.'},
'Paloma2 C2':{r:21,i:null,n:'Sem coleta e sem ECG.'},
'Paloma2 C4':{r:14,i:null,n:'Alterna CxD1 → CxD15 → C(x+1)D1. Sem coleta e sem ECG.'},
'Gilead Star 121':{r:21,i:null,n:'Coleta em C12D1, C18D1, C24D1, C30D1; sem ECG.'},
'Tropion Lung 07':{r:21,i:null,n:'Coleta em todos os ciclos; FUP 30D → LT FUP1 e LT FUP trimestral.'},
'V940-001':{r:168,i:null,n:'Visitas de eficácia a cada 24 semanas; coleta sempre; sem ECG.'},
'COSMIC 313':{r:null,i:null,n:'Intervalo não confirmado; sem coleta e sem ECG.'},
'Personalizado':{r:null,i:null,n:'Informe manualmente o intervalo confirmado no protocolo.'}
};
const $=id=>document.getElementById(id);let tab='retornos';
Object.keys(studies).forEach(s=>{let o=document.createElement('option');o.value=s;o.textContent=s;$('study').append(o)});
$('date').value=new Date().toLocaleDateString('en-CA');
function parseDate(s){const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d))}
function addDays(d,n){let x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
function addYear(d){let y=d.getUTCFullYear()+1,m=d.getUTCMonth(),day=d.getUTCDate();return new Date(Date.UTC(y,m,Math.min(day,new Date(Date.UTC(y,m+1,0)).getUTCDate())))}
function fmt(d){return new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(d)}
function nextVisit(v,s){let c=v.match(/^C(\d+)D(\d+)$/i);if(s==='Paloma2 C4'&&c){let n=+c[1],day=+c[2];return day===1?`C${n}D15`:day===15?`C${n+1}D1`:'Conferir visita'}if(c){let n=+c[1];if(s==='BENITO'&&(n===1||n===7)){let seq=[1,2,3,8,15];let j=seq.indexOf(+c[2]);if(j>=0&&j<4)return `C${n}D${seq[j+1]}`;if(j===4)return `C${n+1}D1`}if(+c[2]===1)return s==='BENITO'&&n>=18?'EOT (data conforme protocolo)':`C${n+1}D1`}let f=v.match(/^FUP\s*(\d+)$/i);if(f)return `FUP${+f[1]+1}`;let t=v.match(/^TA\s*(\d+)$/i);if(t)return `TA ${+t[1]+1}`;return 'Confirmar próxima visita'}
function calc(){let s=$('study').value,conf=studies[s],v=$('visit').value.trim().toUpperCase(),d=$('date').value,w=+$('window').value;if(!d||!Number.isInteger(w)||w<0){$('result').textContent='Informe data e janela válidas.';return}let base=parseDate(d),interval=tab==='retornos'?conf.r:conf.i,notes=conf.n,extra='';if(tab==='janelas'){interval=+$('interval').value;notes='Intervalo manual. Confirme se a janela é simétrica e calculada em dias corridos.'}if(tab!=='janelas'&&s==='Personalizado')interval=+$('interval').value;
if(tab==='retornos'&&s==='BENITO'){let c=v.match(/^C(\d+)D(\d+)$/);if(c){let n=+c[1],day=+c[2];if(n===1||n===7){let seq=[1,2,3,8,15],idx=seq.indexOf(day);if(idx>=0&&idx<4)interval=seq[idx+1]-day;else if(idx===4)interval=21-15}if(n>=18&&day===1)interval=null}}
if(tab==='imagens'&&s==='REG 2055'){let f=v.match(/^FUP\s*(\d+)$/);if(f)interval=+f[1]>=4?168:84;else{interval=null;extra='Informe a visita FUP atual para definir a transição de 12 para 24 semanas.'}}
if(tab==='imagens'&&s==='BENITO'){interval=null;extra='Intervalos de imagem específicos do protocolo não cadastrados.'}
if(tab==='retornos'&&s==='Tropion Lung 07'&&/^FUP\s*30D$/.test(v))interval=null;
if(tab==='retornos'&&s==='Paloma2 C4'&&/^C\d+D1$/.test(v))interval=14;
if(tab==='retornos'&&s==='Paloma2 C4'&&/^C\d+D15$/.test(v))interval=14;
if(tab==='retornos'&&s==='V940-001'){let match=v.match(/(\d+)$/);extra=match?`Próxima visita de eficácia: ${+match[1]+24}`:'Verifique a numeração da próxima visita de eficácia.'}
if(tab==='retornos'&&s==='BENITO'&&/^C18D1$/.test(v))extra='Após C18, a data de EOT deve ser confirmada no protocolo.';
if(interval===null||interval===undefined||interval===''||Number.isNaN(+interval)||+interval<0){$('result').innerHTML=`<b>Regra pendente de validação.</b><p>${extra||notes}</p>Selecione “Personalizado” para calcular um intervalo previamente confirmado.`;return}
let target=interval==='year'?addYear(base):addDays(base,+interval),start=addDays(target,-w),end=addDays(target,w);let next=tab==='retornos'?nextVisit(v,s):tab==='imagens'?nextVisit(v,s):'';let info=tab==='janelas'?'':`<div>Próxima identificação: <b>${next}</b></div>`;if(tab==='retornos'&&s==='BENITO'&&/^C18D1$/.test(v))info='';$('result').innerHTML=`<div>Data-alvo</div><strong>${fmt(target)}</strong><div>Janela: <b>${fmt(start)} a ${fmt(end)}</b></div>${info}<p class="muted">${notes} ${extra}</p>`}
function render(){document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$('heading').textContent={retornos:'Próximo retorno',imagens:'Próxima imagem',janelas:'Calculadora de janelas'}[tab];$('studyBlock').classList.toggle('hidden',tab==='janelas');$('visitBlock').classList.toggle('hidden',tab==='janelas');$('manualInterval').classList.toggle('hidden',tab==='janelas'||$('study').value==='Personalizado');$('result').textContent='Preencha os campos e toque em Calcular.'}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render()}));$('study').addEventListener('change',render);$('calc').addEventListener('click',calc);render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
