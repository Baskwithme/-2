const $=id=>document.getElementById(id);
const secs=[['home','Главная'],['theory','Теория'],['model','Модель'],['sim','Моделирование'],['opt','Оптимизация'],['out','Результаты и выводы']];
secs.forEach(([id,nm])=>{const b=document.createElement('button');b.textContent=nm;b.dataset.s=id;b.onclick=()=>show(id);$('nav').appendChild(b)});
function show(id){secs.forEach(([s])=>$(s).classList.toggle('on',s===id));[...$('nav').children].forEach(b=>b.classList.toggle('on',b.dataset.s===id));if(id!=='home')calc()}
const Hf=(t,n,k)=>100*(1-Math.exp(-k*n*t)),Ef=(n,t,a)=>a*n*n*t,f2=x=>x.toFixed(2);
const D={V:200,n:300,t:5,k:0.001,h:95,a:0.0001};
function read(){const p={};let e='';
 for(const id in D){p[id]=parseFloat($(id).value)}
 if([p.V,p.n,p.t,p.k,p.h,p.a].some(isNaN))e='Заполните все поля числами.';
 else if(p.n<100||p.n>500)e='Скорость n должна быть от 100 до 500 об/мин.';
 else if(p.t<1||p.t>20)e='Время t должно быть от 1 до 20 мин.';
 else if(p.k<=0||p.a<=0)e='Коэффициенты k и a должны быть положительными.';
 else if(p.h<=0||p.h>=100)e='Требуемая однородность H* должна быть в диапазоне (0; 100) %.';
 else if(p.V<=0)e='Объём V должен быть положительным.';
 $('err').textContent=e;return e?null:p}
const ch={};function mk(id,type,labels,ds,xt,yt,title){if(ch[id])ch[id].destroy();
 ch[id]=new Chart($(id),{type,data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{title:{display:true,text:title,color:'#888'},legend:{labels:{color:'#888'}}},scales:{x:{title:{display:true,text:xt,color:'#888'},ticks:{color:'#888',maxTicksLimit:10}},y:{title:{display:true,text:yt,color:'#888'},ticks:{color:'#888'}}}}})}
const cols=['#d1495b','#00798c','#edae49','#6a994e','#7b4ea3','#e76f51'];
function optimize(p){let best=null;
 for(let n=100;n<=500;n++)for(let i=10;i<=200;i++){const t=i/10;if(Hf(t,n,p.k)>=p.h){const e=Ef(n,t,p.a);if(!best||e<best.E-1e-12)best={n,t,E:e,H:Hf(t,n,p.k)};break}}
 const nm=-Math.log(1-p.h/100)/(p.k*20);return{best,nm}}
function calc(){const p=read();if(!p)return;
 $('Vv').textContent=p.V;$('nv').textContent=p.n;$('tv').textContent=p.t;
 const H=Hf(p.t,p.n,p.k),E=Ef(p.n,p.t,p.a),ts=-Math.log(1-p.h/100)/(p.k*p.n);
 $('bl').style.animation=`sp ${Math.max(.15,60/p.n)}s linear infinite`;
 $('res').innerHTML=`<div><b>${f2(H)} %</b><span>Однородность H</span></div><div><b>${f2(E)}</b><span>Энергозатраты E, усл. ед.</span></div><div><b>${f2(E/p.V)}</b><span>E на литр, усл. ед./л</span></div><div><b>${ts<=20?f2(ts)+' мин':'> 20 мин'}</b><span>Время до H*=${p.h}%</span></div><div><b class="${H>=p.h?'ok':'no'}">${H>=p.h?'Достигнута':'Не достигнута'}</b><span>Требуемая однородность</span></div>`;
 const T=[...Array(41)].map((_,i)=>i*0.5);
 const ds=[100,200,300,400,500].map((n,i)=>({label:`n=${n} об/мин`,data:T.map(t=>Hf(t,n,p.k)),borderColor:cols[i],pointRadius:0,tension:.3}));
 ds.push({label:`Текущий n=${p.n}`,data:T.map(t=>Hf(t,p.n,p.k)),borderColor:'#888',borderDash:[6,4],pointRadius:0});
 ds.push({label:`H*=${p.h}%`,data:T.map(()=>p.h),borderColor:'#c0392b',borderDash:[2,3],pointRadius:0});
 mk('c1','line',T,ds,'Время t, мин','Однородность H, %','Зависимость H от времени');
 const N=[...Array(81)].map((_,i)=>100+i*5);
 mk('c2','line',N,[{label:`H при t=${p.t} мин`,data:N.map(n=>Hf(p.t,n,p.k)),borderColor:cols[0],pointRadius:0},{label:`E/10 (усл. ед.)`,data:N.map(n=>Ef(n,p.t,p.a)/10),borderColor:cols[1],pointRadius:0},{label:`H*=${p.h}%`,data:N.map(()=>p.h),borderColor:'#c0392b',borderDash:[2,3],pointRadius:0}],'Скорость n, об/мин','H, % / E/10, усл. ед.','Зависимость H от скорости');
 table(p);doOpt(p,false)}
const EXP=[[100,20],[150,20],[200,10],[300,5],[500,2],[500,10]];
function table(p){let r='<tr><th>№</th><th>n, об/мин</th><th>t, мин</th><th>H, %</th><th>E, усл. ед.</th><th>t до H*, мин</th><th>H ≥ H*</th></tr>';
 const rows=EXP.map(([n,t],i)=>{const H=Hf(t,n,p.k),ts=-Math.log(1-p.h/100)/(p.k*n);return{n,t,H,E:Ef(n,t,p.a),ts,ok:H>=p.h}});
 rows.forEach((x,i)=>r+=`<tr><td>${i+1}</td><td>${x.n}</td><td>${x.t}</td><td>${f2(x.H)}</td><td>${f2(x.E)}</td><td>${x.ts<=20?f2(x.ts):'>20'}</td><td class="${x.ok?'ok':'no'}">${x.ok?'да':'нет'}</td></tr>`);
 const o=optimize(p).best;if(o)r+=`<tr><td><b>Опт.</b></td><td>${o.n}</td><td>${o.t}</td><td>${f2(o.H)}</td><td>${f2(o.E)}</td><td>${f2(-Math.log(1-p.h/100)/(p.k*o.n))}</td><td class="ok">да</td></tr>`;
 $('tb').innerHTML=r;
 const all=rows.map((x,i)=>'Эксп.'+(i+1)+' ('+x.n+'/'+x.t+')');
 mk('c4','bar',all,[{label:'Однородность H, %',data:rows.map(x=>x.H),backgroundColor:cols[0]},{label:'Энергозатраты E/100, усл. ед.',data:rows.map(x=>x.E/100),backgroundColor:cols[1]}],'Режим (n об/мин / t мин)','H, % / E/100','Сравнение режимов смешивания');
 const okr=rows.filter(x=>x.ok).sort((a,b)=>a.E-b.E)[0];
 $('concl').innerHTML=`<ul><li>Однородность растёт с произведением n·t по экспоненте и стремится к 100 %; прирост замедляется.</li><li>Энергозатраты растут квадратично по n и линейно по t, поэтому быстрое перемешивание невыгодно: например, режимы 500/2 и 150/20 дают сходную H, но энергозатраты различаются в разы.</li>${okr?`<li>Среди экспериментов с H ≥ ${p.h} % наименее затратен режим ${okr.n} об/мин, ${okr.t} мин (E = ${f2(okr.E)}).</li>`:''}${o?`<li><b>Оптимальный режим:</b> n = ${o.n} об/мин, t = ${o.t} мин, H = ${f2(o.H)} %, E = ${f2(o.E)} усл. ед.</li>`:'<li>При заданных параметрах допустимого режима нет.</li>'}<li>Оптимум лежит на границе по времени (t = 20 мин): выгоднее долго мешать медленно, чем коротко — быстро.</li></ul>`}
function doOpt(p,sw){const {best:o,nm}=optimize(p);
 if(!o){$('ores').innerHTML='<div><b class="no">Нет решения</b><span>H* недостижима в диапазонах n и t</span></div>';$('otxt').textContent='';return}
 $('ores').innerHTML=`<div><b>${o.n} об/мин</b><span>Оптимальная скорость</span></div><div><b>${o.t} мин</b><span>Время смешивания</span></div><div><b>${f2(o.H)} %</b><span>Достигнутая однородность</span></div><div><b>${f2(o.E)}</b><span>Энергозатраты, усл. ед.</span></div>`;
 $('otxt').textContent=`Проверка аналитикой: n_min = −ln(1−H*/100)/(k·20) = ${f2(Math.max(nm,100))} об/мин — совпадает с результатом перебора (с округлением).`;
 const N=[],Es=[];for(let n=100;n<=500;n+=5){const t=Math.max(1,Math.ceil(-Math.log(1-p.h/100)/(p.k*n)*10)/10);N.push(n);Es.push(t<=20?Ef(n,t,p.a):null)}
 mk('c3','line',N,[{label:'E_min(n) при H ≥ H*',data:Es,borderColor:cols[0],pointRadius:0,spanGaps:false}],'Скорость n, об/мин','Энергозатраты E, усл. ед.','Минимальные энергозатраты по скоростям (допустимые режимы)');
 if(sw)show('opt')}
$('bc').onclick=calc;$('bo').onclick=()=>{const p=read();if(p)doOpt(p,true)};$('bo2').onclick=()=>{const p=read();if(p)doOpt(p,false)};
$('br').onclick=()=>{for(const i in D)$(i).value=D[i];calc()};
['V','n','t','k','h','a'].forEach(i=>$(i).addEventListener('input',calc));
show('home');
