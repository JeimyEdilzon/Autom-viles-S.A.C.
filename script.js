
const departments = [
    {
        id: "ventas",
        name: "Ventas",
        description: "Vehículos nuevos y atención comercial.",
        longDescription: "Gestionar consultas comerciales, cotizaciones, información de vehículos y coordinación de la atención a los clientes.",
        icon: "fa-car-side",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "recepcion",
        name: "Recepción",
        description: "Registro y atención al cliente.",
        longDescription: "Organizar la recepción de clientes, la documentación, las citas y la comunicación con las demás áreas.",
        icon: "fa-clipboard-check",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "taller",
        name: "Taller Mecánico",
        description: "Mantenimiento y reparaciones.",
        longDescription: "Coordinar mantenimientos, reparaciones, diagnósticos y seguimiento de los servicios realizados a los vehículos.",
        icon: "fa-screwdriver-wrench",
        image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "repuestos",
        name: "Repuestos",
        description: "Piezas, accesorios y suministros.",
        longDescription: "Coordinar requerimientos de repuestos, disponibilidad de piezas y necesidades del taller y otras áreas.",
        icon: "fa-box-open",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "administracion",
        name: "Administración",
        description: "Gestión y soporte administrativo.",
        longDescription: "Coordinar tareas administrativas, documentación y trámites internos de las diferentes áreas.",
        icon: "fa-file-invoice",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "logistica",
        name: "Logística",
        description: "Distribución y control de inventarios.",
        longDescription: "Coordinar suministros, inventarios, movimientos de productos y necesidades logísticas.",
        icon: "fa-truck",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "talento",
        name: "Talento Humano",
        description: "Personal y capacitación.",
        longDescription: "Apoyar la coordinación interna, la capacitación, la comunicación con el personal y las actividades de desarrollo.",
        icon: "fa-users",
        image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: "sistemas",
        name: "Sistemas",
        description: "Soporte tecnológico.",
        longDescription: "Registrar incidencias tecnológicas, coordinar soporte y dar seguimiento a problemas con equipos y sistemas.",
        icon: "fa-desktop",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80"
    }
];

const pages = [
    "inicio",
    "areas",
    "detalle-area",
    "empresa",
    "normas",
    "coordinacion",
    "soporte",
    "perfil",
    "manuales",
    "administrar"
];

let currentDepartment = null;
let requests = [];

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showToast(message) {
    const toast = $("#toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function createDepartmentCard(department) {
    return `
        <article class="department-card">
            <div class="department-photo">
                <img
                    src="${department.image}"
                    alt="Área de ${department.name}"
                    loading="lazy">
            </div>

            <div class="department-icon">
                <i class="fa-solid ${department.icon}" aria-hidden="true"></i>
            </div>

            <div class="department-body">
                <h3>${department.name}</h3>
                <p>${department.description}</p>

                <button
                    class="primary-button"
                    data-department="${department.id}">
                    Ingresar
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </article>
    `;
}

function renderDepartments() {
    const cards = departments.map(createDepartmentCard).join("");

    $("#departmentGrid").innerHTML = cards;
    $("#allDepartmentsGrid").innerHTML = cards;
}

function openDepartment(id) {
    const department = departments.find(item => item.id === id);

    if (!department) {
        showToast("No se encontró el área seleccionada.");
        return;
    }

    currentDepartment = department;

    $("#departmentTitle").textContent = department.name;
    $("#departmentDescription").textContent = department.description;
    $("#departmentLongDescription").textContent = department.longDescription;

    $("#departmentLargeIcon").innerHTML =
        `<i class="fa-solid ${department.icon}" aria-hidden="true"></i>`;

    showPage("detalle-area");
    renderAreaInbox();
}

function showPage(pageId) {
    if (!pages.includes(pageId)) {
        return;
    }

    $$(".page").forEach(page => {
        page.classList.toggle("active-page", page.id === pageId);
    });

    $$(".nav-link").forEach(button => {
        const active = button.dataset.page === pageId ||
            (pageId === "detalle-area" && button.dataset.page === "areas");

        button.classList.toggle("active", active);

        if (active) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    $("#profileMenu").classList.add("hidden");
    $("#profileMenuButton").setAttribute("aria-expanded", "false");

    if (pageId === "coordinacion") {
        renderRequests();
    }
    updateRequestNotifications();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadProfile() {
    const name = localStorage.getItem("automoviles_nombre") || "Colaborador";
    const role = localStorage.getItem("automoviles_cargo") || "Personal interno";

    $("#profileName").textContent = name;
    $("#profileRole").textContent = role;
    $("#profilePageName").textContent = name;
    $("#profilePageRole").textContent = role;
    $("#welcomeName").textContent = name;
}

function loadRequests() {
    try {
        const stored = localStorage.getItem("automoviles_solicitudes");
        const parsed = stored ? JSON.parse(stored) : [];

        requests = Array.isArray(parsed) ? parsed : [];
    } catch {
        requests = [];
    }
}

function saveRequests() {
    try {
        localStorage.setItem(
            "automoviles_solicitudes",
            JSON.stringify(requests)
        );

        updateRequestNotifications();
        return true;
    } catch {
        showToast("No se pudo guardar. Revisa el almacenamiento del navegador.");
        return false;
    }
}

function renderAreaOptions() {
    const select = $("#requestArea");
    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Seleccionar área</option>
        ${departments.map(department => `
            <option value="${department.id}">${department.name}</option>
        `).join("")}
    `;

    if (currentDepartment && !enterpriseUser) {
        select.value = currentDepartment.id;
    } else if (departments.some(item => item.id === previousValue)) {
        select.value = previousValue;
    }
}

function renderRequests() {
    const list = $("#requestList");

    const visible = enterpriseUser?.role === "admin" ? requests : requests.filter(r => requestInvolvesArea(r,enterpriseUser?.area));
    if (visible.length === 0) {
        list.innerHTML = `
            <div class="empty-message">
                <i class="fa-regular fa-folder-open"></i>
                <p>Aún no hay solicitudes registradas.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = visible.slice().reverse().map(request => {
        const department = departments.find(item => item.id === request.area);
        const areaName = department ? department.name : "Área no disponible";

        let priorityClass = "";

        if (request.priority === "Alta") {
            priorityClass = "high";
        } else if (request.priority === "Urgente") {
            priorityClass = "urgent";
        }

        const canRespond = enterpriseUser?.role === "admin" || requestInvolvesArea(request,enterpriseUser?.area);
        return `
            <article class="request-item">
                <h4>${escapeHTML(request.title)} <small>· ${escapeHTML(request.ticket || request.id)}</small></h4>

                <div class="request-meta">
                    <span class="request-badge">Destino: ${escapeHTML(areaName)}</span><span class="request-badge">Origen: ${escapeHTML(request.originArea || "Sin registrar")}</span>
                    <span class="request-badge ${priorityClass}">
                        ${escapeHTML(request.priority)}
                    </span>
                </div>

                <p>${escapeHTML(request.description)}</p>
                <p><strong>Registrado por:</strong> ${escapeHTML(request.createdBy)}</p>
                <p><strong>Fecha:</strong> ${escapeHTML(request.date)} · <strong>Estado:</strong> ${escapeHTML(request.status)}</p>

                <div><strong>Respuestas:</strong> ${(request.replies||[]).map(r=>`<p><strong>${escapeHTML(r.area || "Área")} · ${escapeHTML(r.author)}</strong> (${escapeHTML(r.date)}): ${escapeHTML(r.text)}</p>`).join("") || "Sin respuestas"}</div>
                ${canRespond ? `<label>Responder a solicitud</label><textarea data-reply-text="${request.id}" rows="2" maxlength="1000" placeholder="Escribe la respuesta del área destinataria"></textarea><button type="button" data-reply-send="${request.id}" class="primary-button">Enviar respuesta</button>` : ""}
                <label for="status-${request.id}">Estado</label>
                <select id="status-${request.id}" data-status-id="${request.id}" ${canRespond?"":"disabled"}>
                    <option value="Pendiente" ${request.status === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="En proceso" ${request.status === "En proceso" ? "selected" : ""}>En proceso</option>
                    <option value="Completada" ${request.status === "Completada" ? "selected" : ""}>Completada</option>
                </select>
            </article>
        `;
    }).join("");
}

// Notificaciones de demostración: guardadas por usuario en este navegador.
const REQUEST_SEEN_KEY = 'automoviles_notificaciones_v2';
function requestAreaName(r){return departments.find(d=>d.id===r.area)?.name || r.area;}
function requestInvolvesArea(r,area){return !!area && (r.originArea===area || requestAreaName(r)===area);}
function requestTargetArea(r){return requestAreaName(r);}
function requestEvent(r){return r.updatedAt || r.date || r.id;}
function requestIncoming(r,area){return requestInvolvesArea(r,area) && r.lastActorArea!==area && r.status!=='Completada';}
function seenMap(){try{return JSON.parse(localStorage.getItem(REQUEST_SEEN_KEY)||'{}')}catch{return {}}}
function unseenFor(area){if(!enterpriseUser)return [];const seen=seenMap(),key=enterpriseUser.code;return requests.filter(r=>requestIncoming(r,area) && seen[key+'|'+r.id]!==requestEvent(r));}
function markRequestSeen(r){if(!enterpriseUser)return;const seen=seenMap();seen[enterpriseUser.code+'|'+r.id]=requestEvent(r);localStorage.setItem(REQUEST_SEEN_KEY,JSON.stringify(seen));updateRequestNotifications();}
function updateRequestNotifications(){
 if(!enterpriseUser)return;
 const n=unseenFor(enterpriseUser.area).length;
 let badge=document.getElementById('requestBellBadge');
 if(!badge){badge=document.createElement('button');badge.id='requestBellBadge';badge.type='button';badge.className='request-notice-bell';badge.addEventListener('click',()=>{showPage('coordinacion');renderRequests();});const nav=document.querySelector('[data-page="coordinacion"]');if(nav)nav.appendChild(badge);}
 badge.innerHTML='<i class="fa-solid fa-bell"></i> '+n+' nueva'+(n===1?'':'s');badge.hidden=!n;
 document.querySelectorAll('[data-department]').forEach(b=>{const d=departments.find(x=>x.id===b.dataset.department);let flag=b.parentElement.querySelector('.request-area-count');const count=d?unseenFor(d.name).length:0;if(!flag && count){flag=document.createElement('span');flag.className='request-area-count';b.insertAdjacentElement('beforebegin',flag);}if(flag){flag.textContent=count+' solicitud'+(count===1?'':'es')+' nueva'+(count===1?'':'s');flag.hidden=!count;}});
}
function renderAreaInbox(){
 const d=currentDepartment;if(!d)return;
 let slot=document.getElementById('departmentInbox');if(!slot){slot=document.createElement('section');slot.id='departmentInbox';slot.className='enterprise-card';document.querySelector('#detalle-area')?.appendChild(slot);}
 const own=enterpriseUser?.role==='admin'||enterpriseUser?.area===d.name;
 const incoming=requests.filter(r=>requestTargetArea(r)===d.name);
 const unread=own?unseenFor(d.name):[];
 slot.innerHTML='<h3><i class="fa-solid fa-bell"></i> Bandeja de '+escapeHTML(d.name)+'</h3>'+
 (own?'<p>Solicitudes recibidas · '+unread.length+' notificación(es) nueva(s)</p>':'<p>Vista informativa. Para responder debes ingresar con una cuenta de esta área.</p>')+
 (incoming.length?incoming.slice().reverse().map(r=>'<article class="area-inbox-item"><strong>'+escapeHTML(r.ticket||r.id)+' · '+escapeHTML(r.title)+'</strong><p>Desde '+escapeHTML(r.originArea)+' · '+escapeHTML(r.status)+'</p><button class="primary-button" data-open-request="'+r.id+'">'+(own?'Abrir y responder':'Ver solicitud')+'</button></article>').join(''):'<p>Esta área todavía no tiene solicitudes recibidas.</p>');
}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-open-request]');if(!btn)return;const r=requests.find(x=>x.id===btn.dataset.openRequest);if(!r)return;if(enterpriseUser?.role!=='admin'&&!requestInvolvesArea(r,enterpriseUser?.area)){showToast('Acceso exclusivo a las áreas participantes');return;}markRequestSeen(r);showPage('coordinacion');renderRequests();document.querySelector('[data-reply-text="'+r.id+'"]')?.focus();});
window.addEventListener('storage',e=>{if(e.key==='automoviles_solicitudes'){loadRequests();renderRequests();renderAreaInbox();updateRequestNotifications();}});
function showLogin() {
    $("#app").classList.add("hidden");
    $("#loginScreen").classList.remove("hidden");

    $("#loginForm").reset();
    $("#loginError").textContent = "";
    $("#loginError").classList.remove("show");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function enterPortal(name, area) {
    localStorage.setItem("automoviles_nombre", name);
    localStorage.setItem("automoviles_cargo", area);

    loadProfile();
    renderDepartments();
    renderAreaOptions();
    renderRequests();
    updateRequestNotifications();

    $("#loginScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");

    showPage("inicio");
    showToast("Bienvenido al portal, " + name + ".");
}

async function logout() {
    const confirmed = confirm("¿Deseas cerrar la sesión?");

    if (!confirmed) {
        return;
    }

    await enterpriseAPI('/api/logout',{method:'POST'}).catch(()=>{});
    enterpriseUser=null;
    localStorage.removeItem("automoviles_nombre");
    localStorage.removeItem("automoviles_cargo");

    currentDepartment = null;
    showLogin();
}

$("#loginForm").addEventListener("submit", async event => {
 event.preventDefault();const code=$("#loginName").value.trim();const password=$("#loginPassword").value;
 try {const result=await enterpriseAPI('/api/login',{method:'POST',body:JSON.stringify({code,password})});
 enterpriseUser=result.user;enterPortal(result.user.name,result.user.area);enterpriseReady();renderRequests();}
 catch(e){const el=$("#loginError");el.textContent=e.message;el.classList.add('show');}
});

$("#requestForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#requestTitle").value.trim();
    const area = $("#requestArea").value;
    const priority = $("#requestPriority").value;
    const description = $("#requestDescription").value.trim();

    if (!title || !area || !description) {
        showToast("Completa todos los campos obligatorios.");
        return;
    }

    const request = {
        id: Date.now().toString(),
        ticket: "SOL-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-7),
        updatedAt: new Date().toISOString(),
        lastActorArea: enterpriseUser?.area || "Sin identificar",
        title,
        area,
        priority,
        description,
        status: "Pendiente",
        createdBy: enterpriseUser?.name || localStorage.getItem("automoviles_nombre") || "Colaborador",
        originArea: enterpriseUser?.area || "Sin identificar",
        replies: [],
        date: new Date().toLocaleString("es-PE")
    };

    requests.push(request);

    if (!saveRequests()) {
        requests.pop();
        return;
    }

    $("#requestForm").reset();
    renderRequests();
    updateRequestNotifications();
    showToast("Solicitud enviada al área destinataria.");
});

document.addEventListener("click", event => {
    const send = event.target.closest("[data-reply-send]");
    if(send){const request=requests.find(r=>r.id===send.dataset.replySend);const input=document.querySelector(`[data-reply-text="${send.dataset.replySend}"]`);const allowed=enterpriseUser?.role==='admin'||requestInvolvesArea(request,enterpriseUser?.area);
      if(!request||!input?.value.trim()||!allowed)return;
      (request.replies ||= []).push({author:enterpriseUser.name,area:enterpriseUser.area,text:input.value.trim(),date:new Date().toLocaleString('es-PE')});request.updatedAt=new Date().toISOString();request.lastActorArea=enterpriseUser.area;saveRequests();renderRequests();renderAreaInbox();showToast('Respuesta enviada y notificación creada');return;}
    const departmentButton = event.target.closest("[data-department]");

    if (departmentButton) {
        openDepartment(departmentButton.dataset.department);
        return;
    }

    const pageButton = event.target.closest("[data-page]");

    if (pageButton) {
        event.preventDefault();
        showPage(pageButton.dataset.page);
    }
});

document.addEventListener("change", event => {
    const select = event.target.closest("[data-status-id]");

    if (!select) {
        return;
    }

    const request = requests.find(
        item => item.id === select.dataset.statusId
    );

    if (!request) {
        return;
    }

    if(enterpriseUser?.role!=="admin" && !requestInvolvesArea(request,enterpriseUser?.area))return;
    const previousStatus = request.status;
    request.status = select.value;
    request.updatedAt = new Date().toISOString();
    request.lastActorArea = enterpriseUser?.area;

    if (!saveRequests()) {
        request.status = previousStatus;
        renderRequests();
        return;
    }

    showToast("Estado de la solicitud actualizado.");
});

$("#profileMenuButton").addEventListener("click", () => {
    const menu = $("#profileMenu");
    const opening = menu.classList.contains("hidden");

    menu.classList.toggle("hidden");
    $("#profileMenuButton").setAttribute("aria-expanded", String(opening));
});

document.addEventListener("click", event => {
    if (!event.target.closest(".profile")) {
        $("#profileMenu").classList.add("hidden");
        $("#profileMenuButton").setAttribute("aria-expanded", "false");
    }
});

$("#notificationButton").addEventListener("click", () => {
    showToast("Centro de notificaciones: función pendiente de integración.");
});

$("#logoutButton").addEventListener("click", logout);
$("#logoutProfileButton").addEventListener("click", logout);

$("#loginYear").textContent = new Date().getFullYear();
$("#footerYear").textContent = new Date().getFullYear();

renderDepartments();
loadRequests();
renderRequests();
showLogin();
enterpriseAPI('/api/me').then(r=>{enterpriseUser=r.user;enterPortal(r.user.name,r.user.area);enterpriseReady();}).catch(()=>{});

document.addEventListener('focusin',e=>{const el=e.target.closest('[data-reply-text]');if(el){const r=requests.find(x=>x.id===el.dataset.replyText);if(r)markRequestSeen(r);}});
