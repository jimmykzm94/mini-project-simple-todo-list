const { fromEvent, throttleTime, BehaviorSubject, Subject, switchMap, map, tap } = rxjs;

const apiUrl = 'http://localhost:8000/api/tasks';

// --- STATE ---
const taskActions$ = new Subject(); // stream of actions
const tasks$ = new BehaviorSubject(new Map()); // holds current tasks state array

// --- API PRODUCERS (only emit actions, do not touch DOM/state directly) ---
async function fetchTasks() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    taskActions$.next({ type: 'init', tasks: data });
}

async function addTask(title) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false })
    });
    const data = await response.json();
    taskActions$.next({ type: 'add', task: data });
}

async function deleteTask(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    taskActions$.next({ type: 'delete', id });
}

async function updateTask(id, completed) {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    const data = await response.json();
    taskActions$.next({ type: 'update', task: data });
}

// --- DOM ELEMENTS ---
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearButton = document.getElementById('clearTasks');

// --- CHART INITIALIZATION ---
const ctx = document.getElementById('tasksChart').getContext('2d');
let tasksChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
            label: 'Tasks',
            data: [0, 0], // start with 0
            borderWidth: 1,
            backgroundColor: [
                '#4CAF50', // green for completed
                '#F44336'  // red for pending
            ],
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    }
});

// --- EVENT LISTENERS ---
fromEvent(taskForm, 'submit').pipe(
    throttleTime(2000),
    tap(event => event.preventDefault()),
    map(() => taskInput.value.trim()),
    switchMap(title => {
        if (title) {
            taskInput.value = '';
            return addTask(title);
        }
        return Promise.resolve();
    })
).subscribe();

fromEvent(clearButton, 'click').pipe(
    throttleTime(2000),
    switchMap(() => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            const currentTasks = tasks$.getValue();
            return Promise.all(currentTasks.map(task => deleteTask(task.id)));
        }
        return Promise.resolve();
    })
).subscribe();

// --- SUBSCRIBER: Single place that updates state + DOM ---
taskActions$.subscribe(action => {
    const current = new Map(tasks$.getValue());
    switch (action.type) {
        case 'init': {
            current.clear();
            action.tasks.forEach(t => current.set(t.id, t));
            tasks$.next(current);
            renderAllTasks(action.tasks);
            break;
        }
        case 'add': {
            current.set(action.task.id, action.task);
            tasks$.next(current);
            addTaskCard(action.task);
            break;
        }
        case 'update': {
            current.set(action.task.id, action.task);
            tasks$.next(current);
            updateTaskCard(action.task);
            break;
        }
        case 'delete': {
            current.delete(action.id);
            tasks$.next(current);
            removeTaskCard(action.id);
            break;
        }
    }
});

tasks$.subscribe(taskMap => {
    const tasks = Array.from(taskMap.values());
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    tasksChart.data.datasets[0].data = [completedCount, pendingCount];
    tasksChart.update();
});

// --- DOM HELPER FUNCTIONS ---
function renderAllTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(addTaskCard);
}

function addTaskCard(task) {
    if (document.querySelector(`div.card[data-id='${task.id}']`)) return;

    const card = document.createElement('div');
    card.className = 'card mb-2';
    card.setAttribute('data-id', task.id);
    card.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-center">
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} class="form-check-input me-2">
                <span ${task.completed ? 'style="text-decoration: line-through;"' : ''}>${task.title}</span>
            </div>
            <button class="btn btn-danger btn-sm">Delete</button>
        </div>
    `;

    const checkbox = card.querySelector('input[type="checkbox"]');
    const deleteButton = card.querySelector('button');

    fromEvent(checkbox, 'change')
        .pipe(switchMap(() => updateTask(task.id, checkbox.checked)))
        .subscribe();

    fromEvent(deleteButton, 'click')
        .pipe(
            switchMap(() => {
                if (confirm('Are you sure you want to delete this task?')) {
                    return deleteTask(task.id);
                }
                return Promise.resolve();
            })
        )
        .subscribe();

    taskList.appendChild(card);
}

function updateTaskCard(task) {
    const card = document.querySelector(`div.card[data-id='${task.id}']`);
    if (!card) return;
    const checkbox = card.querySelector('input[type="checkbox"]');
    const titleSpan = card.querySelector('span');
    checkbox.checked = task.completed;
    titleSpan.style.textDecoration = task.completed ? 'line-through' : 'none';
}

function removeTaskCard(id) {
    const card = document.querySelector(`div.card[data-id='${id}']`);
    if (card) card.remove();
}

// --- INITIAL LOAD ---
fetchTasks();