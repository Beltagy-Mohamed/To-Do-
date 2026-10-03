let currentMushafPage = 1;
let mushafAudio = null;
let mushafPlaying = false;
let mushafCache = {};

function renderMushaf(list) {
    list.innerHTML = '';
    list.className = "w-full pb-32";
    
    // Check local storage for saved page
    if (state.ibadah && state.ibadah.khatmah) {
        currentMushafPage = state.ibadah.khatmah || 1;
    }

    const container = document.createElement('div');
    container.className = 'relative overflow-hidden rounded-3xl p-4 md:p-10 border border-slate-700/50 bg-[#f8f9fa] dark:bg-[#0f172a] shadow-2xl mb-8 min-h-[600px] flex flex-col transition-colors duration-500';
    container.id = 'mushaf-container';
    
    container.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-300 dark:border-slate-700 pb-4 mb-6">
            <div class="text-slate-800 dark:text-slate-200 font-bold text-lg md:text-xl font-amiri" id="mushaf-surah-name">جاري التحميل...</div>
            <div class="text-slate-600 dark:text-slate-400 text-sm md:text-base font-amiri" id="mushaf-juz-name"></div>
        </div>
        
        <div id="mushaf-text" class="flex-1 text-center leading-loose text-slate-900 dark:text-slate-100 font-amiri text-2xl md:text-4xl" dir="rtl" style="line-height: 2.2;">
            <div class="animate-pulse flex space-x-4 justify-center items-center h-full">
                <i data-lucide="loader" class="w-8 h-8 animate-spin text-emerald-500"></i>
            </div>
        </div>
        
        <!-- Tafsir Bottom Sheet (Hidden) -->
        <div id="tafsir-sheet" class="hidden absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl z-50 transform transition-transform">
            <div class="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                <span class="font-bold text-indigo-600 dark:text-indigo-400">التفسير الميسر</span>
                <button onclick="document.getElementById('tafsir-sheet').classList.add('hidden')" class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div id="tafsir-text" class="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify" dir="rtl"></div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4">
            <button onclick="changeMushafPage(1)" class="p-2 md:p-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-all">
                <i data-lucide="chevron-right" class="w-6 h-6 text-slate-600 dark:text-slate-300"></i>
            </button>
            
            <div class="flex items-center gap-2 md:gap-4">
                <button onclick="toggleMushafAudio()" id="btn-mushaf-audio" class="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all">
                    <i data-lucide="play" class="w-6 h-6 fill-current"></i>
                </button>
                <div class="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300">
                    <span id="mushaf-page-number">${currentMushafPage}</span>
                </div>
            </div>
            
            <button onclick="changeMushafPage(-1)" class="p-2 md:p-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-all">
                <i data-lucide="chevron-left" class="w-6 h-6 text-slate-600 dark:text-slate-300"></i>
            </button>
        </div>
    `;
    list.appendChild(container);
    if (window.lucide) lucide.createIcons();
    
    fetchMushafPage(currentMushafPage);
}

window.changeMushafPage = (delta) => {
    let newPage = currentMushafPage + delta;
    if (newPage < 1) newPage = 1;
    if (newPage > 604) newPage = 604;
    
    currentMushafPage = newPage;
    document.getElementById('mushaf-page-number').innerText = currentMushafPage;
    
    // Save to Khatmah state
    if (!state.ibadah) state.ibadah = {};
    state.ibadah.khatmah = currentMushafPage;
    saveLocalData();
    
    if (mushafAudio) {
        mushafAudio.pause();
        mushafPlaying = false;
        document.getElementById('btn-mushaf-audio').innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
        if (window.lucide) lucide.createIcons();
    }
    
    fetchMushafPage(currentMushafPage);
};

window.toggleMushafAudio = async () => {
    const btn = document.getElementById('btn-mushaf-audio');
    if (mushafPlaying && mushafAudio) {
        mushafAudio.pause();
        mushafPlaying = false;
        btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
    } else {
        btn.innerHTML = '<i data-lucide="loader" class="w-6 h-6 animate-spin"></i>';
        if (window.lucide) lucide.createIcons();
        
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/page/${currentMushafPage}/ar.alafasy`);
            const data = await res.json();
            const ayahs = data.data.ayahs;
            
            let currentAyahIndex = 0;
            
            const playNext = () => {
                if (currentAyahIndex >= ayahs.length) {
                    mushafPlaying = false;
                    btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                    if (window.lucide) lucide.createIcons();
                    return;
                }
                
                document.querySelectorAll('.ayah-text').forEach(el => el.classList.remove('ayah-active', 'text-emerald-600', 'dark:text-emerald-400'));
                const currentEl = document.getElementById(`ayah-${ayahs[currentAyahIndex].number}`);
                if (currentEl) {
                    currentEl.classList.add('ayah-active', 'text-emerald-600', 'dark:text-emerald-400');
                    currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                mushafAudio = new Audio(ayahs[currentAyahIndex].audio);
                mushafAudio.play();
                mushafAudio.onended = () => {
                    currentAyahIndex++;
                    playNext();
                };
            };
            
            mushafPlaying = true;
            btn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 fill-current"></i>';
            if (window.lucide) lucide.createIcons();
            playNext();
            
        } catch (e) {
            console.error('Audio failed', e);
            btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
            if (window.lucide) lucide.createIcons();
        }
    }
};

window.showTafsir = async (ayahNumber) => {
    const sheet = document.getElementById('tafsir-sheet');
    const textEl = document.getElementById('tafsir-text');
    sheet.classList.remove('hidden');
    textEl.innerHTML = '<div class="flex justify-center"><i data-lucide="loader" class="animate-spin text-indigo-500"></i></div>';
    if (window.lucide) lucide.createIcons();
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.muyassar`);
        const data = await res.json();
        textEl.innerText = data.data.text;
    } catch (e) {
        textEl.innerText = 'عذراً، فشل تحميل التفسير. تحقق من الاتصال بالإنترنت.';
    }
};

function toArabicNumber(n) {
    const digits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return n.toString().split('').map(d => digits[d]).join('');
}

async function fetchMushafPage(page) {
    const textContainer = document.getElementById('mushaf-text');
    const surahNameEl = document.getElementById('mushaf-surah-name');
    const juzNameEl = document.getElementById('mushaf-juz-name');
    
    textContainer.innerHTML = '<div class="animate-pulse flex justify-center items-center h-full"><i data-lucide="loader" class="w-8 h-8 animate-spin text-emerald-500"></i></div>';
    if (window.lucide) lucide.createIcons();
    
    try {
        let ayahs = [];
        if (mushafCache[page]) {
            ayahs = mushafCache[page];
        } else {
            const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
            const data = await res.json();
            ayahs = data.data.ayahs;
            mushafCache[page] = ayahs;
        }
        
        surahNameEl.innerText = ayahs[0].surah.name;
        juzNameEl.innerText = 'الجزء ' + toArabicNumber(ayahs[0].juz);
        
        let html = '';
        ayahs.forEach(ayah => {
            let text = ayah.text;
            if (ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9) {
                text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
                text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', ''); // Fallback
                html += `<div class="w-full text-center text-xl md:text-2xl text-emerald-600 dark:text-emerald-400 my-4 font-amiri">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
            }
            html += `<span id="ayah-${ayah.number}" class="ayah-text cursor-pointer transition-colors duration-300 hover:text-indigo-500" onclick="showTafsir(${ayah.number})">${text} <span class="ayah-number font-sans">\u06DD${toArabicNumber(ayah.numberInSurah)}</span> </span>`;
        });
        
        textContainer.innerHTML = html;
        
    } catch (e) {
        textContainer.innerHTML = '<div class="text-red-500 text-sm">خطأ في الاتصال بالشبكة. يرجى المحاولة لاحقاً.</div>';
    }
}
