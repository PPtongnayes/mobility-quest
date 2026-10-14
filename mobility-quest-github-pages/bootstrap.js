(async()=>{
 try{
  await window.mobility.ready;
  for(const file of ['content.js','learning.js','app.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file;script.onload=resolve;script.onerror=()=>reject(Error('无法加载 '+file));document.body.append(script);});
  const params=new URLSearchParams(location.search);
  if(window.mobility.isLocalPreview){const note=document.createElement('div');note.className='notice';note.textContent=params.has('preview-draft')?'草稿预览：仅本机可见，不影响线上课程或正式闯关成绩。':'本机课程预览：仅当前浏览器使用此内容，线上课程尚未更新。';const link=document.createElement('a');link.href='index.html';link.textContent=' 返回正式课程';note.append(link);document.querySelector('header').after(note);
   if(params.get('view')==='question'){saved.completed=[true,true,true];const m=Math.min(Math.max(Number(params.get('mission'))||0,0),2);start(m);question=Math.min(Math.max(Number(params.get('selected'))||0,0),4);newChoices();render();}
   else if(params.get('view')==='lesson'){lesson=Math.min(Math.max(Number(params.get('selected'))||0,0),LESSONS.length-1);go('learn');}
  }
 }catch(error){const area=document.getElementById('app');const h=document.createElement('h2');h.textContent='网页未能加载';const text=document.createElement('p');text.textContent=location.protocol==='file:'?'请通过 GitHub Pages 地址或本地网页服务器访问；不要直接双击 index.html。':error.message;area.replaceChildren(h,text);}
})();
