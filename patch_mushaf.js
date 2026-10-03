window.toggleMushafAudio = async () => {
    const btn = document.getElementById('btn-mushaf-audio');
    if (mushafPlaying && mushafAudio) {
        mushafAudio.pause();
        mushafPlaying = false;
        btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
        if (window.lucide) lucide.createIcons();
    } else {
        btn.innerHTML = '<i data-lucide="loader" class="w-6 h-6 animate-spin"></i>';
        if (window.lucide) lucide.createIcons();
        
        try {
            // Get ayahs from local offline data
            const ayahs = QURAN_PAGES[currentMushafPage];
            if (!ayahs) throw new Error("Page data missing");
            
            let currentAyahIndex = 0;
            
            const playNext = () => {
                if (currentAyahIndex >= ayahs.length) {
                    mushafPlaying = false;
                    btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                    if (window.lucide) lucide.createIcons();
                    return;
                }
                
                document.querySelectorAll('.ayah-text').forEach(el => el.classList.remove('ayah-active', 'text-emerald-600', 'dark:text-emerald-400'));
                const ayah = ayahs[currentAyahIndex];
                const currentEl = document.getElementById(`ayah-${ayah.number}`);
                if (currentEl) {
                    currentEl.classList.add('ayah-active', 'text-emerald-600', 'dark:text-emerald-400');
                    currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Construct EveryAyah URL for Minshawi Mujawwad (001001.mp3 format)
                const surahNum = String(ayah.surah.number).padStart(3, '0');
                const ayahNum = String(ayah.numberInSurah).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/Minshawy_Mujawwad_192kbps/${surahNum}${ayahNum}.mp3`;
                
                mushafAudio = new Audio(audioUrl);
                mushafAudio.play().catch(e => {
                    console.error("Audio play failed", e);
                    // Skip to next if network fails on a specific file? Actually just stop or try next.
                    // For now, if one fails, we stop.
                    mushafPlaying = false;
                    btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                    if (window.lucide) lucide.createIcons();
                });
                
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

window.showTafsir = async (ayahNumber, surahNum, ayahInSurah) => {
    const sheet = document.getElementById('tafsir-sheet');
    const textEl = document.getElementById('tafsir-text');
    sheet.classList.remove('hidden');
    textEl.innerHTML = '<div class="flex justify-center"><i data-lucide="loader" class="animate-spin text-indigo-500"></i></div>';
    if (window.lucide) lucide.createIcons();
    
    try {
        // Quran.com API v4 for Tafsir Al-Muyassar (ID: 16)
        const res = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${surahNum}:${ayahInSurah}`);
        const data = await res.json();
        
        let text = data.tafsir.text;
        // Basic HTML stripping if it returns html
        text = text.replace(/<[^>]*>?/gm, ''); 
        textEl.innerText = text;
    } catch (e) {
        console.error(e);
        textEl.innerText = 'عذراً، التفسير يتطلب اتصالاً بالإنترنت.';
    }
};

function toArabicNumber(n) {
    const digits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return n.toString().split('').map(d => digits[d]).join('');
}

function fetchMushafPage(page) {
    const textContainer = document.getElementById('mushaf-text');
    const surahNameEl = document.getElementById('mushaf-surah-name');
    const juzNameEl = document.getElementById('mushaf-juz-name');
    
    try {
        // Load instantly from offline data (QURAN_PAGES)
        const ayahs = QURAN_PAGES[page];
        if (!ayahs || ayahs.length === 0) throw new Error("No data for page");
        
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
            html += `<span id="ayah-${ayah.number}" class="ayah-text cursor-pointer transition-colors duration-300 hover:text-indigo-500" onclick="showTafsir(${ayah.number}, ${ayah.surah.number}, ${ayah.numberInSurah})">${text} <span class="ayah-number font-sans">\u06DD${toArabicNumber(ayah.numberInSurah)}</span> </span>`;
        });
        
        textContainer.innerHTML = html;
        
    } catch (e) {
        console.error(e);
        textContainer.innerHTML = '<div class="text-red-500 text-sm">حدث خطأ في تحميل الصفحة محلياً.</div>';
    }
}
