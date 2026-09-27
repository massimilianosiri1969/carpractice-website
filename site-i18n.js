/* Local, versioned website translations. No visitor data is sent to a translator. */
(() => {
 'use strict';
 const languages={it:'Italiano',en:'English',de:'Deutsch',fr:'Français',es:'Español',pt:'Português',ru:'Русский',zh:'中文',hi:'हिन्दी',ja:'日本語'};
 const locales={it:'it-IT',en:'en-GB',de:'de-DE',fr:'fr-FR',es:'es-ES',pt:'pt-PT',ru:'ru-RU',zh:'zh-CN',hi:'hi-IN',ja:'ja-JP'};
 const version='20260927-1',key='carpractice.site.language',records=new WeakMap(),attrRecords=new WeakMap(),cache={it:{}},missing=new Set();
 const normalize=s=>String(s).replace(/\s+/g,' ').trim();
 let language='it',dictionary={},patterns=[],observer,queued=false,revision=0,picker,status;
 const excluded='script,style,textarea,input:not([type="submit"]),code,pre,[contenteditable],.user-message,[data-cp-preserve],[data-cp-whole],[translate="no"],#languagePreview,#languageLocale,.language-picker button';
 const wholeRecords=new WeakMap();
 const heroTitles={it:['Ogni riparazione inizia con una ','targa.',''],en:['Every repair starts with a ','license plate.',''],de:['Jede Reparatur beginnt mit einem ','Kennzeichen.',''],fr:['Chaque réparation commence par une ','plaque d’immatriculation.',''],es:['Cada reparación empieza con una ','matrícula.',''],pt:['Cada reparação começa com uma ','matrícula.',''],ru:['Каждый ремонт начинается с ','номерного знака.',''],zh:['每次维修，都从','车牌','开始。'],hi:['हर मरम्मत की शुरुआत ','नंबर प्लेट',' से होती है।'],ja:['すべての修理は、','ナンバープレート','から。']};
 const attrs=['alt','title','placeholder','aria-label','aria-description'];
 function translate(source,args=[]){
  const s=normalize(source);let translated=dictionary[s];
  if(translated===undefined){for(const entry of patterns){const m=entry.re.exec(s);if(m){translated=entry.value.replace(/\{(\d+)\}/g,(_,i)=>m[entry.order.indexOf(Number(i))+1]??'');break}}}
  return (translated??s).replace(/\{(\d+)\}/g,(m,i)=>args[i]===undefined?m:String(args[i]));
 }
 function configure(catalog){dictionary=catalog;patterns=[];for(const [source,value] of Object.entries(catalog)){if(!/\{\d+\}/.test(source))continue;const order=[];const parts=source.split(/(\{\d+\})/).map(p=>{if(/^\{\d+\}$/.test(p)){order.push(Number(p.slice(1,-1)));return '(.+?)'}return p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')});patterns.push({re:new RegExp('^'+parts.join('')+'$'),order,value})}}
 function original(map,node,current){const r=map.get(node);return r&&current===r.output?r.source:current}
 function updateText(node){
  if(!node.parentElement||node.parentElement.closest(excluded))return;
  const current=node.nodeValue,source=original(records,node,current),s=normalize(source);if(!s||!/[\p{L}]/u.test(s))return;
  if(node.parentElement.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))node.parentElement.setAttribute('value',source);
  const out=language==='it'?source:source.replace(/\S[\s\S]*\S|\S/,()=>translate(s));
  records.set(node,{source,output:out});if(out!==current)node.nodeValue=out;
  if(language!=='it'&&!Object.hasOwn(dictionary,s)&&!patterns.some(p=>p.re.test(s)))missing.add(s);
 }
 function updateAttributes(el){
  if(el.closest('[data-cp-preserve],[translate="no"],#languagePreview,#languageLocale,.language-picker button'))return;
  let record=attrRecords.get(el);if(!record){record={};attrRecords.set(el,record)}
  const names=[...attrs];if(el.tagName==='META'&&['description','og:title','og:description','twitter:title','twitter:description'].includes(el.getAttribute('name')||el.getAttribute('property')))names.push('content');if(el.tagName==='INPUT'&&['submit','button','reset'].includes(el.type))names.push('value');
  for(const attr of names){if(!el.hasAttribute(attr))continue;const current=el.getAttribute(attr),r=record[attr],source=r&&r.output===current?r.source:current;const output=language==='it'?source:translate(source);record[attr]={source,output};if(output!==current)el.setAttribute(attr,output)}
 }
 function localLinks(){for(const a of document.querySelectorAll('a[href]')){const raw=a.getAttribute('href');if(!raw||raw.startsWith('#')||/^(mailto:|tel:|javascript:)/i.test(raw))continue;let url;try{url=new URL(raw,location.href)}catch{continue}if(url.origin!==location.origin||!(/\.html$/.test(url.pathname)||url.pathname.endsWith('/')))continue;if(language==='it')url.searchParams.delete('lang');else url.searchParams.set('lang',language);const next=url.pathname+url.search+url.hash;if(raw!==next)a.setAttribute('href',next)}}
 function apply(){
  observer?.disconnect();missing.clear();
  for(const el of document.querySelectorAll('[data-cp-whole]')){
   let record=wholeRecords.get(el);if(!record){record={html:el.innerHTML,language:'it'};wholeRecords.set(el,record)}
   if(record.language===language)continue;
   if(language==='it')el.innerHTML=record.html;
   else if(el.hasAttribute('data-cp-hero-title')){const parts=heroTitles[language],accent=document.createElement('span');accent.className='hero-accent';accent.textContent=parts[1];el.replaceChildren(document.createTextNode(parts[0]),accent,document.createTextNode(parts[2]))}
   else el.textContent=translate(el.dataset.cpWhole);
   record.language=language;
  }
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))updateText(node);
  document.querySelectorAll('*').forEach(updateAttributes);localLinks();
  if(picker){picker.value=language;picker.setAttribute('aria-label',translate('Scegli la lingua del sito'));picker.previousElementSibling.textContent=translate('Lingua')}
  observer?.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attrs,'content','value']});
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})}
 function readStored(){try{return localStorage.getItem(key)}catch{return null}}
 async function setLanguage(code,save=true){
  if(!Object.hasOwn(languages,code))return false;
  const ticket=++revision;if(picker)picker.disabled=true;
  try{
   if(!cache[code]){const response=await fetch('/locales/'+code+'.json?v='+version,{credentials:'same-origin'});if(!response.ok)throw Error('catalog');cache[code]=await response.json()}
   if(ticket!==revision)return false;
   language=code;configure(cache[code]);document.documentElement.lang=code==='zh'?'zh-CN':code;document.documentElement.dataset.siteLanguage=code;
   if(save){try{localStorage.setItem(key,code)}catch{}}
   const url=new URL(location.href);if(code==='it')url.searchParams.delete('lang');else url.searchParams.set('lang',code);history.replaceState(history.state,'',url.pathname+url.search+url.hash);
   apply();document.querySelectorAll('input,select,textarea').forEach(el=>{if(el.setCustomValidity)el.setCustomValidity('')});
   if(status)status.textContent='';document.dispatchEvent(new CustomEvent('cp:languagechange',{detail:{language:code}}));return true;
  }catch{if(status)status.textContent=translate('Impossibile caricare la lingua. Riprova.');if(picker)picker.value=language;return false}
  finally{if(ticket===revision&&picker)picker.disabled=false}
 }
 window.CPi18n={t:translate,setLanguage,get language(){return language},get locale(){return locales[language]},get missing(){return [...missing]},source(node){return records.get(node)?.source??node.textContent},error(message){return Object.hasOwn(dictionary,normalize(message))?normalize(message):'Invio non riuscito. Riprova tra poco.'}};
 for(const method of ['alert','confirm','prompt']){const native=window[method].bind(window);window[method]=(message,...args)=>native(translate(message),...args)}
 function start(){
  const bar=document.createElement('div');bar.className='cp-language-bar';bar.setAttribute('data-cp-preserve','');
  const label=document.createElement('label');label.htmlFor='cpSiteLanguage';label.textContent='Lingua';
  picker=document.createElement('select');picker.id='cpSiteLanguage';picker.setAttribute('aria-label','Scegli la lingua del sito');
  for(const [value,name]of Object.entries(languages)){const option=document.createElement('option');option.value=value;option.textContent=name;option.lang=value;picker.append(option)}
  status=document.createElement('span');status.setAttribute('role','status');status.className='cp-language-status';bar.append(label,picker,status);document.body.prepend(bar);
  picker.addEventListener('change',()=>setLanguage(picker.value));
  observer=new MutationObserver(schedule);apply();
  document.addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('')},true);
  document.addEventListener('invalid',event=>{const el=event.target,v=el.validity;if(!v||!el.setCustomValidity)return;let msg='Inserisci un valore valido.';if(v.valueMissing)msg=el.type==='checkbox'?'Seleziona questa casella per continuare.':'Compila questo campo.';else if(v.typeMismatch&&el.type==='email')msg='Inserisci un indirizzo email valido.';else if(v.patternMismatch)msg='Rispetta il formato richiesto.';else if(v.tooShort)msg='Il testo inserito è troppo breve.';else if(v.tooLong)msg='Il testo inserito è troppo lungo.';el.setCustomValidity(translate(msg))},true);
  window.addEventListener('storage',event=>{if(event.key===key&&languages[event.newValue])setLanguage(event.newValue,false)});
  const requested=new URLSearchParams(location.search).get('lang')||readStored()||'it';window.CPi18n.ready=setLanguage(languages[requested]?requested:'it',false);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
