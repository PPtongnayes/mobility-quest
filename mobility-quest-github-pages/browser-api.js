(function(){
 const base=new URL('./',document.currentScript.src),key='mobility-studio-web:'+base.pathname;
 const clone=v=>JSON.parse(JSON.stringify(v));let server,library,selectedCourse;
 function read(){try{return JSON.parse(localStorage.getItem(key)||'null')||{};}catch{return {};}}
 function write(next){try{localStorage.setItem(key,JSON.stringify(next));library=next;}catch{throw Error('浏览器存储空间不足或被禁用。请先导出草稿，清理本网站存储或启用本机存储后重试。');}}
 const ready=(async()=>{const response=await fetch(new URL('content.json',base),{cache:'no-store'});if(!response.ok)throw Error('无法读取课程 content.json，请确认它已上传到网页根目录。');server=await response.json();CourseValidation.validateCourse(server);library=read();const fingerprint=JSON.stringify(server);if(library.serverRevision!==fingerprint){library.active=null;library.serverRevision=fingerprint;write(library);}selectedCourse=new URLSearchParams(location.search).has('preview-draft')?(library.preview||server):new URLSearchParams(location.search).has('local-preview')?(library.active||server):server;CourseValidation.validateCourse(selectedCourse);})();
 const active=()=>library.active||server,revision=()=>JSON.stringify(active());
 function state(){return clone({active:active(),revision:revision(),draft:library.draft||null,history:(library.history||[]).map(h=>({id:h.id,created:h.created,version:h.course.version,label:h.label}))});}
 function check(data){try{CourseValidation.validateCourse(data);return {ok:true};}catch(error){return {ok:false,error:error.message.replace('课程 JSON 格式有误 / Invalid course JSON:','请补全对应章节或题目的中英文内容后重试：')};}}
 function saveImmediate(data,baseRevision){write({...read(),draft:{data:clone(data),baseRevision,savedAt:new Date().toISOString()}});return {savedAt:library.draft.savedAt};}
 function commit(data,baseRevision,reset,label){const tested=check(data);if(!tested.ok)throw Error(tested.error);library=read();if(baseRevision!==revision())throw Error('本机内容已被其他标签页修改。请先导出草稿，再重新打开内容管理。');const next=clone(data),current=active();if(reset)next.progressRevision=crypto.randomUUID();else if(current.progressRevision)next.progressRevision=current.progressRevision;else delete next.progressRevision;const backup={id:crypto.randomUUID(),created:new Date().toISOString(),label,course:clone(current)};write({...library,active:next,draft:null,history:[backup,...(library.history||[])].slice(0,12)});return state();}
 function open(url){const win=window.open(url,'mobility-course-preview');if(!win)throw Error('浏览器阻止了预览窗口。请允许本网站弹出窗口后重试。');}
 window.mobility={
  ready,isLocalPreview:new URLSearchParams(location.search).has('local-preview')||new URLSearchParams(location.search).has('preview-draft'),
  progressPrefix:'mq-web:'+base.pathname+(new URLSearchParams(location.search).has('local-preview')||new URLSearchParams(location.search).has('preview-draft')?':preview':':live'),
  getCourse:()=>selectedCourse,
  openEditor:()=>{location.href=new URL('admin.html',base).href;},
  editorState:async()=>{await ready;library=read();return state();},
  saveDraftImmediate:(data,rev)=>{try{return saveImmediate(data,rev);}catch(error){if(typeof window.showError==='function')window.showError(error);return {ok:false};}},
  saveDraft:async(data,rev)=>{await ready;return saveImmediate(data,rev);},
  checkCourse:async data=>{await ready;return check(data);},
  discardDraft:async()=>{await ready;write({...read(),draft:null});return state();},
  publishCourse:async(data,rev,reset)=>{await ready;return commit(data,rev,reset,'应用到本机预览');},
  restoreCourse:async(id,rev,reset)=>{await ready;library=read();const backup=(library.history||[]).find(h=>h.id===id);if(!backup)throw Error('找不到该本机备份。');return commit(backup.course,rev,reset,'恢复本机历史版本');},
  previewCourse:async payload=>{await ready;const tested=check(payload.data);if(!tested.ok)throw Error(tested.error);write({...read(),preview:clone(payload.data)});const url=new URL('index.html?preview-draft=1',base);url.searchParams.set('view',payload.tab==='questions'?'question':'lesson');url.searchParams.set('selected',payload.selected);url.searchParams.set('mission',payload.mission);open(url);return true;},
  exportCourse:async data=>{await ready;const tested=check(data);if(!tested.ok)throw Error(tested.error);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return {canceled:false};},
  importCourse:async()=>{await ready;return new Promise((resolve,reject)=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('cancel',()=>resolve({canceled:true}),{once:true});input.addEventListener('change',async()=>{try{if(!input.files[0])return resolve({canceled:true});const data=JSON.parse((await input.files[0].text()).replace(/^\uFEFF/,''));const result=check(data);if(!result.ok)throw Error(result.error);resolve({canceled:false,data});}catch(error){reject(error);}},{once:true});input.click();});},
  onEditorClose:()=>{},editorCloseReady:()=>{}
 };
})();
