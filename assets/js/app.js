const STORAGE_KEY = 'et-classes';
const RESERVATIONS_KEY = 'et-user-reservations';
const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

const defaultClasses = [
  {
    id: 'c1',
    name: 'HIIT Energía Total',
    type: 'Cardio',
    date: getNextOccurrence(2, '07:00'),
    time: '07:00',
    duration: 45,
    instructor: 'Valeria Soto',
    capacity: 20,
    reserved: 12,
    room: 'Studio A'
  },
  {
    id: 'c2',
    name: 'Fuerza Funcional',
    type: 'Fuerza',
    date: getNextOccurrence(3, '18:00'),
    time: '18:00',
    duration: 50,
    instructor: 'Diego Paz',
    capacity: 16,
    reserved: 16,
    room: 'Studio B'
  },
  {
    id: 'c3',
    name: 'Flow de Yoga',
    type: 'Cuerpo y mente',
    date: getNextOccurrence(4, '08:30'),
    time: '08:30',
    duration: 60,
    instructor: 'Noelia Luna',
    capacity: 22,
    reserved: 9,
    room: 'Salón Zen'
  },
  {
    id: 'c4',
    name: 'Ciclismo Indoor',
    type: 'Cardio',
    date: getNextOccurrence(5, '19:00'),
    time: '19:00',
    duration: 40,
    instructor: 'Santiago Vera',
    capacity: 28,
    reserved: 24,
    room: 'Cycle Room'
  },
  {
    id: 'c5',
    name: 'Entrenamiento Funcional',
    type: 'Fuerza',
    date: getNextOccurrence(6, '09:30'),
    time: '09:30',
    duration: 55,
    instructor: 'Julieta Funes',
    capacity: 18,
    reserved: 10,
    room: 'Terraza Activa'
  },
  {
    id: 'c6',
    name: 'Pilates Mat',
    type: 'Cuerpo y mente',
    date: getNextOccurrence(1, '07:30'),
    time: '07:30',
    duration: 50,
    instructor: 'Pablo Ríos',
    capacity: 15,
    reserved: 6,
    room: 'Studio C'
  }
];

function getNextOccurrence(weekday, time) {
  const now = new Date();
  const currentWeekday = now.getDay();
  const diff = (weekday + 7 - currentWeekday) % 7 || 7;
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + diff);
  const [hours, minutes] = time.split(':').map(Number);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate.toISOString().slice(0, 10);
}

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses));
  }
  if (!localStorage.getItem(RESERVATIONS_KEY)) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([]));
  }
}

function getClasses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveClasses(classes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

function getReservations() {
  return JSON.parse(localStorage.getItem(RESERVATIONS_KEY)) || [];
}

function saveReservations(reservations) {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return DATE_FORMATTER.format(date);
}

function findClassById(classId) {
  return getClasses().find((item) => item.id === classId);
}

function getAvailabilityStatus(classItem) {
  const spotsLeft = classItem.capacity - classItem.reserved;
  const isAvailable = spotsLeft > 0;
  return {
    spotsLeft,
    isAvailable,
    label: isAvailable ? 'Cupos disponibles' : 'Cupos completos'
  };
}

function renderSchedule(container) {
  const classes = getClasses().sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const fragment = document.createDocumentFragment();

  if (!classes.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No hay clases programadas por el momento.';
    fragment.appendChild(empty);
  } else {
    classes.forEach((classItem) => {
      const article = document.createElement('article');
      article.className = 'card fade-in';
      article.innerHTML = `
        <div class="chip-group">
          <span class="tag">${classItem.type}</span>
          <span class="chip">${formatDate(classItem.date)}</span>
          <span class="chip">${classItem.time} hs · ${classItem.duration} min</span>
        </div>
        <h3>${classItem.name}</h3>
        <p>${classItem.instructor} · ${classItem.room}</p>
        <p class="badge-pill">${getAvailabilityStatus(classItem).spotsLeft} lugares libres</p>
      `;
      fragment.appendChild(article);
    });
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}

function filterClasses({ type, date, time }) {
  return getClasses().filter((classItem) => {
    const matchesType = type ? classItem.type === type : true;
    const matchesDate = date ? classItem.date === date : true;
    const matchesTime = time ? classItem.time === time : true;
    return matchesType && matchesDate && matchesTime;
  });
}

function renderSearchResults(container, results) {
  container.innerHTML = '';
  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No encontramos clases con esos filtros. Probá con otra combinación.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'card-grid';
  results.forEach((classItem) => {
    const status = getAvailabilityStatus(classItem);
    const card = document.createElement('article');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="chip-group">
        <span class="tag">${classItem.type}</span>
        <span class="chip">${formatDate(classItem.date)}</span>
        <span class="chip">${classItem.time} hs</span>
      </div>
      <h3>${classItem.name}</h3>
      <p>${classItem.instructor} · ${classItem.room}</p>
      <p class="chip">Duración: ${classItem.duration} min</p>
      <p class="badge-pill">${status.spotsLeft} lugares libres</p>
      <button class="btn btn-primary" data-action="reserve" data-id="${classItem.id}">
        Reservar cupo
      </button>
    `;
    list.appendChild(card);
  });
  container.appendChild(list);
}

function renderReservationTable(container) {
  const classes = getClasses();
  const reservations = getReservations();
  container.innerHTML = '';

  if (!classes.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Todavía no cargamos clases. Volvé a intentarlo en unos minutos.';
    container.appendChild(empty);
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Clase</th>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Instructor</th>
        <th>Disponibilidad</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  classes
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .forEach((classItem) => {
      const status = getAvailabilityStatus(classItem);
      const isReserved = reservations.includes(classItem.id);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <strong>${classItem.name}</strong>
          <div class="chip">${classItem.type}</div>
        </td>
        <td>${formatDate(classItem.date)}</td>
        <td>${classItem.time} hs</td>
        <td>${classItem.instructor}</td>
        <td>
          <span class="status ${status.isAvailable ? 'available' : 'full'}">
            ${status.spotsLeft} libres
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="reserve" data-action="reserve" data-id="${classItem.id}" ${
              status.isAvailable && !isReserved ? '' : 'disabled'
            }>Reservar</button>
            <button class="cancel" data-action="cancel" data-id="${classItem.id}" ${
              isReserved ? '' : 'disabled'
            }>Cancelar</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

  container.appendChild(table);
}

function renderMyReservations(container) {
  const reservations = getReservations();
  const classes = getClasses().filter((item) => reservations.includes(item.id));
  container.innerHTML = '';

  if (!classes.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Todavía no reservaste ninguna clase. Elegí una en la tabla para empezar.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'timeline';
  classes
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .forEach((classItem) => {
      const status = getAvailabilityStatus(classItem);
      const item = document.createElement('article');
      item.className = 'timeline-item fade-in';
      item.innerHTML = `
        <h4>${classItem.name}</h4>
        <span>${formatDate(classItem.date)} · ${classItem.time} hs</span>
        <p>${classItem.instructor} · ${classItem.room}</p>
        <p class="badge-pill">${status.spotsLeft} lugares disponibles</p>
      `;
      list.appendChild(item);
    });
  container.appendChild(list);
}

function handleReservationAction(classId, action) {
  const classes = getClasses();
  const reservations = getReservations();
  const classIndex = classes.findIndex((item) => item.id === classId);
  if (classIndex === -1) {
    return { success: false, message: 'La clase seleccionada ya no está disponible.' };
  }

  const classItem = classes[classIndex];
  const status = getAvailabilityStatus(classItem);

  if (action === 'reserve') {
    if (!status.isAvailable) {
      return { success: false, message: 'La clase está completa. Elegí otra opción.' };
    }
    if (reservations.includes(classId)) {
      return { success: false, message: 'Ya tenés un cupo reservado en esta clase.' };
    }
    classItem.reserved += 1;
    classes.splice(classIndex, 1, classItem);
    reservations.push(classId);
    saveClasses(classes);
    saveReservations(reservations);
    return {
      success: true,
      message: '¡Listo! Guardamos tu reserva y actualizamos los cupos en tiempo real.'
    };
  }

  if (action === 'cancel') {
    if (!reservations.includes(classId)) {
      return { success: false, message: 'No encontramos una reserva activa para cancelar.' };
    }
    classItem.reserved = Math.max(0, classItem.reserved - 1);
    classes.splice(classIndex, 1, classItem);
    const updatedReservations = reservations.filter((id) => id !== classId);
    saveClasses(classes);
    saveReservations(updatedReservations);
    return {
      success: true,
      message: 'Cancelamos tu reserva. Los cupos quedaron actualizados al instante.'
    };
  }

  return { success: false, message: 'No pudimos procesar la acción solicitada.' };
}

function bindGlobalReserveButtons() {
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const classId = target.dataset.id;

    if (!action || !classId) return;

    const feedback = document.querySelector('[data-feedback]');
    const { success, message } = handleReservationAction(classId, action);
    if (feedback) {
      feedback.textContent = message;
      feedback.classList.toggle('error', !success);
      feedback.classList.remove('hidden');
    }

    if (document.querySelector('[data-reservation-table]')) {
      renderReservationTable(document.querySelector('[data-reservation-table]'));
    }
    if (document.querySelector('[data-my-reservations]')) {
      renderMyReservations(document.querySelector('[data-my-reservations]'));
    }
    if (document.querySelector('[data-search-results]')) {
      const filters = readSearchFilters();
      const results = filterClasses(filters);
      renderSearchResults(document.querySelector('[data-search-results]'), results);
    }
  });
}

function readSearchFilters() {
  const type = document.querySelector('[name="type"]')?.value || '';
  const date = document.querySelector('[name="date"]')?.value || '';
  const time = document.querySelector('[name="time"]')?.value || '';
  return { type, date, time };
}

function populateSelectOptions() {
  const classes = getClasses();
  const typeSelect = document.querySelector('[name="type"]');
  const timeSelect = document.querySelector('[name="time"]');
  const uniqueTypes = [...new Set(classes.map((item) => item.type))];
  const uniqueTimes = [...new Set(classes.map((item) => item.time))].sort();

  if (typeSelect) {
    uniqueTypes.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
  }

  if (timeSelect) {
    uniqueTimes.forEach((time) => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = `${time} hs`;
      timeSelect.appendChild(option);
    });
  }
}

function initHome() {
  const scheduleContainer = document.querySelector('[data-schedule]');
  if (scheduleContainer) {
    renderSchedule(scheduleContainer);
  }
}

function initSearch() {
  populateSelectOptions();
  const resultsContainer = document.querySelector('[data-search-results]');
  const filters = readSearchFilters();
  renderSearchResults(resultsContainer, filterClasses(filters));

  const form = document.querySelector('[data-search-form]');
  if (form) {
    form.addEventListener('input', () => {
      const filtersNow = readSearchFilters();
      const results = filterClasses(filtersNow);
      renderSearchResults(resultsContainer, results);
    });
  }
}

function initReservations() {
  const tableContainer = document.querySelector('[data-reservation-table]');
  const myReservationsContainer = document.querySelector('[data-my-reservations]');
  if (tableContainer) {
    renderReservationTable(tableContainer);
  }
  if (myReservationsContainer) {
    renderMyReservations(myReservationsContainer);
  }
}

function initApp() {
  initializeData();
  bindGlobalReserveButtons();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'clases') initSearch();
  if (page === 'reservas') initReservations();
}

document.addEventListener('DOMContentLoaded', initApp);
