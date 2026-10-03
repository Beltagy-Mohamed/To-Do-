const fs = require('fs');
const https = require('https');

https.get('https://api.alquran.cloud/v1/quran/quran-uthmani', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const quran = JSON.parse(data).data;
        const pages = {};
        quran.surahs.forEach(surah => {
            surah.ayahs.forEach(ayah => {
                if (!pages[ayah.page]) pages[ayah.page] = [];
                ayah.surah = { number: surah.number, name: surah.name };
                pages[ayah.page].push(ayah);
            });
        });
        fs.writeFileSync('quran_data.js', 'const QURAN_PAGES = ' + JSON.stringify(pages) + ';');
        console.log('Done writing quran_data.js');
    });
}).on('error', console.error);
