/**
 * proy1.js — Frontend logic for Proyecto 1 (Gestor de Flujos Lógicos)
 * - Maneja calendario, notas, contactos y chat (envío de correos)
 * - El chat usa el endpoint `/send-email` del backend (misma origen)
 * - Rutas del backend deben servirse desde el mismo host (por eso usamos rutas relativas)
 */

// ===== GESTOR DE EVENTOS CON ALMACENAMIENTO LOCAL =====

// Fecha inicial del calendario (mutable)
let currentDate = new Date(2026, 1, 15);
let isActive = true;
let selectedEvents = {};
let selectedNotes = {};
let selectedContacts = {};
let selectedMessages = {};
let eventIdCounter = 1000;
let noteIdCounter = 2000;
let contactIdCounter = 3000;
let selectedDay = null;
let selectedDateStr = null;
let currentTab = 'calendar';
let currentChatContactId = null;

// Cargar eventos desde localStorage
function loadEvents() {
    const stored = localStorage.getItem('calendarEvents');
    if (stored) {
        selectedEvents = JSON.parse(stored);
    } else {
        // Eventos de ejemplo iniciales
        const sampleEvents = {
            '2026-02-18': [
                { id: 1, title: 'Revisión de código', time: '10:00' },
                { id: 2, title: 'Team meeting', time: '14:00' }
            ],
            '2026-02-20': [
                { id: 3, title: 'Entrega de proyecto', time: '16:00' }
            ],
            '2026-02-25': [
                { id: 4, title: 'Capacitación JavaScript', time: '09:00' }
            ],
            '2026-03-05': [
                { id: 5, title: 'Presentación resultados', time: '11:00' }
            ],
            '2026-03-12': [
                { id: 6, title: 'Reunión cliente', time: '15:00' }
            ]
        };
        selectedEvents = sampleEvents;
        eventIdCounter = 7;
        saveEvents();
    }
}

// Guardar eventos en localStorage
function saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(selectedEvents));
}

// Agregar nuevo evento
function addEvent(dateStr, title, time = '09:00') {
    if (!title.trim()) return false;
    
    if (!selectedEvents[dateStr]) {
        selectedEvents[dateStr] = [];
    }

    const newEvent = {
        id: eventIdCounter++,
        title: title.trim(),
        time: time
    };

    selectedEvents[dateStr].push(newEvent);
    saveEvents();
    return true;
}

// Eliminar evento
function deleteEvent(dateStr, eventId) {
    if (selectedEvents[dateStr]) {
        selectedEvents[dateStr] = selectedEvents[dateStr].filter(e => e.id !== eventId);
        if (selectedEvents[dateStr].length === 0) {
            delete selectedEvents[dateStr];
        }
        saveEvents();
        return true;
    }
    return false;
}

// Obtener eventos de una fecha
function getEventsForDate(dateStr) {
    return selectedEvents[dateStr] || [];
}

// Contar eventos del mes actual
function countEventsThisMonth() {
    const countDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    let count = 0;

    for (let day = 1; day <= countDays; day++) {
        const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        if (selectedEvents[dateStr]) {
            count += selectedEvents[dateStr].length;
        }
    }
    return count;
}

// ===== FUNCIONES DE FECHA =====

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthName(month) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month];
}

// ===== ACTUALIZAR UI =====

function updateStateDisplay() {
    const toggle = document.getElementById('stateToggle');
    const stateDot = document.getElementById('stateDot');
    const stateText = document.getElementById('stateText');
    const systemStatus = document.getElementById('systemStatus');

    isActive = toggle.checked;

    if (isActive) {
        stateDot.classList.add('active');
        stateText.textContent = 'Activo';
        systemStatus.textContent = 'Funcionando';
        document.getElementById('calendarSection').style.opacity = '1';
        document.getElementById('calendarSection').style.pointerEvents = 'auto';
    } else {
        stateDot.classList.remove('active');
        stateText.textContent = 'Inactivo';
        systemStatus.textContent = 'En pausa';
        document.getElementById('calendarSection').style.opacity = '0.5';
        document.getElementById('calendarSection').style.pointerEvents = 'none';
    }

    updateElseSection();
}

function updateElseSection() {
    const elseContainer = document.getElementById('elseContainer');
    const elseHeaderTitle = document.querySelector('.else-header-title');
    const elseMessages = document.getElementById('elseMessages');
    const elseEventsList = document.getElementById('elseEventsList');
    const eventsThisMonth = countEventsThisMonth();

    if (eventsThisMonth === 0 && isActive) {
        elseContainer.classList.add('collapsed');
        elseHeaderTitle.innerHTML = `
            <i class="bi bi-exclamation-triangle"></i>
            Sin eventos programados
        `;
        elseMessages.style.display = 'block';
        elseEventsList.style.display = 'none';
    } else {
        elseContainer.classList.remove('collapsed');
        elseHeaderTitle.innerHTML = `
            <i class="bi bi-check-circle-fill" style="color: #4ade80;"></i>
            ${eventsThisMonth} evento${eventsThisMonth !== 1 ? 's' : ''} programado${eventsThisMonth !== 1 ? 's' : ''}
        `;
        elseMessages.style.display = 'none';
        elseEventsList.style.display = 'flex';
        renderElseEventsList();
    }
}

function renderElseEventsList() {
    const elseEventsList = document.getElementById('elseEventsList');
    elseEventsList.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Recolectar eventos del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(new Date(year, month, day));
        const events = getEventsForDate(dateStr);
        
        if (events.length > 0) {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'else-event-item';
            
            const date = new Date(dateStr);
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            
            let eventsHTML = `
                <div class="else-event-date">
                    <i class="bi bi-calendar-event"></i>
                    ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                </div>
                <div class="else-event-items">
            `;
            
            events.forEach(event => {
                eventsHTML += `
                    <div class="else-event-event">
                        <i class="bi bi-clock"></i>
                        <span><strong>${event.time}</strong> - ${escapeHtml(event.title)}</span>
                    </div>
                `;
            });
            
            eventsHTML += '</div>';
            eventDiv.innerHTML = eventsHTML;
            elseEventsList.appendChild(eventDiv);
        }
    }
}

function updateEventCount() {
    const count = countEventsThisMonth();
    document.getElementById('eventCount').textContent = `${count} programados`;
}

// ===== RENDERIZAR CALENDARIO =====

function renderCalendar() {
    const daysGrid = document.getElementById('daysGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    daysGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    monthYearDisplay.textContent = `${getMonthName(month)} ${year}`;

    // Días anteriores
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true);
        daysGrid.appendChild(dayElement);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false);
        daysGrid.appendChild(dayElement);
    }

    // Días del siguiente mes
    const totalCells = daysGrid.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true);
        daysGrid.appendChild(dayElement);
    }

    updateEventCount();
    updateElseSection();
}

function createDayElement(day, isOtherMonth) {
    const div = document.createElement('div');
    div.className = 'day';

    if (isOtherMonth) {
        div.classList.add('other-month');
    } else {
        const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        const events = getEventsForDate(dateStr);
        
        if (events.length > 0) {
            div.classList.add('has-event');
        }

        div.addEventListener('click', () => {
            if (isActive) {
                openEventModal(day, dateStr);
            }
        });
    }

    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const events = getEventsForDate(dateStr);

    div.innerHTML = `
        <div class="day-number">${day}</div>
        ${!isOtherMonth && events.length > 0 
            ? `<div class="day-event-count">${events.length} eventos</div>` 
            : ''}
    `;

    return div;
}

// ===== MODAL DE EVENTOS =====

function openEventModal(day, dateStr) {
    selectedDay = day;
    selectedDateStr = dateStr;

    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const eventsList = document.getElementById('eventsList');

    const dayName = new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    modalTitle.textContent = `Eventos: ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;

    const events = getEventsForDate(dateStr);
    eventsList.innerHTML = '';

    if (events.length > 0) {
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            eventDiv.innerHTML = `
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">
                        <i class="bi bi-clock"></i> ${event.time}
                    </div>
                </div>
                <button class="btn-delete-event" onclick="deleteEventFromModal(${event.id}, '${dateStr}')">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            eventsList.appendChild(eventDiv);
        });
    } else {
        eventsList.innerHTML = '<p class="no-events">No hay eventos en este día</p>';
    }

    modal.style.display = 'block';
}

function deleteEventFromModal(eventId, dateStr) {
    if (confirm('¿Eliminar este evento?')) {
        deleteEvent(dateStr, eventId);
        renderCalendar();
        openEventModal(selectedDay, selectedDateStr);
    }
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

function openAddEventForm() {
    if (!isActive) {
        alert('El sistema está inactivo. Actívalo para agregar eventos.');
        return;
    }

    if (!selectedDateStr) {
        alert('Selecciona un día del calendario primero.');
        return;
    }

    const modal = document.getElementById('addEventModal');
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventTime').value = '09:00';
    modal.style.display = 'block';
}

function closeAddEventModal() {
    document.getElementById('addEventModal').style.display = 'none';
}

function saveNewEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const time = document.getElementById('eventTime').value;

    if (!title) {
        alert('Por favor ingresa un título para el evento.');
        return;
    }

    if (addEvent(selectedDateStr, title, time)) {
        closeAddEventModal();
        renderCalendar();
        openEventModal(selectedDay, selectedDateStr);
    }
}

// ===== FUNCIONES DE NOTAS =====

function loadNotes() {
    const stored = localStorage.getItem('calendarNotes');
    if (stored) {
        selectedNotes = JSON.parse(stored);
        // Actualizar el contador para nuevas notas
        const maxId = Object.keys(selectedNotes).reduce((max, key) => {
            const ids = selectedNotes[key].map(n => n.id);
            return Math.max(max, ...ids);
        }, 1999);
        noteIdCounter = maxId + 1;
    } else {
        selectedNotes = {
            'active': [
                { id: 2001, title: 'Revisar documentación del proyecto', description: 'Leer y revisar los archivos de especificación y documentación técnica del proyecto en progreso.', completed: false, createdAt: '2026-02-15' },
                { id: 2002, title: 'Enviar reporte semanal', description: 'Compilar y enviar el reporte de actividades semanales al equipo de gestión.', completed: false, createdAt: '2026-02-15' },
                { id: 2003, title: 'Reunión con equipo', description: 'Asistir a la reunión de coordinación con los miembros del equipo de desarrollo.', completed: false, createdAt: '2026-02-15' }
            ]
        };
        noteIdCounter = 2004;
        saveNotes();
    }
}

function saveNotes() {
    localStorage.setItem('calendarNotes', JSON.stringify(selectedNotes));
}

function addNote(title, description = '') {
    if (!title.trim()) return false;

    if (!selectedNotes['active']) {
        selectedNotes['active'] = [];
    }

    const newNote = {
        id: noteIdCounter++,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: formatDate(new Date())
    };

    selectedNotes['active'].push(newNote);
    saveNotes();
    return true;
}

function deleteNote(noteId) {
    if (selectedNotes['active']) {
        selectedNotes['active'] = selectedNotes['active'].filter(n => n.id !== noteId);
        saveNotes();
        return true;
    }
    return false;
}

function toggleNoteCompletion(noteId) {
    if (selectedNotes['active']) {
        const note = selectedNotes['active'].find(n => n.id === noteId);
        if (note) {
            note.completed = !note.completed;
            saveNotes();
            return true;
        }
    }
    return false;
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('notesEmptyState');
    const notes = selectedNotes['active'] || [];

    if (notes.length === 0) {
        notesList.innerHTML = '';
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        notesList.innerHTML = '';

        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = `note-item ${note.completed ? 'completed' : ''}`;
            noteDiv.innerHTML = `
                <div class="note-checkbox ${note.completed ? 'checked' : ''}" onclick="toggleNoteAndRender(${note.id})"></div>
                <div class="note-content">
                    <p class="note-text">${escapeHtml(note.title)}</p>
                    ${note.description ? `<p class="note-description">${escapeHtml(note.description)}</p>` : ''}
                    <div class="note-meta">
                        <i class="bi bi-calendar-event"></i>
                        <span>${note.createdAt}</span>
                    </div>
                </div>
                <button class="note-delete-btn" onclick="deleteNotesAndRender(${note.id})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            notesList.appendChild(noteDiv);
        });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function toggleNoteAndRender(noteId) {
    toggleNoteCompletion(noteId);
    renderNotes();
}

function deleteNotesAndRender(noteId) {
    if (confirm('¿Eliminar esta tarea?')) {
        deleteNote(noteId);
        renderNotes();
    }
}

function openAddNoteForm() {
    if (!isActive) {
        alert('El sistema está inactivo. Actívalo para agregar tareas.');
        return;
    }

    const modal = document.getElementById('addNoteModal');
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteDescription').value = '';
    modal.style.display = 'block';
    document.getElementById('noteTitle').focus();
}

function closeAddNoteModal() {
    document.getElementById('addNoteModal').style.display = 'none';
}

function saveNewNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const description = document.getElementById('noteDescription').value.trim();

    if (!title) {
        alert('Por favor ingresa un título para la tarea.');
        return;
    }

    if (addNote(title, description)) {
        closeAddNoteModal();
        renderNotes();
    }
}

// ===== FUNCIONES DE CONTACTOS =====

function loadContacts() {
    const stored = localStorage.getItem('calendarContacts');
    if (stored) {
        selectedContacts = JSON.parse(stored);
        const maxId = Object.keys(selectedContacts).reduce((max, id) => Math.max(max, parseInt(id)), 2999);
        contactIdCounter = maxId + 1;
    } else {
        selectedContacts = {
            3001: { id: 3001, name: 'María López', alias: 'Mariana', email: 'maria@ejemplo.com' },
            3002: { id: 3002, name: 'Carlos Rodríguez', alias: 'Carlos', email: 'carlos@ejemplo.com' }
        };
        contactIdCounter = 3003;
        saveContacts();
    }

    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
        selectedMessages = JSON.parse(storedMessages);
    }
}

function saveContacts() {
    localStorage.setItem('calendarContacts', JSON.stringify(selectedContacts));
}

function saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(selectedMessages));
}

function addContact(name, email, alias = '') {
    if (!name.trim() || !email.trim()) return false;

    const newContact = {
        id: contactIdCounter++,
        name: name.trim(),
        email: email.trim(),
        alias: alias.trim() || name.trim()
    };

    selectedContacts[newContact.id] = newContact;
    selectedMessages[newContact.id] = [];
    saveContacts();
    saveMessages();
    return newContact.id;
}

function deleteContact(contactId) {
    if (selectedContacts[contactId]) {
        delete selectedContacts[contactId];
        saveContacts();
        return true;
    }
    return false;
}

function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    const emptyState = document.getElementById('contactsEmptyState');
    const contacts = Object.values(selectedContacts);

    if (contacts.length === 0) {
        contactsList.innerHTML = '';
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        contactsList.innerHTML = '';

        contacts.forEach(contact => {
            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const contactDiv = document.createElement('div');
            contactDiv.className = 'contact-card';
            contactDiv.innerHTML = `
                <div class="contact-avatar">${initials}</div>
                <p class="contact-name">${escapeHtml(contact.name)}</p>
                ${contact.alias && contact.alias !== contact.name ? `<p class="contact-alias">"${escapeHtml(contact.alias)}"</p>` : ''}
                <p class="contact-email">${escapeHtml(contact.email)}</p>
                <div class="contact-actions">
                    <button class="btn-contact-action" onclick="openChat(${contact.id}, '${escapeHtml(contact.name).replace(/'/g, "\\'")}', '${escapeHtml(contact.email).replace(/'/g, "\\'")}')" title="Chatear">
                        <i class="bi bi-chat-dots"></i> Chat
                    </button>
                    <button class="btn-contact-action btn-delete" onclick="deleteContactAndRender(${contact.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            contactsList.appendChild(contactDiv);
        });
    }
}

function deleteContactAndRender(contactId) {
    if (confirm('¿Eliminar este contacto?')) {
        deleteContact(contactId);
        renderContacts();
    }
}

function openAddContactForm() {
    const modal = document.getElementById('addContactModal');
    document.getElementById('contactName').value = '';
    document.getElementById('contactAlias').value = '';
    document.getElementById('contactEmail').value = '';
    modal.style.display = 'block';
    document.getElementById('contactName').focus();
}

function closeAddContactModal() {
    document.getElementById('addContactModal').style.display = 'none';
}

function saveNewContact() {
    const name = document.getElementById('contactName').value.trim();
    const alias = document.getElementById('contactAlias').value.trim();
    const email = document.getElementById('contactEmail').value.trim();

    if (!name) {
        alert('Por favor ingresa el nombre del contacto.');
        return;
    }

    if (!email || !email.includes('@')) {
        alert('Por favor ingresa un correo electrónico válido.');
        return;
    }

    if (addContact(name, email, alias)) {
        closeAddContactModal();
        renderContacts();
    }
}

function openChat(contactId, contactName, contactEmail) {
    currentChatContactId = contactId;
    
    document.getElementById('chatContactName').textContent = contactName;
    document.getElementById('chatContactEmail').textContent = contactEmail;
    
    // Verificar autorización de Gmail
    checkGmailAuthorization();
    
    renderChatMessages();
    document.getElementById('chatModal').style.display = 'block';
    document.getElementById('chatInput').focus();
}

function closeChat() {
    document.getElementById('chatModal').style.display = 'none';
    currentChatContactId = null;
}

// Verificar si Gmail está autorizado
function checkGmailAuthorization() {
    // Consulta al servidor si hay tokens válidos para enviar correos
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            const authStatus = document.getElementById('chatAuthStatus');
            if (!data.authorized) {
                authStatus.style.display = 'block';
            } else {
                authStatus.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error verificando autorización:', err);
            document.getElementById('chatAuthStatus').style.display = 'block';
        });
}

/**
 * Enviar correo de prueba al contacto abierto en el chat.
 * Rellena asunto y mensaje y llama a `sendMessage()` para usar la lógica existente.
 */
function sendTestEmail() {
    const contact = selectedContacts[currentChatContactId];
    if (!contact) {
        alert('Selecciona un contacto primero para enviar la prueba.');
        return;
    }

    document.getElementById('chatSubject').value = 'Prueba desde Proyecto1';
    document.getElementById('chatInput').value = 'Este es un correo de prueba enviado desde la UI.';
    // Llamamos a la misma función que maneja el envío real
    sendMessage();
}

function renderChatMessages() {
    if (!currentChatContactId) return;

    const chatMessages = document.getElementById('chatMessages');
    const messages = selectedMessages[currentChatContactId] || [];

    chatMessages.innerHTML = '';

    if (messages.length === 0) {
        chatMessages.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">No hay mensajes aún. ¡Inicia la conversación!</div>';
        return;
    }

    messages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        
        // Mensajes del sistema
        if (msg.isSystemMessage) {
            messageDiv.className = 'chat-message system-message';
            messageDiv.innerHTML = `
                <div class="chat-message-content" style="text-align: center; color: var(--muted); font-size: 0.9rem;">
                    ${escapeHtml(msg.text)}
                </div>
            `;
        } else {
            messageDiv.className = `chat-message ${msg.sent ? 'sent' : 'received'}`;
            let content = `
                <div class="chat-message-content">${escapeHtml(msg.text)}</div>
            `;
            
            // Mostrar asunto en el primer mensaje enviado
            if (msg.sent && msg.subject && (index === 0 || !messages[index - 1]?.subject)) {
                content = `
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent); margin-bottom: 0.5rem;">
                        Asunto: ${escapeHtml(msg.subject)}
                    </div>
                    ${content}
                `;
            }
            
            messageDiv.innerHTML = content;
        }
        
        chatMessages.appendChild(messageDiv);
    });

    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    if (!currentChatContactId) return;

    const chatInput = document.getElementById('chatInput');
    const chatSubject = document.getElementById('chatSubject');
    const messageText = chatInput.value.trim();
    const subject = chatSubject.value.trim();

    if (!messageText || !subject) {
        alert('Por favor completa el asunto y el mensaje');
        return;
    }

    if (!selectedMessages[currentChatContactId]) {
        selectedMessages[currentChatContactId] = [];
    }

    // Agregar mensaje del usuario
    selectedMessages[currentChatContactId].push({
        text: messageText,
        sent: true,
        subject: subject,
        timestamp: new Date().toISOString()
    });

    saveMessages();
    renderChatMessages();
    
    // Mostrar indicador de envío
    const sendBtn = document.getElementById('sendMessageBtn');
    const originalHTML = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

    // Obtener el email del contacto
    const contact = selectedContacts[currentChatContactId];
    const contactEmail = contact?.email || '';

    // Enviar el correo al servidor
    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: contactEmail,
            subject: subject,
            message: messageText
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Agregar confirmación en el chat
            selectedMessages[currentChatContactId].push({
                text: '✅ Correo enviado exitosamente',
                sent: false,
                isSystemMessage: true,
                timestamp: new Date().toISOString()
            });
        } else {
            // Mostrar error si ocurrió
            selectedMessages[currentChatContactId].push({
                text: '❌ Error: ' + (data.error || 'No autorizado. Por favor autoriza Gmail primero.'),
                sent: false,
                isSystemMessage: true,
                timestamp: new Date().toISOString()
            });
        }
        saveMessages();
        renderChatMessages();
    })
    .catch(err => {
        console.error('Error enviando correo:', err);
        selectedMessages[currentChatContactId].push({
            text: '❌ Error: ' + err.message + '. ¿Está el servidor iniciado?',
            sent: false,
            isSystemMessage: true,
            timestamp: new Date().toISOString()
        });
        saveMessages();
        renderChatMessages();
    })
    .finally(() => {
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalHTML;
        chatInput.value = '';
        chatSubject.value = '';
    });
}

// ===== FUNCIONES DE PESTAÑAS =====

function switchTab(tabName) {
    currentTab = tabName;

    // Actualizar pestañas activas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

    // Actualizar contenido visible
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`section${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

    // Mostrar/ocultar botones de acción según la pestaña
    const btnToday = document.getElementById('btnToday');
    const btnAddEvent = document.getElementById('btnAddEvent');
    const btnAddNote = document.getElementById('btnAddNote');
    const btnAddContact = document.getElementById('btnAddContact');

    if (tabName === 'calendar') {
        btnToday.style.display = 'inline-flex';
        btnAddEvent.style.display = 'inline-flex';
        btnAddNote.style.display = 'none';
        btnAddContact.style.display = 'none';
    } else if (tabName === 'notes') {
        btnToday.style.display = 'none';
        btnAddEvent.style.display = 'none';
        btnAddNote.style.display = 'inline-flex';
        btnAddContact.style.display = 'none';
    } else if (tabName === 'contacts') {
        btnToday.style.display = 'none';
        btnAddEvent.style.display = 'none';
        btnAddNote.style.display = 'none';
        btnAddContact.style.display = 'inline-flex';
    }
}

// ===== EVENT LISTENERS =====

function initializeApp() {
    loadEvents();
    loadNotes();
    loadContacts();
    renderCalendar();
    renderNotes();
    renderContacts();
    updateStateDisplay();

    // Toggle de estado
    document.getElementById('stateToggle').addEventListener('change', updateStateDisplay);

    // Cambio de pestañas
    document.getElementById('tabCalendar').addEventListener('click', () => switchTab('calendar'));
    document.getElementById('tabNotes').addEventListener('click', () => switchTab('notes'));
    document.getElementById('tabContacts').addEventListener('click', () => switchTab('contacts'));

    // Navegación de meses
    document.getElementById('btnPrevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('btnNextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Botones de acción
    document.getElementById('btnToday').addEventListener('click', () => {
        currentDate = new Date(2026, 1, 15);
        renderCalendar();
    });

    document.getElementById('btnAddEvent').addEventListener('click', openAddEventForm);
    document.getElementById('btnAddNote').addEventListener('click', openAddNoteForm);
    document.getElementById('btnAddContact').addEventListener('click', openAddContactForm);

    // Toggle de sección ELSE
    document.getElementById('elseHeader').addEventListener('click', () => {
        document.getElementById('elseContainer').classList.toggle('collapsed');
    });

    // Modal de eventos
    document.getElementById('closeEventModal').addEventListener('click', closeEventModal);
    document.getElementById('addEventBtn').addEventListener('click', openAddEventForm);

    // Modal de agregar evento
    document.getElementById('closeAddEventModal').addEventListener('click', closeAddEventModal);
    document.getElementById('saveEventBtn').addEventListener('click', saveNewEvent);

    // Modal de agregar nota
    document.getElementById('closeAddNoteModal').addEventListener('click', closeAddNoteModal);
    document.getElementById('saveNoteBtn').addEventListener('click', saveNewNote);

    // Modal de agregar contacto
    document.getElementById('closeAddContactModal').addEventListener('click', closeAddContactModal);
    document.getElementById('saveContactBtn').addEventListener('click', saveNewContact);

    // Modal de chat
    document.getElementById('closeChatModal').addEventListener('click', closeChat);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    // Botón para enviar correo de prueba rápido
    const sendTestBtn = document.getElementById('sendTestBtn');
    if (sendTestBtn) sendTestBtn.addEventListener('click', sendTestEmail);

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        const eventModal = document.getElementById('eventModal');
        const addEventModal = document.getElementById('addEventModal');
        const addNoteModal = document.getElementById('addNoteModal');
        const addContactModal = document.getElementById('addContactModal');
        const chatModal = document.getElementById('chatModal');

        if (e.target === eventModal) {
            closeEventModal();
        }
        if (e.target === addEventModal) {
            closeAddEventModal();
        }
        if (e.target === addNoteModal) {
            closeAddNoteModal();
        }
        if (e.target === addContactModal) {
            closeAddContactModal();
        }
        if (e.target === chatModal) {
            closeChat();
        }
    });

    // Presionar Enter en formularios
    document.getElementById('eventTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveNewEvent();
        }
    });

    document.getElementById('noteTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveNewNote();
        }
    });

    document.getElementById('contactEmail').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveNewContact();
        }
    });

    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Actualizar hora cada minuto
    setInterval(() => {
        document.getElementById('lastUpdate').textContent = 'Hace unos momentos';
    }, 60000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);
