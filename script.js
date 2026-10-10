const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const sample={
 projects:[
  {id:1,name:"Website Redesign",description:"Refresh the product website and improve the user experience.",dueDate:"2026-11-15",status:"In progress",color:"violet"},
  {id:2,name:"Mobile App Launch",description:"Prepare the first release of our mobile application.",dueDate:"2026-11-28",status:"Planning",color:"teal"},
  {id:3,name:"Marketing Campaign",description:"Coordinate campaign content, assets, and launch activities.",dueDate:"2026-10-25",status:"In progress",color:"orange"},
  {id:4,name:"Customer Research",description:"Collect feedback and summarize key user needs.",dueDate:"2026-10-08",status:"Completed",color:"blue"}
 ],
 tasks:[
  {id:1,title:"Create homepage wireframes",projectId:1,dueDate:"2026-10-12",priority:"High",status:"In progress"},
  {id:2,title:"Review competitor websites",projectId:1,dueDate:"2026-10-14",priority:"Medium",status:"To do"},
  {id:3,title:"Draft launch checklist",projectId:2,dueDate:"2026-10-17",priority:"High",status:"To do"},
  {id:4,title:"Prepare social media assets",projectId:3,dueDate:"2026-10-09",priority:"Medium",status:"Completed"},
  {id:5,title:"Summarize survey feedback",projectId:4,dueDate:"2026-10-07",priority:"Low",status:"Completed"},
  {id:6,title:"Confirm project milestones",projectId:2,dueDate:"2026-10-20",priority:"Low",status:"In progress"}
 ],
 team:[
  {id:1,name:"Jordan Davis",role:"Project Manager",email:"jordan@example.com"},
  {id:2,name:"Taylor Morgan",role:"UI/UX Designer",email:"taylor@example.com"},
  {id:3,name:"Alex Chen",role:"Frontend Developer",email:"alex@example.com"}
 ]
};
function load(key){try{const v=localStorage.getItem("flowboard_"+key);return v?JSON.parse(v):sample[key].map(x=>({...x}));}catch{return sample[key].map(x=>({...x}));}}
const state={projects:load("projects"),tasks:load("tasks"),team:load("team")};
const palette={violet:{main:"#6b5ce7",bg:"#efedff",letter:"W"},teal:{main:"#20a38c",bg:"#e1f8f1",letter:"M"},orange:{main:"#df9343",bg:"#fff1df",letter:"C"},blue:{main:"#4c83df",bg:"#eaf1ff",letter:"R"},pink:{main:"#d66b9c",bg:"#ffebf4",letter:"P"}};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save=k=>localStorage.setItem("flowboard_"+k,JSON.stringify(state[k]));
const next=k=>state[k].reduce((m,x)=>Math.max(m,x.id),0)+1;
const project=id=>state.projects.find(p=>p.id===Number(id));
const tasksFor=id=>state.tasks.filter(t=>t.projectId===Number(id));
const progress=id=>{const list=tasksFor(id);return list.length?Math.round(list.filter(t=>t.status==="Completed").length/list.length*100):0;};
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);};
function notify(msg){const n=$("#notice");if(!n){alert(msg);return;}n.textContent=msg;n.classList.remove("hidden");setTimeout(()=>n.classList.add("hidden"),3200);}
function go(view){$$(".view").forEach(v=>v.classList.add("hidden"));$(`#${view}-view`).classList.remove("hidden");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$("#crumb-title").textContent=view==="overview"?"Overview":view==="team"?"Team":view==="tasks"?"My tasks":"Projects";if(view==="projects")renderProjects();if(view==="tasks")renderTasks();if(view==="team")renderTeam();}
function statusTag(s){return `<span class="status ${s==="Completed"?"Completed":s==="Planning"?"Planning":""}">${esc(s)}</span>`;}
function projectRow(p){const pct=progress(p.id),c=palette[p.color]||palette.violet;return `<div class="project-row"><div class="project-row-top"><div class="project-name"><span class="project-dot" style="background:${c.main}"></span>${esc(p.name)}</div>${statusTag(p.status)}</div><div class="progress-line"><div class="progress-fill" style="width:${pct}%;background:${c.main}"></div></div><div class="project-meta"><span>${tasksFor(p.id).filter(t=>t.status==="Completed").length} of ${tasksFor(p.id).length} tasks complete</span><span>${pct}%</span></div></div>`;}
function miniTask(t){const p=project(t.projectId);return `<div class="mini-task"><button class="task-check ${t.status==="Completed"?"done":""}" data-toggle-task="${t.id}" title="Mark task complete">${t.status==="Completed"?"✓":""}</button><div class="mini-task-main"><div class="mini-task-title ${t.status==="Completed"?"done-text":""}">${esc(t.title)}</div><div class="mini-task-meta"><span>${esc(p?.name||"No project")}</span><span>·</span><span>${esc(t.dueDate)}</span><span class="priority ${t.priority}">${esc(t.priority)}</span></div></div></div>`;}
function renderOverview(){
 const active=state.projects.filter(p=>p.status==="In progress").length,done=state.tasks.filter(t=>t.status==="Completed").length,inprog=state.tasks.filter(t=>t.status==="In progress").length,overdue=state.tasks.filter(t=>t.status!=="Completed"&&t.dueDate<today()).length;
 $("#stat-active").textContent=active;$("#stat-completed").textContent=done;$("#stat-progress").textContent=inprog;$("#stat-overdue").textContent=overdue;
 $("#overview-projects").innerHTML=state.projects.length?state.projects.slice(0,4).map(projectRow).join(""):'<div class="empty-state">No projects yet. Create your first project.</div>';
 const upcoming=[...state.tasks].filter(t=>t.status!=="Completed").sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,4);
 $("#overview-tasks").innerHTML=upcoming.length?upcoming.map(miniTask).join(""):'<div class="empty-state">No pending tasks. Nice work!</div>';
 $("#snapshot-total").textContent=state.tasks.length;$("#snapshot-done").textContent=(state.tasks.length?Math.round(done/state.tasks.length*100):0)+"%";$("#snapshot-members").textContent=state.team.length;
 const week=new Date();week.setDate(week.getDate()+7);const limit=week.toISOString().slice(0,10);$("#snapshot-due").textContent=state.tasks.filter(t=>t.status!=="Completed"&&t.dueDate>=today()&&t.dueDate<=limit).length;
}
function renderProjects(){
 const q=($("#project-search").value||"").toLowerCase(),f=$("#project-filter").value;
 const list=state.projects.filter(p=>(p.name+" "+p.description).toLowerCase().includes(q)&&(f==="all"||p.status===f));
 $("#projects-grid").innerHTML=list.length?list.map(p=>{const c=palette[p.color]||palette.violet,pct=progress(p.id);return `<article class="project-card"><div class="project-card-head"><span class="project-symbol" style="color:${c.main};background:${c.bg}">${c.letter}</span>${statusTag(p.status)}</div><h3>${esc(p.name)}</h3><p>${esc(p.description||"No description added.")}</p><div class="progress-line"><div class="progress-fill" style="width:${pct}%;background:${c.main}"></div></div><div class="project-meta"><span>${tasksFor(p.id).filter(t=>t.status==="Completed").length}/${tasksFor(p.id).length} tasks complete</span><span>${pct}%</span></div><div class="project-card-footer"><span>Due ${esc(p.dueDate)}</span><div class="card-actions"><button class="mini-action" data-project-status="${p.id}">Change status</button><button class="mini-action" data-delete-project="${p.id}">Delete</button></div></div></article>`;}).join(""):'<div class="panel empty-state">No matching projects found.</div>';
}
function renderTasks(){
 const q=($("#task-search").value||"").toLowerCase(),f=$("#task-filter").value;
 const list=state.tasks.filter(t=>(t.title+" "+(project(t.projectId)?.name||"")).toLowerCase().includes(q)&&(f==="all"||t.status===f));
 $("#tasks-table").innerHTML=list.length?list.map(t=>`<tr><td>${esc(t.title)}</td><td>${esc(project(t.projectId)?.name||"Deleted project")}</td><td>${esc(t.dueDate)}</td><td><span class="priority-badge ${t.priority}">${esc(t.priority)}</span></td><td><select class="table-select" data-task-status="${t.id}">${["To do","In progress","Completed"].map(s=>`<option ${t.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td><button class="mini-action" data-delete-task="${t.id}">Delete</button></td></tr>`).join(""):'<tr><td colspan="6" class="empty-state">No tasks match your filters.</td></tr>';
}
function renderTeam(){ $("#team-grid").innerHTML=state.team.length?state.team.map(m=>{const initials=m.name.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();return `<article class="member-card"><div class="member-top"><div class="member-avatar">${esc(initials)}</div><div><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p></div></div><div class="member-email">${esc(m.email||"No email added")}</div><div style="text-align:right;margin-top:13px"><button class="mini-action" data-delete-member="${m.id}">Remove member</button></div></article>`;}).join(""):'<div class="panel empty-state">No team members yet.</div>'; }
function refresh(){renderOverview();const current=$(".view:not(.hidden)")?.id.replace("-view","");if(current==="projects")renderProjects();if(current==="tasks")renderTasks();if(current==="team")renderTeam();}
function openDialog(id){$(`#${id}`).showModal();}
function openTaskDialog(){if(!state.projects.length)return notify("Create a project before adding tasks.");$("#task-project").innerHTML=state.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");$("#task-form").elements.dueDate.value=today();openDialog("task-dialog");}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
$$("[data-nav]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.nav)));
$("#new-project-top").addEventListener("click",()=>openDialog("project-dialog"));$("#new-project-btn").addEventListener("click",()=>openDialog("project-dialog"));
$("#new-task-btn").addEventListener("click",openTaskDialog);$("#add-member-btn").addEventListener("click",()=>openDialog("member-dialog"));
$$("[data-close]").forEach(b=>b.addEventListener("click",()=> $(`#${b.dataset.close}`).close()));
$("#project-search").addEventListener("input",renderProjects);$("#project-filter").addEventListener("change",renderProjects);$("#task-search").addEventListener("input",renderTasks);$("#task-filter").addEventListener("change",renderTasks);
$("#project-form").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.projects.push({id:next("projects"),name:d.name.trim(),description:d.description.trim(),dueDate:d.dueDate,status:d.status,color:d.color});save("projects");e.currentTarget.reset();$("#project-dialog").close();refresh();go("projects");notify("Project created successfully.");});
$("#task-form").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.tasks.push({id:next("tasks"),title:d.title.trim(),projectId:Number(d.projectId),dueDate:d.dueDate,priority:d.priority,status:d.status});save("tasks");e.currentTarget.reset();$("#task-dialog").close();refresh();go("tasks");notify("Task added successfully.");});
$("#member-form").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.team.push({id:next("team"),name:d.name.trim(),role:d.role.trim(),email:d.email.trim()});save("team");e.currentTarget.reset();$("#member-dialog").close();refresh();go("team");notify("Team member added.");});
document.addEventListener("click",e=>{
 const toggle=e.target.closest("[data-toggle-task]"),delP=e.target.closest("[data-delete-project]"),change=e.target.closest("[data-project-status]"),delT=e.target.closest("[data-delete-task]"),delM=e.target.closest("[data-delete-member]");
 if(toggle){const t=state.tasks.find(x=>x.id===Number(toggle.dataset.toggleTask));if(t){t.status=t.status==="Completed"?"To do":"Completed";save("tasks");refresh();}}
 if(delP&&confirm("Delete this project and all its tasks?")){const id=Number(delP.dataset.deleteProject);state.projects=state.projects.filter(p=>p.id!==id);state.tasks=state.tasks.filter(t=>t.projectId!==id);save("projects");save("tasks");refresh();notify("Project deleted.");}
 if(change){const p=project(change.dataset.projectStatus);if(p){const options=["Planning","In progress","Completed"];p.status=options[(options.indexOf(p.status)+1)%options.length];save("projects");refresh();notify("Project status updated.");}}
 if(delT&&confirm("Delete this task?")){state.tasks=state.tasks.filter(t=>t.id!==Number(delT.dataset.deleteTask));save("tasks");refresh();notify("Task deleted.");}
 if(delM&&confirm("Remove this team member?")){state.team=state.team.filter(m=>m.id!==Number(delM.dataset.deleteMember));save("team");refresh();notify("Team member removed.");}
});
document.addEventListener("change",e=>{const s=e.target.closest("[data-task-status]");if(s){const t=state.tasks.find(x=>x.id===Number(s.dataset.taskStatus));if(t){t.status=s.value;save("tasks");refresh();notify("Task status updated.");}}});
refresh();