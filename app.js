
// --- Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, orderBy, serverTimestamp, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { ATHKAR_MORNING, ATHKAR_EVENING } from "./athkar_data.js";

// --- Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Constants & Config ---
const CATEGORIES = {
    Personal: { color: 'from-pink-500 to-rose-500', base: 'text-pink-500', bg: 'bg-pink-500', glow: 'rgba(236, 72, 153, 0.4)' },
    Work: { color: 'from-sky-500 to-blue-600', base: 'text-sky-500', bg: 'bg-sky-500', glow: 'rgba(14, 165, 233, 0.4)' },
    Learning: { color: 'from-violet-500 to-purple-600', base: 'text-violet-500', bg: 'bg-violet-500', glow: 'rgba(139, 92, 246, 0.4)' },
    Shopping: { color: 'from-teal-400 to-emerald-500', base: 'text-teal-500', bg: 'bg-teal-500', glow: 'rgba(20, 184, 166, 0.4)' },
    Health: { color: 'from-green-500 to-emerald-600', base: 'text-green-500', bg: 'bg-green-500', glow: 'rgba(34, 197, 94, 0.4)' },
    Ideas: { color: 'from-amber-400 to-yellow-500', base: 'text-amber-500', bg: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.4)' }
};

const MOODS = {
    'High Energy': { icon: 'zap', theme: 'text-yellow-400' },
    'Neutral': { icon: 'coffee', theme: 'text-slate-400' },
    'Low Energy': { icon: 'battery', theme: 'text-emerald-400' }
};

const EMOJIS = ['🚀', '💡', '🔥', '🎯', '🎨', '✨', '💪', '🏆', '⭐', '😁'];

const TRANSLATIONS = {
    en: {
        title: "Beltagy To Do 🚀",
        appNamePlaceholder: "Name your workspace...",
        inputPlaceholder: "What's your next win?",
        daily: "Daily",
        weekly: "Weekly",
        emptyTitle: "All clear for now!",
        emptySub: "Enjoy the space or add a new goal.",
        welcome: "Welcome Back",
        subtitle: "Sign in to sync your creative space.",
        username: "Email",
        password: "Password",
        enter: "Enter Workspace 🚀",
        or: "OR",
        createAccount: "Create New Account",
        logout: "Log Out",
        statsTitle: "Your Analytics",
        totalScore: "Total Score",
        tasksDone: "Tasks Done",
        rate: "Completion Rate",
        focusDist: "Focus Distribution",
        prodTrend: "Productivity Trend",
        loginError: "Invalid email or password.",
        registerError: "Error creating account. Email used?",
        fillFields: "Please fill in all fields.",
        taskName: "Task Name",
        loadingEnc: "Loading encouragement...",
        athkar: "Athkar",
        morningAthkar: "Morning Athkar",
        eveningAthkar: "Evening Athkar",
        resetCounts: "Reset Counts",
        repetitions: "Repetitions",
        guestLogin: "Continue as Guest",
        moodHigh: "High Energy",
        moodNeutral: "Neutral",
        moodLow: "Low Energy",
        Personal: "Personal",
        Work: "Work",
        Learning: "Learning",
        Shopping: "Shopping",
        Health: "Health",
        Ideas: "Ideas"
    },
    ar: {
        title: "مهام بلتاجي 🚀",
        appNamePlaceholder: "سمِّ مساحتك الخاصة...",
        inputPlaceholder: "ما هو إنجازك القادم؟",
        daily: "يومي",
        weekly: "أسبوعي",
        emptyTitle: "كل شيء نظيف حالياً!",
        emptySub: "استمتع بوقتك أو أضف هدفاً جديداً.",
        welcome: "أهلاً بك مجدداً",
        subtitle: "سجل الدخول لمزامنة مساحتك الإبداعية.",
        username: "البريد الإلكتروني",
        password: "كلمة المرور",
        enter: "ادخل المساحة 🚀",
        or: "أو",
        createAccount: "إنشاء حساب جديد",
        logout: "تسجيل خروج",
        statsTitle: "تحليلاتك",
        totalScore: "النقاط الكلية",
        tasksDone: "المهام المنجزة",
        rate: "معدل الإنجاز",
        focusDist: "توزيع التركيز",
        prodTrend: "اتجاه الإنتاجية",
        loginError: "البريد أو كلمة المرور غير صحيحة.",
        registerError: "خطأ في الإنشاء. هل البريد مستخدم؟",
        fillFields: "يرجى ملء جميع الحقول.",
        taskName: "اسم المهمة",
        loadingEnc: "جاري تحميل التحفيز...",
        athkar: "الأذكار",
        morningAthkar: "أذكار الصباح",
        eveningAthkar: "أذكار المساء",
        resetCounts: "إعادة تعيين العداد",
        repetitions: "التكرار",
        guestLogin: "تابع كضيف",
        moodHigh: "طاقة عالية",
        moodNeutral: "طبيعي",
        moodLow: "طاقة منخفضة",
        Personal: "شخصي",
        Work: "عمل",
        Learning: "تعلم",
        Shopping: "مشتريات",
        Health: "صحة",
        Ideas: "أفكار"
    }
};

// --- State ---
let state = {
    user: null, // Firebase Auth User
    todos: [],
    appName: '',
    viewMode: 'Daily',
    currentMood: 'Neutral',
    selectedCategory: 'Personal',
    language: 'en',

    unsubscribeTodos: null,
    unsubscribeUserParams: null,

    timer: {
        active: false,
        timeLeft: 1500,
        taskId: null,
        interval: null
    },
    athkarCounts: {}, // Store current counts
    athkarMode: 'morning' // 'morning' or 'evening'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initEmojis();
    setupEventListeners();

    // Check local pref for language
    const storedLang = localStorage.getItem('beltagy_lang');
    if (storedLang) {
        // This sets state.language and calls render(), initMoodSelector(), initCategoryDock()
        setLanguage(storedLang);
    } else {
        // If no lang stored, we still need to render these at least once
        initMoodSelector();
        initCategoryDock();
        render();
    }

    // FORCE GUEST MODE (Login Removed)
    // If config is missing OR just by default now as requested:
    handleGuestLogin();
});

// --- Auth & Data Listeners ---
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         state.user = user;
//         document.getElementById('auth-modal').classList.add('hidden');
//         subscribeToData();
//     } else {
//         state.user = null;
//         state.todos = [];
//         document.getElementById('auth-modal').classList.remove('hidden');
//         // Unsubscribe if exists
//         if (state.unsubscribeTodos) state.unsubscribeTodos();
//         if (state.unsubscribeUserParams) state.unsubscribeUserParams();
//         render();
//     }
// });

function subscribeToData() {
    if (!state.user) return;

    // 1. Subscribe to Todos
    if (state.user.isGuest) {
        // Load from LocalStorage
        const localTodos = JSON.parse(localStorage.getItem('guest_todos') || '[]');
        state.todos = localTodos;
        render();
        updateStats();
        return;
    }

    const q = query(collection(db, `users/${state.user.uid}/todos`), orderBy('createdAt', 'desc'));
    state.unsubscribeTodos = onSnapshot(q, (snapshot) => {
        state.todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
        updateStats(); // Update stats whenever data changes
    });

    // 2. Subscribe to User Params (AppName, Mood, etc.)
    if (state.user.isGuest) {
        const localPrefs = JSON.parse(localStorage.getItem('guest_prefs') || '{}');
        state.appName = localPrefs.appName || '';
        state.currentMood = localPrefs.mood || 'Neutral';
        state.selectedCategory = localPrefs.selectedCategory || 'Personal';
        document.getElementById('app-name-input').value = state.appName;
        setMood(state.currentMood, false);
        setCategory(state.selectedCategory, false);
        return;
    }

    // We keep these in a separate doc: users/{uid}/settings/preferences
    const prefDoc = doc(db, `users/${state.user.uid}/settings/preferences`);
    state.unsubscribeUserParams = onSnapshot(prefDoc, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            state.appName = data.appName || '';
            state.currentMood = data.mood || 'Neutral';
            state.selectedCategory = data.selectedCategory || 'Personal';

            // Update UI
            document.getElementById('app-name-input').value = state.appName;
            setMood(state.currentMood, false); // false = don't save back to DB
            setCategory(state.selectedCategory, false);
        } else {
            // Create default
            setDoc(prefDoc, { appName: '', mood: 'Neutral', selectedCategory: 'Personal' });
        }
    });
}

// --- Exposed Functions for HTML ---
// Because we are a module, we attach these to window for the onclick handlers in HTML
window.handleLogin = async () => {
    const email = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const err = document.getElementById('auth-error');

    if (!email || !password) {
        err.innerText = TRANSLATIONS[state.language].fillFields;
        err.classList.remove('hidden');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);

        if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
            err.innerHTML = "Setup Required: Please use <b>Guest Mode</b> or valid API keys.";
        } else {
            err.innerText = TRANSLATIONS[state.language].loginError;
        }
        err.classList.remove('hidden');
    }
};

window.handleGuestLogin = () => {
    state.user = { uid: 'guest', email: 'guest@local', isGuest: true };
    document.getElementById('auth-modal').classList.add('hidden');
    subscribeToData();
};

window.handleRegister = async () => {
    const email = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const err = document.getElementById('auth-error');

    if (!email || !password) {
        err.innerText = TRANSLATIONS[state.language].fillFields;
        err.classList.remove('hidden');
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);

        if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
            err.innerHTML = "Setup Required: Please use <b>Guest Mode</b> or valid API keys.";
        } else {
            const msg = error.code ? `Firebase Error: ${error.code}` : TRANSLATIONS[state.language].registerError;
            err.innerText = msg;
        }
        err.classList.remove('hidden');
    }
};

window.logout = () => {
    if (state.user?.isGuest) {
        state.user = null;
        state.todos = [];
        document.getElementById('auth-modal').classList.remove('hidden');
        render();
    } else {
        signOut(auth);
    }
};

window.handleGuestLogin = () => {
    state.user = { uid: 'guest', email: 'guest@local', isGuest: true };
    document.getElementById('auth-modal').classList.add('hidden');
    subscribeToData();
};

window.addTodo = async () => {
    if (!state.user) return;
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;

    let colorClass = CATEGORIES[state.selectedCategory].color;
    if (state.currentMood === 'Low Energy') {
        colorClass = 'from-teal-500 to-emerald-500';
    }

    const newTodo = {
        text,
        completed: false,
        category: state.selectedCategory,
        colorClass: colorClass,
        viewMode: state.viewMode,
        createdAt: serverTimestamp() // Use server timestamp
    };

    try {
        if (state.user.isGuest) {
            newTodo.id = Date.now().toString();
            state.todos.unshift(newTodo);
            localStorage.setItem('guest_todos', JSON.stringify(state.todos));
            input.value = '';
            render();
            updateStats();
        } else {
            await addDoc(collection(db, `users/${state.user.uid}/todos`), newTodo);
            input.value = '';
        }
    } catch (e) {
        console.error("Error adding doc: ", e);
    }
};

window.toggleTodo = async (id) => {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        if (state.user.isGuest) {
            todo.completed = !todo.completed;
            localStorage.setItem('guest_todos', JSON.stringify(state.todos));
            render();
            updateStats();
        } else {
            const docRef = doc(db, `users/${state.user.uid}/todos`, id);
            await updateDoc(docRef, { completed: !todo.completed });
        }
    }
};

window.deleteTodo = async (id) => {
    if (state.user.isGuest) {
        state.todos = state.todos.filter(t => t.id !== id);
        localStorage.setItem('guest_todos', JSON.stringify(state.todos));
        render();
        updateStats();
    } else {
        const docRef = doc(db, `users/${state.user.uid}/todos`, id);
        await deleteDoc(docRef);
    }
};

window.switchView = (mode) => {
    state.viewMode = mode;
    const t = TRANSLATIONS[state.language];
    // Update buttons
    const btnDaily = document.getElementById('btn-daily');
    const btnWeekly = document.getElementById('btn-weekly');
    const btnAthkar = document.getElementById('btn-athkar');

    const activeClass = 'px-5 py-1.5 rounded-lg text-xs font-medium transition-all bg-indigo-500 text-white shadow-lg shadow-indigo-500/20';
    const inactiveClass = 'px-5 py-1.5 rounded-lg text-xs font-medium transition-all text-slate-400 hover:text-white';

    btnDaily.className = mode === 'Daily' ? activeClass : inactiveClass;
    btnWeekly.className = mode === 'Weekly' ? activeClass : inactiveClass;
    if (btnAthkar) btnAthkar.className = mode === 'Athkar' ? activeClass : inactiveClass;

    render();
};

window.incrementAthkar = (id) => {
    const list = state.athkarMode === 'morning' ? ATHKAR_MORNING : ATHKAR_EVENING;
    const thikr = list.find(t => t.id === id);
    if (!thikr) return;

    // Initialize if not present
    if (state.athkarCounts[id] === undefined) state.athkarCounts[id] = 0;

    // Increment if not done
    if (state.athkarCounts[id] < thikr.count) {
        state.athkarCounts[id]++;
        // Visual feedback could go here
        render();
    }
};

window.resetAthkar = () => {
    state.athkarCounts = {};
    render();
};

window.toggleAthkarMode = () => {
    state.athkarMode = state.athkarMode === 'morning' ? 'evening' : 'morning';
    // Optional: Reset counts when switching mode? Or keep them separate?
    // User expectation: usually separate per time of day, but 'resetAthkar' wipes all. 
    // For now we keep one count object, but IDs are different (100+ for evening), so it works fine.
    render();
};

window.toggleStats = () => {
    const modal = document.getElementById('stats-modal');
    if (modal.classList.contains('hidden')) { modal.classList.remove('hidden'); updateStats(); } else { modal.classList.add('hidden'); }
};

window.handleInputKey = (e) => {
    if (e.key === 'Enter') window.addTodo();
};

// --- Language Logic ---
function setLanguage(lang) {
    state.language = lang;
    localStorage.setItem('beltagy_lang', lang);
    const t = TRANSLATIONS[lang];
    const isRTL = lang === 'ar';

    // 1. Update HTML Dir & Classes
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
    const body = document.body;

    if (isRTL) {
        body.classList.add('font-arabic');
        body.classList.remove('font-sans');
    } else {
        body.classList.remove('font-arabic');
        body.classList.add('font-sans');
    }

    // 2. Update Text Content
    document.title = t.title;
    document.querySelector('h1').innerText = t.title;
    document.getElementById('app-name-input').placeholder = t.appNamePlaceholder;
    document.getElementById('todo-input').placeholder = t.inputPlaceholder;
    document.getElementById('btn-daily').innerText = t.daily;
    document.getElementById('btn-daily').innerText = t.daily;
    document.getElementById('btn-weekly').innerText = t.weekly;
    const btnAthkar = document.getElementById('btn-athkar');
    if (btnAthkar) btnAthkar.innerText = t.athkar;

    // Empty State
    document.querySelector('#empty-state p.text-lg').innerText = t.emptyTitle;
    document.querySelector('#empty-state p.text-sm').innerText = t.emptySub;

    // Auth Modal
    document.querySelector('#auth-modal h1').innerText = t.welcome;
    document.querySelector('#auth-modal p.text-slate-400').innerText = t.subtitle;
    document.querySelectorAll('#auth-modal label')[0].innerText = t.username;
    document.querySelectorAll('#auth-modal label')[1].innerText = t.password;
    document.querySelector('#auth-modal button.bg-gradient-to-r').innerText = t.enter;
    document.querySelector('#auth-modal span.text-slate-600').innerText = t.or;
    document.querySelector('#auth-modal button.bg-white\\/5').innerText = t.createAccount;

    // Guest Button Update
    const guestBtn = document.querySelector('button[onclick="handleGuestLogin()"]');
    if (guestBtn) {
        guestBtn.innerHTML = `<i data-lucide="user-circle" class="w-4 h-4"></i> ${t.guestLogin}`;
    }

    // Toggle Button Text
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
        toggleBtn.innerText = isRTL ? 'English' : 'عربي';
        toggleBtn.onclick = () => setLanguage(isRTL ? 'en' : 'ar');
    }

    // Stats
    document.querySelector('#stats-modal h2').innerHTML = `<i data-lucide="trending-up" class="text-indigo-400"></i> ${t.statsTitle}`;
    // We need to re-render stats to update labels if open, but mostly static headers
    // Update headers in stats
    const statLabels = document.querySelectorAll('#stats-modal .text-xs.uppercase');
    if (statLabels.length >= 3) {
        statLabels[0].innerText = t.totalScore;
        statLabels[1].innerText = t.tasksDone;
        statLabels[2].innerText = t.rate;
    }
    const chartTitles = document.querySelectorAll('#stats-modal h3');
    if (chartTitles.length >= 2) {
        chartTitles[0].innerText = t.focusDist;
        chartTitles[1].innerText = t.prodTrend;
    }

    // Task Name Input Font (Request #3)
    const nameInput = document.getElementById('app-name-input');
    if (isRTL) {
        nameInput.classList.remove('font-creative');
        nameInput.classList.add('font-arabic');
    } else {
        nameInput.classList.remove('font-arabic');
        // Changing to Caveat as per plan, instead of Dancing Script
        nameInput.classList.remove('font-creative');
        nameInput.classList.add('font-hand'); // Defined in CSS as Caveat
    }

    // Re-render to update translations in list
    render();
    initMoodSelector(); // Refresh mood labels
    initCategoryDock(); // Refresh category labels
    lucide.createIcons();
}


// --- Helper Logic (UI) ---

function setMood(mood, save = true) {
    state.currentMood = mood;
    const container = document.getElementById('mood-selector');
    Array.from(container.children).forEach(btn => {
        const isSelected = btn.dataset.mood === mood;
        btn.className = `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${isSelected
            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
            }`;
    });
    if (save) saveUserPref();
}

function setCategory(cat, save = true) {
    state.selectedCategory = cat;
    initCategoryDock();
    const inputContainer = document.querySelector('#todo-input').parentNode;
    const config = CATEGORIES[cat];
    // Apply Glow
    inputContainer.style.borderColor = config.glow.replace('0.4', '1');
    inputContainer.style.boxShadow = `0 0 20px ${config.glow}`;

    if (save) saveUserPref();
}

async function saveUserPref() {
    if (!state.user) return;

    if (state.user.isGuest) {
        const prefs = {
            appName: state.appName,
            mood: state.currentMood,
            selectedCategory: state.selectedCategory
        };
        localStorage.setItem('guest_prefs', JSON.stringify(prefs));
        return;
    }

    const prefDoc = doc(db, `users/${state.user.uid}/settings/preferences`);
    await setDoc(prefDoc, {
        appName: state.appName,
        mood: state.currentMood,
        selectedCategory: state.selectedCategory
    }, { merge: true });
}

async function updateName(e) {
    state.appName = e.target.value;
    saveUserPref();
}

function setupEventListeners() {
    document.getElementById('app-name-input').addEventListener('input', debounce(updateName, 500));
    // Language Toggle
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) toggleBtn.onclick = () => setLanguage(state.language === 'en' ? 'ar' : 'en');
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}


// --- Rendering ---
function render() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    const t = TRANSLATIONS[state.language];

    // Special handling for Athkar View
    if (state.viewMode === 'Athkar') {
        renderAthkar(list);
        return;
    }

    const filtered = state.todos.filter(t => t.viewMode === state.viewMode);

    if (filtered.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('flex');
    } else {
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('flex');

        filtered.forEach(todo => {
            // Check if created date exists? Firestore might return null immediately if local latency compensation?
            // Usually ok.

            const el = document.createElement('div');
            el.className = `group relative bg-slate-900/50 hover:bg-slate-900/80 border border-white/5 rounded-2xl p-4 transition-all duration-300 ${todo.completed ? 'opacity-50' : ''}`;

            // RTL flipping for icons if needed? usually icons are ok, but layout is handled by flex
            // With RTL, flex items-center gap-4 handles order automatically.

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
                            ${t[todo.category] || todo.category}
                        </p>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="openTimer('${todo.id}')" class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Focus Mode">
                            <i data-lucide="play" class="w-4 h-4 rtl-flip"></i> 
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

function renderAthkar(list) {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('flex');

    const t = TRANSLATIONS[state.language];
    const isMorning = state.athkarMode === 'morning';

    // Dynamic Theme Classes
    const theme = isMorning ? {
        border: 'border-amber-500/20',
        bg: 'bg-amber-900/20',
        text: 'text-amber-100',
        subtext: 'text-amber-200/60',
        btn: 'bg-amber-500 hover:bg-amber-400 text-slate-900',
        progress: 'bg-amber-500'
    } : {
        border: 'border-indigo-500/20',
        bg: 'bg-indigo-900/20',
        text: 'text-indigo-100',
        subtext: 'text-indigo-200/60',
        btn: 'bg-indigo-500 hover:bg-indigo-400 text-white',
        progress: 'bg-indigo-500'
    };

    // Header with Toggle and Reset
    const header = document.createElement('div');
    header.className = "flex justify-between items-center mb-6 px-2";

    const toggleBtn = `
        <button onclick="toggleAthkarMode()" 
            class="flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 transform active:scale-95 ${isMorning
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}">
            <i data-lucide="${isMorning ? 'sun' : 'moon'}" class="w-5 h-5"></i>
            <span class="text-sm font-bold font-arabic">${isMorning ? t.morningAthkar : t.eveningAthkar}</span>
        </button>
    `;

    const resetBtn = `
        <button onclick="resetAthkar()" class="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors opacity-70 hover:opacity-100">
            <i data-lucide="rotate-ccw" class="w-3 h-3"></i>
            ${t.resetCounts}
        </button>
    `;

    header.innerHTML = toggleBtn + resetBtn;
    list.appendChild(header);

    const currentAthkarList = state.athkarMode === 'morning' ? ATHKAR_MORNING : ATHKAR_EVENING;

    currentAthkarList.forEach(thikr => {
        const count = state.athkarCounts[thikr.id] || 0;
        const isCompleted = count >= thikr.count;
        const progress = (count / thikr.count) * 100;

        const el = document.createElement('div');
        el.className = `relative overflow-hidden rounded-3xl transition-all duration-300 border ${isCompleted ? 'border-emerald-500/30 bg-emerald-900/10' : `${theme.border} ${theme.bg}`} ${isCompleted ? 'opacity-80' : 'opacity-100'}`;

        // Progress Bar
        const progressStyle = `
            <div class="absolute bottom-0 left-0 h-1.5 transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : theme.progress}" style="width: ${progress}%"></div>
        `;

        el.innerHTML = `
            <div class="p-6 pb-8 flex flex-col items-center gap-4 text-center relative z-10">
                 <!-- Status Icon -->
                ${isCompleted ?
                `<div class="absolute top-4 right-4 text-emerald-500 animate-in fade-in zoom-in duration-300 bg-emerald-500/10 p-1.5 rounded-full">
                        <i data-lucide="check" class="w-5 h-5"></i>
                    </div>`
                : ''}

                <!-- Text -->
                <p class="text-xl md:text-2xl font-arabic leading-loose ${isCompleted ? 'text-emerald-100' : theme.text} drop-shadow-sm">
                    ${thikr.text.replace(/\n/g, '<br>')}
                </p>
                
                ${thikr.note ? `<p class="text-xs ${theme.subtext} font-arabic bg-black/20 px-3 py-1 rounded-full">${thikr.note}</p>` : ''}
                
                <!-- Interaction Area -->
                <div class="mt-4 w-full max-w-xs">
                    <button onclick="event.stopPropagation(); incrementAthkar(${thikr.id})" 
                        class="w-full relative group h-14 rounded-2xl font-bold text-lg shadow-lg overflow-hidden transition-all duration-200 active:scale-95 ${isCompleted ? 'bg-emerald-600 text-white cursor-default' : theme.btn}">
                        
                        <span class="relative z-10 flex items-center justify-center gap-2">
                             ${isCompleted ? '<i data-lucide="check-circle" class="w-5 h-5"></i> Completed' :
                `<i data-lucide="fingerprint" class="w-5 h-5"></i> ${count} / ${thikr.count}`}
                        </span>

                        ${!isCompleted ? `<div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>` : ''}
                    </button>
                    ${!isCompleted ? `<p class="text-[10px] text-center mt-2 opacity-50 uppercase tracking-widest">${t.repetitions}</p>` : ''}
                </div>
            </div>
            ${progressStyle}
        `;
        list.appendChild(el);
    });
    lucide.createIcons();
}

// --- Stats, Timer, Emojis (Preserved & Adapted) ---

function initEmojis() {
    const container = document.getElementById('emoji-container');
    if (!container) return;
    container.innerHTML = ''; // Start fresh
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
    container.innerHTML = '';
    const t = TRANSLATIONS[state.language];

    // Map internal key to translation key
    const moodLabels = {
        'High Energy': t.moodHigh,
        'Neutral': t.moodNeutral,
        'Low Energy': t.moodLow
    };

    Object.keys(MOODS).forEach(mood => {
        const btn = document.createElement('button');
        btn.dataset.mood = mood;
        btn.onclick = () => setMood(mood);
        const config = MOODS[mood];
        btn.innerHTML = `<i data-lucide="${config.icon}" class="w-4 h-4 ${config.theme}"></i> ${moodLabels[mood] || mood}`;
        container.appendChild(btn);
    });
}

function initCategoryDock() {
    const dock = document.getElementById('category-dock');
    dock.innerHTML = '';
    const t = TRANSLATIONS[state.language];

    // Safety: Reset selected if invalid
    if (!CATEGORIES[state.selectedCategory]) {
        state.selectedCategory = 'Personal';
    }

    Object.keys(CATEGORIES).forEach(cat => {
        const btn = document.createElement('button');
        const isActive = state.selectedCategory === cat;
        const baseClass = "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2";
        const activeClass = isActive
            ? `bg-white/20 text-white scale-105 shadow-lg border border-white/20`
            : `hover:bg-white/10 text-slate-400 hover:text-white`;

        btn.className = `${baseClass} ${activeClass}`;
        const dotBg = CATEGORIES[cat].bg;

        // Use translation or fallback to English key
        const label = t[cat] || cat;

        btn.innerHTML = `<span class="w-2 h-2 rounded-full ${dotBg}"></span> ${label}`;
        btn.onclick = () => setCategory(cat);
        dock.appendChild(btn);
    });
}

// Stats Chart
let chartInstances = {};
function updateStats() {
    const completed = state.todos.filter(t => t.completed);
    document.getElementById('stat-completed').innerText = completed.length;
    document.getElementById('stat-xp').innerText = (completed.length * 100) + ' XP';

    // Rate
    const total = state.todos.length;
    const rate = total === 0 ? 0 : Math.round((completed.length / total) * 100);
    document.getElementById('stat-rate').innerText = rate + '%';

    const catCounts = { Personal: 0, Work: 0, Learning: 0, Shopping: 0, Health: 0, Ideas: 0 };
    completed.forEach(t => { if (catCounts[t.category] !== undefined) catCounts[t.category]++; });

    if (typeof Chart === 'undefined') return;

    const barCtx = document.getElementById('barChart').getContext('2d');
    if (chartInstances.bar) chartInstances.bar.destroy();

    chartInstances.bar = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(catCounts).map(k => TRANSLATIONS[state.language][k] || k), // Translate labels
            datasets: [{
                label: 'Tasks',
                data: Object.values(catCounts),
                backgroundColor: ['#ec4899', '#0ea5e9', '#8b5cf6', '#14b8a6', '#22c55e', '#f59e0b'],
                borderRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }
    });

    // Line chart mock
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

// Timer Exports
window.openTimer = (todoId) => {
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo) return;
    state.timer.active = false; state.timer.timeLeft = 1500; state.timer.taskId = todoId;
    if (state.timer.interval) clearInterval(state.timer.interval);
    document.getElementById('timer-modal').classList.remove('hidden');
    document.getElementById('timer-task-text').innerText = todo.text;
    document.getElementById('timer-quote').innerText = getClientEncouragement(todo.text, state.currentMood);
    updateTimerDisplay();
}
window.closeTimer = () => {
    state.timer.active = false;
    if (state.timer.interval) clearInterval(state.timer.interval);
    document.getElementById('timer-modal').classList.add('hidden');
}
window.toggleTimerState = () => {
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
    const t = TRANSLATIONS[state.language];
    if (mood === 'Low Energy') return "Small steps. Breathe. 🌿";
    return msgs[Math.floor(Math.random() * msgs.length)];
}
