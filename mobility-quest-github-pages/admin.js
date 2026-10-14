let state,draft,tab='lessons',selected=0,mission=0,dirty=false,timer,saving=Promise.resolve(),editGeneration=0;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
function valueAt(path){return path.split('.').reduce((v,k)=>v[k],draft);}
function setAt(path,value){const keys=path.split('.'),last=keys.pop();const obj=keys.reduce((v,k)=>v[k],draft);obj[last]=value;}
function field(label,path,long=false){return `<label>${esc(label)}<${long?'textarea':'input type="text"'} data-path="${path}" ${long?'':'value="'+esc(valueAt(path))+'"'}>${long?esc(valueAt(path)):''}${long?'</textarea>':''}</label>`;}
function pair(label,path,long=false){return `<div class="pair ${long?'long':''}">${field(label+' · 中文',path+'.0',long)}${field(label+' · English',path+'.1',long)}</div>`;}
function sourceChoices(path){const chosen=valueAt(path);return `<fieldset class="panel"><legend>官方依据（至少选择一个）</legend>${draft.sources.map((s,i)=>`<label class="check-source"><input type="checkbox" data-sources="${path}" value="${i}" ${chosen.includes(i)?'checked':''}><span>${esc(s[0]||'未命名来源')}<br><span class="muted">${esc(s[1])}</span></span></label>`).join('')}</fieldset>`;}
function status(text){$('status').textContent=text;}
function showError(error){let box=$('error');if(!box){box=document.createElement('div');box.id='error';box.className='error';$('form').prepend(box);}box.textContent=error.message||String(error);box.scrollIntoView({block:'nearest'});status('暂未应用更新，请检查提示。');}
function changed(){editGeneration++;dirty=true;window.mobility.saveDraftImmediate(draft,state.revision);status('有待保存的草稿…');clearTimeout(timer);timer=setTimeout(()=>save().catch(showError),600);}
async function save(){clearTimeout(timer);const data=clone(draft),revision=state.revision,generation=editGeneration;const job=saving.catch(()=>{}).then(()=>window.mobility.saveDraft(data,revision));saving=job;const result=await job;dirty=editGeneration!==generation;status(dirty?'有待保存的草稿…':'草稿已保存 · '+new Date(result.savedAt).toLocaleTimeString('zh-CN'));return result;}
function renderList(){
 if(tab==='lessons')$('list').innerHTML=`<h3>知识章节 · ${draft.lessons.length}</h3>${draft.lessons.map((l,i)=>`<button data-select="${i}" class="${i===selected?'selected':''}">${i+1}. ${esc(l.title[0]||'未命名章节')}</button>`).join('')}<button data-action="add-lesson">＋ 新增章节</button>`;
 else if(tab==='questions')$('list').innerHTML=`<h3>三关题库</h3>${draft.levels.map((l,i)=>`<button data-mission="${i}" class="${i===mission?'selected':''}">第 ${i+1} 关 · ${esc(l.name[0])}</button>`).join('')}<h3>本关题目</h3>${draft.levels[mission].questions.map((q,i)=>`<button data-select="${i}" class="${i===selected?'selected':''}">第 ${i+1} 题 · ${esc(q.prompt[0].slice(0,30)||'未填写题干')}</button>`).join('')}`;
 else if(tab==='sources')$('list').innerHTML=`<h3>官方来源 · ${draft.sources.length}</h3>${draft.sources.map((s,i)=>`<button data-select="${i}" class="${i===selected?'selected':''}">${i+1}. ${esc(s[0]||'未命名来源')}</button>`).join('')}<button data-action="add-source">＋ 新增来源</button>`;
 else $('list').innerHTML=`<div class="notice">草稿保存不会改变学习版。发布和恢复前均会备份正式内容。</div>`;
}
function paragraph(s,i,p){return `<div class="panel"><h3>第 ${i+1} 段 · ${s.rows?'表格':'正文'}</h3><div class="section-tools"><button data-action="section-up" data-index="${i}" ${i===0?'disabled':''}>↑ 上移</button><button data-action="section-down" data-index="${i}" ${i===draft.lessons[selected].sections.length-1?'disabled':''}>↓ 下移</button><button class="danger" data-action="remove-section" data-index="${i}">删除本段</button></div>${pair('段落标题',p+'.title')}${s.rows?tableFields(s,i,p):pair('段落正文',p+'.text',true)}</div>`;}
function tableFields(s,index,p){return `<div class="notice">直接在表格字段中填写中英文。可增删行列，程序自动保持行列一致。</div><h3>列标题</h3>${s.headers.map((h,c)=>`<div class="table-cell">${pair('第 '+(c+1)+' 列标题',p+'.headers.'+c)}<button data-action="remove-column" data-index="${index}" data-column="${c}" ${s.headers.length===1?'disabled':''}>删除此列</button></div>`).join('')}<button data-action="add-column" data-index="${index}">＋ 添加列</button>${s.rows.map((r,row)=>`<div class="table-row"><h3>第 ${row+1} 行</h3>${r.map((cell,c)=>pair('第 '+(c+1)+' 列',p+'.rows.'+row+'.'+c,true)).join('')}<button data-action="remove-row" data-index="${index}" data-row="${row}" ${s.rows.length===1?'disabled':''}>删除此行</button></div>`).join('')}<div class="actions"><button data-action="add-row" data-index="${index}">＋ 添加行</button></div>`;}
function render(){
 renderList();document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 $('form').innerHTML='';
 if(tab==='lessons'){
  selected=Math.min(selected,draft.lessons.length-1);const l=draft.lessons[selected],p='lessons.'+selected;
  $('form').innerHTML=`<div class="panel"><h2>编辑知识章节</h2><div class="section-tools"><button data-action="lesson-up" ${selected===0?'disabled':''}>↑ 章节上移</button><button data-action="lesson-down" ${selected===draft.lessons.length-1?'disabled':''}>↓ 章节下移</button><button class="danger" data-action="remove-lesson">删除章节</button></div>${pair('章节标题',p+'.title')}${pair('章节简介',p+'.intro',true)}</div>${l.sections.map((s,i)=>paragraph(s,i,p+'.sections.'+i)).join('')}<div class="actions"><button data-action="add-section">＋ 添加正文段落</button><button data-action="add-table">＋ 添加表格</button></div><div class="panel">${pair('重点总结',p+'.reminder',true)}</div>${sourceChoices(p+'.sources')}`;
 }else if(tab==='questions'){
  const q=draft.levels[mission].questions[selected],p=`levels.${mission}.questions.${selected}`;
  $('form').innerHTML=`<div class="panel"><h2>第 ${mission+1} 关 · 第 ${selected+1} 题</h2><p class="muted">选项顺序由游戏随机排列。请在这里选择正确答案，并分别填写四个选项的解析。</p>${pair('关卡名称',`levels.${mission}.name`)}${pair('关卡简介',`levels.${mission}.desc`)}${pair('题干',p+'.prompt',true)}<label>对应复习章节<select data-path="${p}.lesson" data-number="yes">${draft.lessons.map((l,i)=>`<option value="${i}" ${q.lesson===i?'selected':''}>${esc(l.title[0]||'未命名章节')}</option>`).join('')}</select></label></div><div class="panel"><h2>四个选项与解析</h2>${q.options.map((o,i)=>`<div class="option-panel"><label class="correct-choice"><input type="radio" name="correct" value="${i}" data-answer="${p}.answer" ${q.answer===i?'checked':''}>设选项 ${i+1} 为正确答案</label>${pair('选项 '+(i+1),p+'.options.'+i,true)}${pair('该选项的解析',p+'.rationales.'+i,true)}</div>`).join('')}</div>${sourceChoices(p+'.sources')}`;
 }else if(tab==='sources'){
  $('form').innerHTML=`<div class="panel"><h2>编辑官方来源</h2><p class="muted">修改显示名称和链接。被章节或题目引用的来源不能直接删除。</p>${field('来源显示名称',`sources.${selected}.0`)}<br>${field('官方 HTTPS 链接',`sources.${selected}.1`)}<div class="actions"><button data-action="remove-source" class="danger">删除来源</button></div></div>`;
 }else if(tab==='history'){
  $('form').innerHTML=`<div class="panel"><h2>备份与恢复</h2><p>每次发布或恢复之前，都会保存当前正式版本。恢复操作也会备份现有内容。</p><button data-action="discard" class="danger">放弃草稿，重新读取正式内容</button>${state.history.length?state.history.map(h=>`<div class="version-item"><strong>${esc(h.version)}</strong><p class="muted">${esc(new Date(h.created).toLocaleString('zh-CN'))} · ${esc(h.label)}</p><button data-action="restore" data-id="${h.id}">恢复此版本</button></div>`).join(''):'<p class="empty">还没有历史版本。首次发布后会出现自动备份。</p>'}</div>`;
 }else{
  $('form').innerHTML=`<div class="panel"><h2>版本与内容分发</h2>${field('内容版本名称','version')}<p class="muted">可填写“2026-10 培训版”等便于识别的名称。</p><div class="notice">草稿与历史备份保存在 当前浏览器的本机资源库。正式内容由 APP 自动保存，不需要手工编辑文件。</div><div class="actions"><button data-action="export">导出网站 content.json</button><button data-action="import">导入内容包到草稿</button></div><p class="muted">导出后的 content.json 上传到 GitHub 仓库并替换同名文件，等待 Pages 更新。导入和本机预览不会修改服务器文件。</p></div>`;
 }
}
function ask(title,text,reset=false){return new Promise(resolve=>{$('confirm-title').textContent=title;$('confirm-text').textContent=text;$('reset-label').hidden=!reset;$('reset').checked=false;$('confirm-note').textContent=reset?'本机预览内容将更新，正式网站不会改变。未完成的一次闯关不会保留；已保存成绩默认沿用。':'';const d=$('confirm');d.returnValue='cancel';d.addEventListener('close',()=>resolve({ok:d.returnValue==='ok',reset:$('reset').checked}),{once:true});d.showModal();});}
document.addEventListener('input',event=>{const e=event.target;if(e.dataset.path){setAt(e.dataset.path,e.dataset.number?Number(e.value):e.value);changed();if(e.dataset.path.includes('.title.0')||e.dataset.path.endsWith('.prompt.0')||tab==='sources')renderList();}});
document.addEventListener('change',event=>{const e=event.target;if(e.dataset.answer){setAt(e.dataset.answer,Number(e.value));changed();}if(e.dataset.sources){const selectedSources=valueAt(e.dataset.sources);const n=Number(e.value);setAt(e.dataset.sources,e.checked?[...new Set([...selectedSources,n])]:selectedSources.filter(i=>i!==n));changed();}});
document.addEventListener('click',async event=>{const b=event.target.closest('button');if(!b)return;try{
 if(b.dataset.tab){tab=b.dataset.tab;selected=0;render();return;}if(b.dataset.select!==undefined){selected=Number(b.dataset.select);render();return;}if(b.dataset.mission!==undefined){mission=Number(b.dataset.mission);selected=0;render();return;}
 const action=b.dataset.action,index=Number(b.dataset.index);if(!action)return;
 if(action==='save'){await save();return;}
 if(action==='check'){await save();const result=await window.mobility.checkCourse(draft);if(!result.ok)throw Error(result.error);status('检查通过：可以预览或发布。');return;}
 if(action==='preview'){await save();await window.mobility.previewCourse({data:draft,tab,selected,mission});status('预览窗口已打开，学习版未改变。');return;}
 if(action==='publish'){await save();const checked=await window.mobility.checkCourse(draft);if(!checked.ok)throw Error(checked.error);const choice=await ask('应用到本机预览？','仅在此浏览器应用和备份。其他访客不会看到变化。正式更新仍须导出并上传 content.json。',true);if(choice.ok){state=await window.mobility.publishCourse(draft,state.revision,choice.reset);draft=clone(state.active);dirty=false;render();status('已应用到本机预览；线上网站未改变。请导出并上传 content.json 完成正式更新。');}return;}
 if(action==='restore'){await save();const choice=await ask('恢复历史版本？','当前本机预览内容会先备份，随后使用选中的历史版本。未发布草稿也会替换。',true);if(choice.ok){state=await window.mobility.restoreCourse(b.dataset.id,state.revision,choice.reset);draft=clone(state.active);selected=0;render();status('历史版本已恢复，恢复前的内容也已备份。');}return;}
 if(action==='discard'){const choice=await ask('放弃草稿？','尚未发布的修改将被放弃。线上学习内容不会改变。');if(choice.ok){clearTimeout(timer);await saving.catch(()=>{});state=await window.mobility.discardDraft();draft=clone(state.active);selected=0;dirty=false;render();status('已重新读取正式内容。');}return;}
 if(action==='export'){const result=await window.mobility.exportCourse(draft);if(!result.canceled)status('内容包已导出。');return;}
 if(action==='import'){await save();const imported=await window.mobility.importCourse();if(!imported.canceled){draft=clone(imported.data);selected=0;await save();render();status('内容已导入草稿。检查并发布后才会应用到学习版。');}return;}
 if(action==='add-lesson'){draft.lessons.push({title:['新章节','New chapter'],intro:['',''],sections:[{title:['',''],text:['','']}],reminder:['',''],sources:[0]});selected=draft.lessons.length-1;}
 else if(action==='lesson-up'||action==='lesson-down')selected=EditorModel.moveLesson(draft,selected,action==='lesson-up'?-1:1);
 else if(action==='remove-lesson'){const choice=await ask('删除章节？','请确认本章无需保留；已经发布的版本会在下一次发布时自动备份。');if(!choice.ok)return;EditorModel.removeLesson(draft,selected);selected=Math.min(selected,draft.lessons.length-1);}
 else if(action==='add-section')draft.lessons[selected].sections.push({title:['',''],text:['','']});
 else if(action==='add-table')draft.lessons[selected].sections.push({title:['',''],headers:[['',''],['','']],rows:[[['',''],['','']]]});
 else if(action==='remove-section'){const sections=draft.lessons[selected].sections;if(sections.length===1)throw Error('每个章节至少保留一个段落。');if(!(await ask('删除段落？','该段的正文或表格将从草稿中移除。')).ok)return;sections.splice(index,1);}
 else if(action==='section-up'||action==='section-down'){const sections=draft.lessons[selected].sections,target=index+(action==='section-up'?-1:1);[sections[index],sections[target]]=[sections[target],sections[index]];}
 else if(action==='add-row'){const s=draft.lessons[selected].sections[index];s.rows.push(s.headers.map(()=>['','']));}
 else if(action==='remove-row')draft.lessons[selected].sections[index].rows.splice(Number(b.dataset.row),1);
 else if(action==='add-column'){const s=draft.lessons[selected].sections[index];s.headers.push(['','']);s.rows.forEach(r=>r.push(['','']));}
 else if(action==='remove-column'){const s=draft.lessons[selected].sections[index],c=Number(b.dataset.column);s.headers.splice(c,1);s.rows.forEach(r=>r.splice(c,1));}
 else if(action==='add-source'){draft.sources.push(['','']);selected=draft.sources.length-1;}
 else if(action==='remove-source'){if(draft.sources.length===1)throw Error('至少保留一个官方来源。');EditorModel.removeSource(draft,selected);selected=Math.min(selected,draft.sources.length-1);}
 changed();render();
 }catch(error){showError(error);}});
window.mobility.onEditorClose(async()=>{try{if(dirty)await save();else await saving;window.mobility.editorCloseReady();}catch(error){showError(error);}});
(async()=>{try{state=await window.mobility.editorState();draft=clone(state.draft?.data||state.active);render();status(state.draft?'已恢复上次保存的草稿，尚未应用到学习版。':'正在编辑本机草稿；正式网站内容不受这里的修改影响。');if(state.draft&&state.draft.baseRevision!==state.revision){status('草稿基于较早版本，请先导出保留，再放弃草稿以重新读取正式内容。');state.revision=state.draft.baseRevision;}}catch(error){showError(error);}})();
