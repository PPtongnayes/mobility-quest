
function validateCourse(data){
 const errors=[];const ok=(test,where)=>{if(!test)errors.push(where);};
 const bilingual=value=>Array.isArray(value)&&value.length===2&&value.every(text=>typeof text==='string'&&text.trim());
 ok(data&&typeof data==='object','根对象 / root object');if(!data||typeof data!=='object')throw Error(errors.join('\n'));
 ok(typeof data.version==='string'&&data.version.trim(),'version');
 ok(Array.isArray(data.sources)&&data.sources.length>0,'sources');
 if(Array.isArray(data.sources))data.sources.forEach((item,i)=>{let valid=false;try{valid=Array.isArray(item)&&typeof item[0]==='string'&&new URL(item[1]).protocol==='https:';}catch{}ok(valid,`sources[${i}]`);});
 const sources=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(i=>Number.isInteger(i)&&data.sources?.[i]);
 ok(Array.isArray(data.lessons)&&data.lessons.length>0,'lessons');
 if(Array.isArray(data.lessons))data.lessons.forEach((lesson,i)=>{const where=`lessons[${i}]`;ok(bilingual(lesson.title),where+'.title');ok(bilingual(lesson.intro),where+'.intro');ok(bilingual(lesson.reminder),where+'.reminder');ok(sources(lesson.sources),where+'.sources');ok(Array.isArray(lesson.sections)&&lesson.sections.length>0,where+'.sections');if(Array.isArray(lesson.sections))lesson.sections.forEach((section,j)=>{const label=where+`.sections[${j}]`;ok(bilingual(section.title),label+'.title');if(section.rows){ok(Array.isArray(section.headers)&&section.headers.every(bilingual),label+'.headers');ok(Array.isArray(section.rows)&&section.rows.every(row=>Array.isArray(row)&&row.length===section.headers?.length&&row.every(bilingual)),label+'.rows');}else ok(bilingual(section.text),label+'.text');});});
 ok(Array.isArray(data.levels)&&data.levels.length===3,'levels：必须为 3 关 / exactly 3 missions');
 const ids=new Set();if(Array.isArray(data.levels))data.levels.forEach((level,i)=>{const where=`levels[${i}]`;ok(bilingual(level.name),where+'.name');ok(bilingual(level.desc),where+'.desc');ok(Array.isArray(level.questions)&&level.questions.length===5,where+'.questions：每关必须为 5 题 / 5 questions');if(Array.isArray(level.questions))level.questions.forEach((q,j)=>{const label=where+`.questions[${j}]`;ok(typeof q.id==='string'&&q.id.trim()&&!ids.has(q.id),label+'.id：不得重复 / unique');ids.add(q.id);ok(bilingual(q.prompt),label+'.prompt');ok(Array.isArray(q.options)&&q.options.length===4&&q.options.every(bilingual),label+'.options：4 个双语选项 / 4 bilingual options');ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,label+'.answer：0–3');ok(Array.isArray(q.rationales)&&q.rationales.length===4&&q.rationales.every(bilingual),label+'.rationales：4 个双语解析 / 4 rationales');ok(Number.isInteger(q.lesson)&&!!data.lessons?.[q.lesson],label+'.lesson');ok(sources(q.sources),label+'.sources');});});
 if(errors.length)throw Error('课程 JSON 格式有误 / Invalid course JSON:\n'+errors.slice(0,15).join('\n'));return data;
}
function loadCourse(file){return validateCourse(JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')));}
window.CourseValidation={validateCourse};
