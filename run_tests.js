// B-Task Automated Test Suite
// Copy and paste this entire file into browser console (F12) while on http://localhost:8000

console.log('🧪 Starting B-Task Automated Test Suite...\n');

const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            console.log(`✅ PASS: ${name}`);
            results.passed++;
            results.tests.push({ name, status: 'PASS', error: null });
        } else {
            console.log(`❌ FAIL: ${name}`);
            results.failed++;
            results.tests.push({ name, status: 'FAIL', error: 'Test returned false' });
        }
    } catch (error) {
        console.log(`❌ ERROR: ${name} - ${error.message}`);
        results.failed++;
        results.tests.push({ name, status: 'ERROR', error: error.message });
    }
}

console.log('\n📋 Test 1: Category Dock Loaded');
test('Category dock exists', () => {
    return document.getElementById('category-dock') !== null;
});

test('Category dock has 7 buttons', () => {
    const dock = document.getElementById('category-dock');
    return dock && dock.children.length === 7;
});

test('All categories have icons', () => {
    const categories = Object.keys(CATEGORIES);
    return categories.every(cat => CATEGORIES[cat].icon);
});

console.log('\n📋 Test 2: State Initialization');
test('State object exists', () => {
    return typeof state !== 'undefined';
});

test('Todos array exists', () => {
    return Array.isArray(state.todos);
});

test('Theme is set', () => {
    return state.theme === 'dark' || state.theme === 'light';
});

test('Language is set', () => {
    return state.language === 'en' || state.language === 'ar';
});

console.log('\n📋 Test 3: Dark Mode Styling');
test('Dark mode class on HTML', () => {
    const isDark = document.documentElement.classList.contains('dark');
    console.log(`  Current theme: ${state.theme}, Dark class: ${isDark}`);
    return state.theme === 'dark' ? isDark : !isDark;
});

test('Input field has dark mode classes', () => {
    const input = document.getElementById('todo-input');
    return input && input.className.includes('dark:text-white');
});

console.log('\n📋 Test 4: LocalStorage Functions');
test('saveLocalData function exists', () => {
    return typeof saveLocalData === 'function';
});

test('loadLocalData function exists', () => {
    return typeof loadLocalData === 'function';
});

test('Can access localStorage', () => {
    try {
        localStorage.setItem('test', 'test');
        const val = localStorage.getItem('test');
        localStorage.removeItem('test');
        return val === 'test';
    } catch (e) {
        return false;
    }
});

console.log('\n📋 Test 5: CRUD Functions');
test('addTodo function exists', () => {
    return typeof window.addTodo === 'function';
});

test('toggleTodo function exists', () => {
    return typeof window.toggleTodo === 'function';
});

test('deleteTodo function exists', () => {
    return typeof window.deleteTodo === 'function';
});

console.log('\n📋 Test 6: View Switching');
test('switchView function exists', () => {
    return typeof window.switchView === 'function';
});

test('All view buttons exist', () => {
    const views = ['daily', 'weekly', 'athkar', 'tasbih', 'kahf'];
    return views.every(v => document.getElementById(`btn-${v}`) !== null);
});

console.log('\n📋 Test 7: Translations');
test('English translations exist', () => {
    return TRANSLATIONS.en && typeof TRANSLATIONS.en === 'object';
});

test('Arabic translations exist', () => {
    return TRANSLATIONS.ar && typeof TRANSLATIONS.ar === 'object';
});

test('All categories translated to Arabic', () => {
    const categories = ['Personal', 'Work', 'Interests', 'Purchases', 'Health', 'Finance', 'Ideas'];
    return categories.every(cat => TRANSLATIONS.ar[cat]);
});

console.log('\n📋 Test 8: Theme Functions');
test('toggleTheme function exists', () => {
    return typeof window.toggleTheme === 'function';
});

test('setTheme function exists', () => {
    return typeof setTheme === 'function';
});

console.log('\n📋 Test 9: Athkar & Tasbih Data');
test('Morning Athkar data loaded', () => {
    return Array.isArray(ATHKAR_MORNING) && ATHKAR_MORNING.length === 31;
});

test('Evening Athkar data loaded', () => {
    return Array.isArray(ATHKAR_EVENING) && ATHKAR_EVENING.length === 30;
});

test('Tasbih data loaded', () => {
    return Array.isArray(TASBIH_DATA) && TASBIH_DATA.length === 17;
});

test('Al-Kahf text loaded', () => {
    return typeof KAHF_TEXT === 'string' && KAHF_TEXT.length > 1000;
});

console.log('\n📋 Test 10: Functional Test - Add & Persist');
const initialCount = state.todos.length;
const testTaskText = `Test task ${Date.now()}`;

// Simulate adding a task
const testTodo = {
    id: Date.now().toString(),
    text: testTaskText,
    completed: false,
    category: state.selectedCategory,
    colorClass: CATEGORIES[state.selectedCategory].color,
    viewMode: state.viewMode,
    createdAt: new Date()
};

state.todos.unshift(testTodo);
saveLocalData();

test('Task added to state', () => {
    return state.todos.length === initialCount + 1;
});

test('Task saved to localStorage', () => {
    const saved = JSON.parse(localStorage.getItem('beltagy_todos'));
    return saved && saved.length === state.todos.length;
});

test('Task text matches', () => {
    return state.todos[0].text === testTaskText;
});

// Clean up test task
state.todos.shift();
saveLocalData();

console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📈 Total:  ${results.passed + results.failed}`);
console.log(`🎯 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => t.status !== 'PASS').forEach(t => {
        console.log(`  - ${t.name}: ${t.error || t.status}`);
    });
}

console.log('\n' + '='.repeat(50));
console.log('💡 NEXT STEPS:');
console.log('='.repeat(50));

if (results.failed === 0) {
    console.log('🎉 All tests passed! Try these manual tests:\n');
    console.log('1. Type in the input field - can you see WHITE text?');
    console.log('2. Add a task and press F5 - does it persist?');
    console.log('3. Click theme toggle - does it switch smoothly?');
    console.log('4. Click عربي - does it switch to RTL?');
} else {
    console.log('⚠️ Some tests failed. Try these fixes:\n');
    console.log('1. Hard refresh: Ctrl + Shift + R');
    console.log('2. Clear storage: localStorage.clear(); location.reload();');
    console.log('3. Check console for errors (red messages)');
}

console.log('\n✅ Test suite complete!');
