(function(root){
 const allQuestions=d=>d.levels.flatMap(l=>l.questions);
 function moveLesson(d,index,direction){const target=index+direction;if(target<0||target>=d.lessons.length)return index;[d.lessons[index],d.lessons[target]]=[d.lessons[target],d.lessons[index]];allQuestions(d).forEach(q=>{if(q.lesson===index)q.lesson=target;else if(q.lesson===target)q.lesson=index;});return target;}
 function removeLesson(d,index){if(d.lessons.length===1)throw Error('至少保留一个章节。');const used=allQuestions(d).filter(q=>q.lesson===index);if(used.length)throw Error(`还有 ${used.length} 道题引用本章。请先在题库中将它们的复习章节改为其他章节，再删除。`);d.lessons.splice(index,1);allQuestions(d).forEach(q=>{if(q.lesson>index)q.lesson--;});}
 function removeSource(d,index){const users=[...d.lessons,...allQuestions(d)];if(users.some(v=>v.sources.includes(index)))throw Error('这个来源仍被章节或题目引用。请先取消对应引用，再删除。');d.sources.splice(index,1);users.forEach(v=>v.sources=v.sources.map(s=>s>index?s-1:s));}
 const api={moveLesson,removeLesson,removeSource,allQuestions};if(typeof module!=='undefined')module.exports=api;root.EditorModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
