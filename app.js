// --- Constants & Config ---
const CATEGORIES = {
    Personal: { color: 'from-pink-500 to-rose-500', base: 'text-pink-500', bg: 'bg-pink-500', glow: 'rgba(236, 72, 153, 0.4)' },
    Work: { color: 'from-cyan-500 to-blue-500', base: 'text-cyan-500', bg: 'bg-cyan-500', glow: 'rgba(6, 182, 212, 0.4)' },
    Creative: { color: 'from-violet-500 to-purple-500', base: 'text-violet-500', bg: 'bg-violet-500', glow: 'rgba(139, 92, 246, 0.4)' },
    Urgent: { color: 'from-amber-400 to-orange-500', base: 'text-amber-500', bg: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.4)' }
};

const MOODS = {
    'High Energy': { icon: 'zap', theme: 'text-yellow-400' },
    'Neutral': { icon: 'coffee', theme: 'text-slate-400' },
    'Low Energy': { icon: 'battery', theme: 'text-emerald-400' }
};

const EMOJIS = ['🚀', '💡', '🔥', '🎯', '🎨', '✨', '💪', '🏆', '⭐', '😁'];

// --- State ---
let state = {
    user: null, // Current user object
    todos: [],
    appName: '',
    viewMode: 'Daily',
    currentMood: 'Neutral',
    selectedCategory: 'Personal',

    timer: {
        active: false,
        timeLeft: 1500,
        taskId: null,
        interval: null
    }
};

const DB_KEY = 'beltagy_users_v2';
const SESSION_KEY = 'beltagy_session';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initEmojis();
    initMoodSelector();
    initCategoryDock();
    initCharts();

    // Listeners
    document.getElementById('app-name-input').addEventListener('input', (e) => {
        state.appName = e.target.value;
        saveUserData();
    });
});

// --- Auth System ---

function checkSession() {
    const sessionUser = localStorage.getItem(SESSION_KEY);
    if (sessionUser) {
        // Validation: ensure user exists
        const db = getUsersDB();
        if (db[sessionUser]) {
            loginUser(sessionUser);
        } else {
            document.getElementById('auth-modal').classList.remove('hidden');
        }
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
}

function getUsersDB() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
}

function handleLogin() {
    const u = document.getElementById('auth-username').value.trim();
    const p = document.getElementById('auth-password').value.trim();
    const err = document.getElementById('auth-error');

    if (!u || !p) {
        err.innerText = "Please fill in all fields.";
        err.classList.remove('hidden');
        return;
    }

    const db = getUsersDB();
    if (db[u] && db[u].password === p) {
        loginUser(u);
    } else {
        err.innerText = "Invalid credentials.";
        err.classList.remove('hidden');
    }
}

function handleRegister() {
    const u = document.getElementById('auth-username').value.trim();
    const p = document.getElementById('auth-password').value.trim();
    const err = document.getElementById('auth-error');

    if (!u || !p) {
        err.innerText = "Please fill in all fields.";
        err.classList.remove('hidden');
        return;
    }

    const db = getUsersDB();
    if (db[u]) {
        err.innerText = "User already exists.";
        err.classList.remove('hidden');
        return;
    }

    // Create User
    db[u] = {
        password: p,
        todos: [],
        appName: '',
        mood: 'Neutral'
    };

    localStorage.setItem(DB_KEY, JSON.stringify(db));
    loginUser(u);
}

function loginUser(username) {
    const db = getUsersDB();
    const userData = db[username];

    state.user = username;
    state.todos = userData.todos || [];
    state.appName = userData.appName || '';
    state.currentMood = userData.mood || 'Neutral';
    state.selectedCategory = userData.selectedCategory || 'Personal';

    localStorage.setItem(SESSION_KEY, username);

    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app-name-input').value = state.appName;
    setMood(state.currentMood);
    setCategory(state.selectedCategory); // Trigger visual update
    initCategoryDock();
    render();
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

function saveUserData() {
    if (!state.user) return;

    const db = getUsersDB();
    if (db[state.user]) {
        db[state.user].todos = state.todos;
        db[state.user].appName = state.appName;
        db[state.user].mood = state.currentMood;
        db[state.user].selectedCategory = state.selectedCategory;
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    render();
}

// --- App Logic ---

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;

    let colorClass = CATEGORIES[state.selectedCategory].color;
    if (state.currentMood === 'Low Energy') {
        colorClass = 'from-teal-500 to-emerald-500';
    }

    const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        category: state.selectedCategory,
        colorClass: colorClass,
        viewMode: state.viewMode,
        createdAt: Date.now()
    };

    state.todos.unshift(newTodo);
    input.value = '';
    saveUserData();
}

function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveUserData();
    }
}

function deleteTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveUserData();
}

function switchView(mode) {
    state.viewMode = mode;
    // Update buttons
    document.getElementById('btn-daily').className = mode === 'Daily'
        ? 'px-6 py-2 rounded-lg text-sm font-medium transition-all bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
        : 'px-6 py-2 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-white';

    document.getElementById('btn-weekly').className = mode === 'Weekly'
        ? 'px-6 py-2 rounded-lg text-sm font-medium transition-all bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
        : 'px-6 py-2 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-white';

    render();
}

function setMood(mood) {
    state.currentMood = mood;
    // Rerender mood selector
    const container = document.getElementById('mood-selector');
    Array.from(container.children).forEach(btn => {
        const isSelected = btn.dataset.mood === mood;
        btn.className = `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${isSelected
            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
            }`;
    });
    // Don't save here to avoid spamming writes, save on action or unload better, but for now simple:
    saveUserData();
}

function setCategory(cat) {
    state.selectedCategory = cat;
    initCategoryDock();

    // Visual Feedback on Input
    const inputContainer = document.querySelector('#todo-input').parentNode;
    const config = CATEGORIES[cat];

    // Apply Glow
    inputContainer.style.borderColor = config.glow.replace('0.4', '1'); // more opacity borders
    inputContainer.style.boxShadow = `0 0 20px ${config.glow}`;
    inputContainer.style.transition = 'all 0.4s ease';
}

// --- Rendering ---

function render() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    const filtered = state.todos.filter(t => t.viewMode === state.viewMode);

    if (filtered.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('flex');
    } else {
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('flex');

        filtered.forEach(todo => {
            const el = document.createElement('div');
            el.className = `group relative bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 rounded-2xl p-4 transition-all duration-300 ${todo.completed ? 'opacity-50' : ''}`;

            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <button onclick="toggleTodo('${todo.id}')" 
                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${todo.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-600 hover:border-white'
                }">
                        ${todo.completed ? '<i data-lucide="check" class="w-3 h-3 text-white"></i>' : ''}
                    </button>
                    
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate ${todo.completed ? 'text-slate-500 line-through' : 'text-white'}">
                            ${todo.text}
                        </p>
                        <p class="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r ${todo.colorClass}"></span>
                            ${todo.category}
                        </p>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="openTimer('${todo.id}')" class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Focus Mode">
                            <i data-lucide="play" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteTodo('${todo.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(el);
        });
        lucide.createIcons();
    }
}

// --- DOM Init ---

function initEmojis() {
    const container = document.getElementById('emoji-container');
    for (let i = 0; i < 15; i++) {
        const el = document.createElement('div');
        el.className = 'emoji-float';
        el.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (15 + Math.random() * 15) + 's';
        el.style.animationDelay = (Math.random() * 5) + 's';
        el.style.fontSize = (20 + Math.random() * 20) + 'px';
        container.appendChild(el);
    }
}

function initMoodSelector() {
    const container = document.getElementById('mood-selector');
    Object.keys(MOODS).forEach(mood => {
        const btn = document.createElement('button');
        btn.dataset.mood = mood;
        btn.onclick = () => setMood(mood);
        const config = MOODS[mood];
        btn.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4 ${config.theme}"></i> ${mood}`;
        container.appendChild(btn);
    });
}

function initCategoryDock() {
    const dock = document.getElementById('category-dock');
    dock.innerHTML = '';

    Object.keys(CATEGORIES).forEach(cat => {
        const btn = document.createElement('button');
        const isActive = state.selectedCategory === cat;
        // Styles: Active gets brighter bg and scale
        const baseClass = "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2";
        const activeClass = isActive
            ? `bg-white/20 text-white scale-105 shadow-lg border border-white/20`
            : `hover:bg-white/10 text-slate-400 hover:text-white`;

        btn.className = `${baseClass} ${activeClass}`;

        // Dot Color
        const dotBg = CATEGORIES[cat].bg;

        btn.innerHTML = `<span class="w-2 h-2 rounded-full ${dotBg}"></span> ${cat}`;
        btn.onclick = () => setCategory(cat);
        dock.appendChild(btn);
    });
}

function handleInputKey(e) {
    if (e.key === 'Enter') addTodo();
}

function initCharts() { /* Placeholder */ }

// --- Focus Timer (Simplified for brevity, similar to before) ---
function openTimer(todoId) {
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo) return;
    state.timer.active = false; state.timer.timeLeft = 1500; state.timer.taskId = todoId;
    if (state.timer.interval) clearInterval(state.timer.interval);
    document.getElementById('timer-modal').classList.remove('hidden');
    document.getElementById('timer-task-text').innerText = todo.text;
    document.getElementById('timer-quote').innerText = getClientEncouragement(todo.text, state.currentMood);
    updateTimerDisplay();
}
function closeTimer() {
    state.timer.active = false;
    if (state.timer.interval) clearInterval(state.timer.interval);
    document.getElementById('timer-modal').classList.add('hidden');
}
function toggleTimerState() {
    state.timer.active = !state.timer.active;
    const btn = document.getElementById('timer-toggle-btn');
    if (state.timer.active) {
        btn.innerHTML = '<i data-lucide="pause" class="w-8 h-8 fill-current"></i>';
        lucide.createIcons();
        state.timer.interval = setInterval(() => {
            if (state.timer.timeLeft > 0) { state.timer.timeLeft--; updateTimerDisplay(); }
            else { clearInterval(state.timer.interval); state.timer.active = false; btn.innerHTML = '<i data-lucide="play" class="w-8 h-8 fill-current translate-x-1"></i>'; lucide.createIcons(); }
        }, 1000);
    } else {
        clearInterval(state.timer.interval);
        btn.innerHTML = '<i data-lucide="play" class="w-8 h-8 fill-current translate-x-1"></i>';
        lucide.createIcons();
    }
}
function updateTimerDisplay() {
    const m = Math.floor(state.timer.timeLeft / 60).toString().padStart(2, '0');
    const s = (state.timer.timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').innerText = `${m}:${s}`;
    const total = 1500;
    const progress = 1 - (state.timer.timeLeft / total);
    const ring = document.getElementById('timer-progress-ring');
    const circumference = 2 * Math.PI * 120;
    ring.style.strokeDashoffset = circumference * (1 - progress);
}
function getClientEncouragement(task, mood) {
    const msgs = ["You got this! 🎯", "Keep crushing it! 🚀", "Laser focus mode! ⚡"];
    if (mood === 'Low Energy') return "Small steps. Breathe. 🌿";
    return msgs[Math.floor(Math.random() * msgs.length)];
}

// --- Stats (Simplified) ---
let chartInstances = {};
function toggleStats() {
    const modal = document.getElementById('stats-modal');
    if (modal.classList.contains('hidden')) { modal.classList.remove('hidden'); updateStats(); } else { modal.classList.add('hidden'); }
}
function updateStats() {
    const completed = state.todos.filter(t => t.completed);
    document.getElementById('stat-completed').innerText = completed.length;
    document.getElementById('stat-xp').innerText = (completed.length * 100) + ' XP';

    const catCounts = { Personal: 0, Work: 0, Creative: 0, Urgent: 0 };
    completed.forEach(t => { if (catCounts[t.category] !== undefined) catCounts[t.category]++; });

    // Check if Chart is defined (script loaded)
    if (typeof Chart === 'undefined') return;

    const barCtx = document.getElementById('barChart').getContext('2d');
    if (chartInstances.bar) chartInstances.bar.destroy();

    chartInstances.bar = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(catCounts),
            datasets: [{ label: 'Tasks', data: Object.values(catCounts), backgroundColor: ['#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b'], borderRadius: 4 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }
    });

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    if (chartInstances.line) chartInstances.line.destroy();

    chartInstances.line = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Today'],
            datasets: [{ label: 'Productivity', data: [1, 2, 1, 3, 4, completed.length], borderColor: '#a855f7', tension: 0.4 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }
    });
}
