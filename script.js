// --- Toast Alert System ---
const Toast = {
    container: null,
    queue: [],
    processing: false,

    init() {
        this.container = document.getElementById('toast-container');
    },
    show(message, type = 'info', duration = 3000) {
        this.queue.push({ message, type, duration });
        if (!this.processing) this.processQueue();
    },
    processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        this.processing = true;
        const { message, type, duration } = this.queue.shift();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-content">${message}</div><button class="toast-close">횞</button><div class="toast-progress" style="animation-duration: ${duration}ms"></div>`;
        this.container.appendChild(toast);
        toast.querySelector('.toast-close').onclick = () => this.close(toast);
        setTimeout(() => this.close(toast), duration);
    },
    close(toast) {
        toast.classList.add('closing');
        toast.addEventListener('animationend', () => {
            toast.remove();
            this.processQueue();
        });
    },
    success(message, duration) { this.show(message, 'success', duration); },
    error(message, duration) { this.show(message, 'error', duration); }
};

function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) console.warn(`Element with id '${id}' not found`);
    return element;
}

// ?꾩뿭 蹂?섎뱾
let elements, state;

console.log('Script loaded, initializing...');
console.log('Current location:', window.location.href);

// DOM??以鍮꾨릺硫??ㅽ뻾
function initializeApp() {
    console.log('Initializing app...');
    Toast.init();

    elements = {
        mainContent: safeGetElement('main-content'),
        loader: safeGetElement('loader'),
        characterSection: safeGetElement('character'),
        keyboardSection: safeGetElement('keyboard'),
        detailSection: safeGetElement('detail-section'),
        tournamentSection: safeGetElement('tournament-section'),
        statsSection: safeGetElement('stats'),
        communitySection: safeGetElement('community'),
        minigameSection: safeGetElement('minigame'),
        itemListDiv: safeGetElement('item-list'),
        itemDetailDiv: safeGetElement('item-detail'),
        backToListBtn: safeGetElement('back-to-list-button'),
        tournamentTitle: safeGetElement('tournament-title'),
        matchupContainer: safeGetElement('matchup-container'),
        matchItem1Div: safeGetElement('match-item-1'),
        matchItem2Div: safeGetElement('match-item-2'),
        winnerDisplay: safeGetElement('winner-display'),
        finalWinnerDiv: safeGetElement('final-winner'),
        restartTournamentBtn: safeGetElement('restart-tournament'),
        backToMainMenuBtn: safeGetElement('back-to-main-menu'),
        searchInput: safeGetElement('search-input'),
        searchButton: safeGetElement('search-button'),
        attributeFiltersDiv: safeGetElement('attribute-filters'),
        raceFiltersDiv: safeGetElement('race-filters'),
        applyFiltersBtn: safeGetElement('apply-filters'),
        resetFiltersBtn: safeGetElement('reset-filters'),
        resultCountSpan: safeGetElement('result-count'),
        activeFiltersDiv: safeGetElement('active-filters'),
        openFavoriteBtn: safeGetElement('open-favorite'),
        openFlashcardBtn: safeGetElement('open-flashcard'),
        flashcardWrap: safeGetElement('flashcard-wrap'),
        fcCounter: safeGetElement('fc-counter'),
        fcScore: safeGetElement('fc-score'),
        fcImage: safeGetElement('fc-image'),
        fcOptions: safeGetElement('fc-options'),
        fcNextBtn: safeGetElement('fc-next'),
        fcResult: safeGetElement('fc-result'),
        attributeChartCanvas: safeGetElement('attribute-chart-canvas'),
        raceChartCanvas: safeGetElement('race-chart-canvas'),
        channelChartCanvas: safeGetElement('channel-chart-canvas'),
        typeChartCanvas: safeGetElement('type-chart-canvas'),
    };

    state = {
        gameData: null,
        currentListType: 'characters',
        activeFilters: { search: '', attributes: [], races: [], channels: [] },
        charts: { attribute: null, race: null, channel: null, type: null },
        tournament: { type: '', contestants: [], matchup: [], winners: [] },
        flashcard: { questions: [], currentIndex: 0, score: 0, totalQuestions: 10 }
    };

    // GitHub Pages ?덈? 寃쎈줈 ?ъ슜
    const basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const jsonDataPath = basePath + 'data.json';
    const imageBasePath = basePath + 'images/';

    console.log('Using paths - JSON:', jsonDataPath, 'Images:', imageBasePath);
    const getAttributeEmoji = attribute => ({ '遺?: '?뵦', '臾?: '?뮛', '??: '?뙅', '踰덇컻': '??, '諛붾엺': '?뙦截?, '?대몺': '?뙌', '鍮?: '??, '?쇱쓬': '?꾬툘', '?섎Т': '?뙯' }[attribute] || '');

    function loadImageWithFallback(imgElement, originalSrc, itemName) {
        console.log('Loading image for', itemName, ':', originalSrc);
        
        const pathsToTry = [
            originalSrc,
            './' + originalSrc,
            originalSrc.replace('images/', './images/'),
            '/page/' + originalSrc,
            imageBasePath + originalSrc.split('/').pop() // ?뚯씪紐낅쭔 ?ъ슜
        ];
        
        let currentIndex = 0;
        
        const tryNextPath = () => {
            if (currentIndex >= pathsToTry.length) {
                console.warn('All image paths failed for:', itemName);
                return;
            }
            
            const pathToTry = pathsToTry[currentIndex++];
            console.log('Trying path:', pathToTry);
            
            const testImg = new Image();
            testImg.onload = () => {
                console.log('Image loaded successfully:', pathToTry);
                imgElement.src = pathToTry;
            };
            testImg.onerror = () => {
                console.warn('Failed to load:', pathToTry);
                tryNextPath();
            };
            testImg.src = pathToTry;
        };
        
        tryNextPath();
    }

    function setImageSource(imgElement, itemName) {
        const placeholderPath = imageBasePath + 'placeholder.png';
        
        // 湲곕낯 placeholder ?ㅼ젙
        imgElement.src = placeholderPath;
        imgElement.onerror = () => {
            console.warn('Failed to load placeholder image:', placeholderPath);
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        };

        const item = (state.gameData.characters.find(c => c.name === itemName) || state.gameData.kibos.find(k => k.name === itemName));
        if (item && item.imageUrl) {
            console.log('Loading image for', itemName, ':', item.imageUrl);
            
            // ?대?吏 濡쒕뵫 ?뚯뒪??
            const testImg = new Image();
            testImg.onload = () => {
                console.log('Image loaded successfully:', item.imageUrl);
                imgElement.src = item.imageUrl;
            };
            testImg.onerror = () => {
                console.warn('Failed to load image:', item.imageUrl);
                // ?ㅻⅨ 寃쎈줈?ㅼ쓣 ?쒕룄?대낫湲?
                const altPaths = [
                    './' + item.imageUrl,
                    item.imageUrl.replace('images/', './images/'),
                    '/page/' + item.imageUrl
                ];
                
                let pathIndex = 0;
                const tryNextPath = () => {
                    if (pathIndex < altPaths.length) {
                        const altPath = altPaths[pathIndex++];
                        console.log('Trying alternative path:', altPath);
                        const altImg = new Image();
                        altImg.onload = () => {
                            console.log('Alternative path worked:', altPath);
                            imgElement.src = altPath;
                        };
                        altImg.onerror = tryNextPath;
                        altImg.src = altPath;
                    } else {
                        console.warn('All image paths failed for:', itemName);
                    }
                };
                tryNextPath();
            };
            testImg.src = item.imageUrl;
        }
    }

    function showScreen(sectionElement) {
        if (!sectionElement) return;
        document.querySelectorAll('section.panel').forEach(s => s.classList.add('hidden'));
        sectionElement.classList.remove('hidden');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === sectionElement.id);
        });
        if (sectionElement.id === 'stats' && state.gameData) {
            setTimeout(initializeCharts, 50);
        }
    }

    function displayList(type) {
        state.currentListType = type;
        showScreen(type === 'characters' ? elements.characterSection : elements.keyboardSection);
        filterItems();
    }

    function filterItems() {
        if (!state.gameData) return;
        
        const sourceData = state.currentListType === 'characters' ? state.gameData.characters : state.gameData.kibos;
        const filtered = sourceData.filter(item =>
            (!state.activeFilters.search || JSON.stringify(item).toLowerCase().includes(state.activeFilters.search)) &&
            (state.activeFilters.attributes.length === 0 || state.activeFilters.attributes.includes(item.attribute)) &&
            (state.currentListType !== 'characters' || state.activeFilters.races.length === 0 || state.activeFilters.races.includes(item.race)) &&
            (state.activeFilters.channels.length === 0 || state.activeFilters.channels.some(channel => item.releaseChannel && item.releaseChannel.includes(channel)))
        );
        
        if (elements.resultCountSpan) {
            elements.resultCountSpan.textContent = filtered.length;
        }
        
        if (elements.itemListDiv) {
            elements.itemListDiv.innerHTML = filtered.map(item => {
                const attr = state.gameData.attributes.find(a => a.name === item.attribute);
                const borderColor = attr ? attr.color : getCharacterColor(item.attribute);
                
                // GitHub Pages 寃쎈줈 泥섎━
                let imageSrc = './images/placeholder.png';
                if (item.imageUrl) {
                    // ?덈? 寃쎈줈濡?蹂??
                    if (item.imageUrl.startsWith('images/') || item.imageUrl.startsWith('kibo_image/')) {
                        imageSrc = './' + item.imageUrl;
                    } else {
                        imageSrc = item.imageUrl;
                    }
                }
                
                return `
                <div class="item-card" data-name="${item.name}" style="border-left: 4px solid ${borderColor};">
                    <img src="${imageSrc}" 
                         alt="${item.name}" 
                         loading="lazy" 
                         onerror="handleImageError(this, '${item.imageUrl || ''}')"
                         data-original-src="${item.imageUrl || ''}"
                         data-item-name="${item.name}">
                    <h3>${item.name}</h3>
                    <span class="attribute-tag">${getAttributeEmoji(item.attribute)} ${item.attribute || '誘멸났媛?}</span>
                    <div class="item-info">
                        ${state.currentListType === 'characters' ? `<small>醫낆”: ${item.race || '誘멸났媛?}</small>` : `<small>${item.note || ''}</small>`}
                        <small>梨꾨꼸: ${item.releaseChannel || '誘멸났媛?}</small>
                    </div>
                </div>`;
            }).join('');
            
            // 移대뱶 ?대┃ ?대깽??異붽?
            elements.itemListDiv.querySelectorAll('.item-card').forEach(card => {
                card.onclick = () => {
                    const item = filtered.find(item => item.name === card.dataset.name);
                    if (item) displayDetail(item);
                };
            });
        }
    }

    function displayDetail(item) {
        showScreen(elements.detailSection);
        const type = state.gameData.characters.some(c => c.name === item.name) ? 'characters' : 'kibos';
        const detailsHTML = Object.entries(item.details || {}).map(([key, value]) => `<strong>${key}:</strong><span>${value}</span>`).join('');
        elements.itemDetailDiv.innerHTML = `
            <img src="${imageBasePath + 'placeholder.png'}" alt="${item.name}" id="detail-image">
            <h2>${item.name}</h2>
            <div class="info-grid">
                <strong>?띿꽦:</strong><span>${getAttributeEmoji(item.attribute)}${item.attribute || '誘멸났媛?}</span>
                <strong>${type === 'characters' ? '醫낆”' : '鍮꾧퀬'}:</strong><span>${type === 'characters' ? item.race : item.note}</span>
                <strong>怨듦컻梨꾨꼸:</strong><span>${item.releaseChannel || '誘멸났媛?}</span>
                ${detailsHTML}
            </div>`;
        
        // ?대?吏 濡쒕뵫 泥섎━
        if (item.imageUrl) {
            const detailImg = document.getElementById('detail-image');
            loadImageWithFallback(detailImg, item.imageUrl, item.name);
        }
    }

    function initializeCharts() {
        if (typeof Chart === 'undefined') return;
        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const createChart = (canvas, existingChart, type, data, options) => {
            if (!canvas) return null;
            if (existingChart) existingChart.destroy();
            return new Chart(canvas.getContext('2d'), { type, data, options });
        };
        state.charts.attribute = createChart(elements.attributeChartCanvas, state.charts.attribute, 'pie', { labels: state.gameData.attributes.map(a => a.name), datasets: [{ data: state.gameData.attributes.map(a => a.count), backgroundColor: state.gameData.attributes.map(a => a.color || getCharacterColor(a.name)) }] }, chartOptions);
        state.charts.race = createChart(elements.raceChartCanvas, state.charts.race, 'bar', { labels: state.gameData.races.map(r => r.name), datasets: [{ label: '罹먮┃????, data: state.gameData.races.map(r => r.count), backgroundColor: ['#FF9800', '#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#3F51B5'] }] }, { ...chartOptions, plugins: { legend: { display: false } } });
        state.charts.channel = createChart(elements.channelChartCanvas, state.charts.channel, 'doughnut', { labels: state.gameData.releaseChannels.map(c => c.name), datasets: [{ data: state.gameData.releaseChannels.map(c => c.count), backgroundColor: ['#00BCD4', '#CDDC39', '#FF5722', '#9E9E9E'] }] }, chartOptions);
        state.charts.type = createChart(elements.typeChartCanvas, state.charts.type, 'pie', { labels: ['罹먮┃??, '?ㅻ낫'], datasets: [{ data: [state.gameData.characters.length, state.gameData.kibos.length], backgroundColor: ['#5c6bc0', '#26a69a'] }] }, chartOptions);
    }

    function startFlashcardGame() {
        Object.assign(state.flashcard, { score: 0, currentIndex: 0, questions: [...state.gameData.characters].sort(() => 0.5 - Math.random()).slice(0, 10) });
        elements.flashcardWrap.classList.remove('hidden');
        elements.fcResult.classList.add('hidden');
        loadNextFlashcard();
    }

    function loadNextFlashcard() {
        elements.fcOptions.innerHTML = '';
        elements.fcNextBtn.classList.add('hidden');
        if (state.flashcard.currentIndex >= state.flashcard.totalQuestions) return showFlashcardResult();

        elements.fcCounter.textContent = `${state.flashcard.currentIndex + 1} / ${state.flashcard.totalQuestions}`;
        elements.fcScore.textContent = `${state.flashcard.score} ??;

        const question = state.flashcard.questions[state.flashcard.currentIndex];
        setImageSource(elements.fcImage, question.name);

        const options = generateFlashcardOptions(question.name);
        options.forEach(name => {
            const button = document.createElement('button');
            button.textContent = name;
            button.className = 'fc-option-btn';
            button.onclick = () => handleFlashcardAnswer(name, question.name, button);
            elements.fcOptions.appendChild(button);
        });
    }

    function generateFlashcardOptions(correctAnswer) {
        const allNames = state.gameData.characters.map(c => c.name);
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomName = allNames[Math.floor(Math.random() * allNames.length)];
            if (!options.includes(randomName)) options.push(randomName);
        }
        return options.sort(() => 0.5 - Math.random());
    }

    function handleFlashcardAnswer(selected, correct, button) {
        document.querySelectorAll('.fc-option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correct) btn.classList.add('correct');
        });
        if (selected === correct) {
            state.flashcard.score += 10;
            Toast.success('?뺣떟?낅땲??');
        } else {
            button.classList.add('incorrect');
            Toast.error('?ㅻ떟?낅땲??');
        }
        elements.fcScore.textContent = `${state.flashcard.score} ??;
        elements.fcNextBtn.classList.remove('hidden');
    }

    function showFlashcardResult() {
        elements.flashcardWrap.classList.add('hidden');
        elements.fcResult.classList.remove('hidden');

        // Save score to localStorage
        saveFlashcardScore(state.flashcard.score);

        elements.fcResult.innerHTML = `
            <h3>寃뚯엫 醫낅즺!</h3>
            <p>?먯닔: ${state.flashcard.score}??/p>
            <button id="restart-flashcard" class="btn btn-primary">?ㅼ떆?섍린</button>
        `;
        safeGetElement('restart-flashcard').onclick = startFlashcardGame;

        // Update ranking display
        updateRankingDisplay();
    }

    function saveFlashcardScore(score) {
        const today = new Date().toDateString();
        const scores = JSON.parse(localStorage.getItem('flashcardScores') || '{}');

        if (!scores[today]) scores[today] = [];
        scores[today].push({ score, timestamp: Date.now() });

        // Keep only last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        Object.keys(scores).forEach(date => {
            scores[date] = scores[date].filter(entry => entry.timestamp > sevenDaysAgo);
            if (scores[date].length === 0) delete scores[date];
        });

        localStorage.setItem('flashcardScores', JSON.stringify(scores));
    }

    function updateRankingDisplay() {
        const rankListEl = safeGetElement('rank-list');
        const rankTitleEl = safeGetElement('rank-title');

        if (!rankListEl || !rankTitleEl) return;

        const today = new Date().toDateString();
        const scores = JSON.parse(localStorage.getItem('flashcardScores') || '{}');
        const todayScores = scores[today] || [];

        if (todayScores.length === 0) {
            rankTitleEl.classList.add('hidden');
            rankListEl.innerHTML = '';
            return;
        }

        rankTitleEl.classList.remove('hidden');

        // Sort scores and get top 5
        const topScores = todayScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((entry, index) => ({
                rank: index + 1,
                score: entry.score,
                time: new Date(entry.timestamp).toLocaleTimeString()
            }));

        rankListEl.innerHTML = topScores.map(entry => `
            <li class="rank-item">
                <span class="rank-number">${entry.rank}</span>
                <span class="rank-score">${entry.score}??/span>
                <span class="rank-time">${entry.time}</span>
            </li>
        `).join('');
    }

    function startNewTournament(type) {
        state.tournament.type = type;
        const sourceData = (type === 'characters' ? state.gameData.characters : state.gameData.kibos).filter(i => i.name);
        if (sourceData.length < 2) return Toast.error('??ぉ??遺議깊빀?덈떎.');

        showScreen(elements.tournamentSection);
        elements.winnerDisplay.classList.add('hidden');
        elements.matchupContainer.classList.remove('hidden');

        const size = Math.pow(2, Math.floor(Math.log2(sourceData.length)));
        state.tournament.contestants = sourceData.map(i => i.name).sort(() => 0.5 - Math.random()).slice(0, size);
        state.tournament.winners = [];
        nextMatch();
    }

    function nextMatch() {
        if (state.tournament.contestants.length === 0 && state.tournament.winners.length === 1) return displayWinner(state.tournament.winners[0]);
        if (state.tournament.contestants.length === 0) {
            state.tournament.contestants = [...state.tournament.winners];
            state.tournament.winners = [];
        }
        const roundSize = state.tournament.contestants.length + state.tournament.winners.length;
        elements.tournamentTitle.textContent = `${roundSize === 2 ? "寃곗듅" : `${roundSize}媛?} - ${state.tournament.type === 'characters' ? '罹먮┃?? : '?ㅻ낫'} 理쒖븷 李얘린`;
        state.tournament.matchup = [state.tournament.contestants.pop(), state.tournament.contestants.pop()];
        renderMatchup(state.tournament.matchup[0], elements.matchItem1Div);
        renderMatchup(state.tournament.matchup[1], elements.matchItem2Div);
    }

    function renderMatchup(itemName, element) {
        element.innerHTML = `<img src="${imageBasePath + 'placeholder.png'}" alt="${itemName}"><h3>${itemName}</h3><div class="heart">??/div>`;
        setImageSource(element.querySelector('img'), itemName);
    }

    function handleVote(winnerIndex, selectedElement) {
        if (elements.matchupContainer.dataset.processing === 'true') return;
        elements.matchupContainer.dataset.processing = 'true';
        selectedElement.classList.add('selected');
        setTimeout(() => {
            state.tournament.winners.push(state.tournament.matchup[winnerIndex]);
            selectedElement.classList.remove('selected');
            elements.matchupContainer.dataset.processing = 'false';
            nextMatch();
        }, 800);
    }

    function displayWinner(winnerName) {
        elements.matchupContainer.classList.add('hidden');
        elements.winnerDisplay.classList.remove('hidden');
        elements.tournamentTitle.textContent = `?뱀떊??理쒖븷!`;
        elements.finalWinnerDiv.innerHTML = `<img src="${imageBasePath + 'placeholder.png'}" alt="${winnerName}"><h3>${winnerName}</h3>`;
        setImageSource(elements.finalWinnerDiv.querySelector('img'), winnerName);
    }

    // Event Listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            if (targetId === 'character') displayList('characters');
            else if (targetId === 'keyboard') displayList('kibos');
            else showScreen(elements[`${targetId}Section`] || safeGetElement(targetId));
        };
    });

    elements.backToListBtn.onclick = () => showScreen(state.currentListType === 'characters' ? elements.characterSection : elements.keyboardSection);
    elements.openFavoriteBtn.onclick = () => startNewTournament('characters');
    elements.openFlashcardBtn.onclick = startFlashcardGame;
    elements.fcNextBtn.onclick = () => {
        state.flashcard.currentIndex++;
        loadNextFlashcard();
    };
    elements.matchItem1Div.onclick = () => handleVote(0, elements.matchItem1Div);
    elements.matchItem2Div.onclick = () => handleVote(1, elements.matchItem2Div);
    elements.restartTournamentBtn.onclick = () => startNewTournament(state.tournament.type);
    elements.backToMainMenuBtn.onclick = () => showScreen(elements.characterSection);

// ?꾩뿭 ?곗씠??濡쒕뵫 ?⑥닔
window.loadData = async function() {
    try {
        console.log('Starting data load...');
        
        // 寃쎈줈 ?뺤씤
        const basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
        const jsonPath = basePath + 'data.json';
        console.log('JSON path:', jsonPath);
        console.log('Current URL:', window.location.href);
        
        // ?붿냼 ?뺤씤
        const loader = document.getElementById('loader');
        const mainContent = document.getElementById('main-content');
        
        if (loader) loader.style.display = 'flex';
        
        console.log('Fetching data from:', jsonPath);
        const response = await fetch(jsonPath);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        console.log('Parsing JSON...');
        const raw = await response.json();
        state.gameData = (window.__normalizeRawData ? window.__normalizeRawData(raw) : raw);
        console.log('Data loaded successfully (normalized):', state.gameData);

        // ?대?吏 寃쎈줈 ?뺢퇋??
        normalizeImagePaths();

        // Initialize filters
        initializeFilters();

        // Show main content
        if (loader) loader.style.display = 'none';
        if (mainContent) mainContent.classList.remove('hidden');

        // Show character list by default
        displayList('characters');

        // Update community stats
        updateCommunityStats();

        // Update ranking display
        updateRankingDisplay();

        Toast.success('?곗씠??濡쒕뵫 ?꾨즺!');
        return 'SUCCESS';
    } catch (error) {
        console.error('?곗씠??濡쒕뵫 ?ㅽ뙣:', error);
        const loader = document.getElementById('loader');
        if (loader) {
            loader.innerHTML = `
                <div class="error-message">
                    <h3>?슟 ?곗씠??濡쒕뵫 ?ㅽ뙣</h3>
                    <p>?곗씠?곕? 遺덈윭?????놁뒿?덈떎. ?ㅽ듃?뚰겕 ?곌껐???뺤씤?섍퀬 ?섏씠吏瑜??덈줈怨좎묠?댁＜?몄슂.</p>
                    <p class="error-details">?ㅻ쪟: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">?봽 ?덈줈怨좎묠</button>
                </div>
            `;
        }
        Toast.error('?곗씠??濡쒕뵫???ㅽ뙣?덉뒿?덈떎.');
        return 'FAILED: ' + error.message;
    }
};

    function initializeFilters() {
        if (!state.gameData) return;

        // Initialize attribute filters
        if (elements.attributeFiltersDiv) {
            elements.attributeFiltersDiv.innerHTML = state.gameData.attributes
                .filter(attr => attr.count > 0)
                .map(attr => `
                    <div class="chip" data-value="${attr.name}">
                        ${getAttributeEmoji(attr.name)} ${attr.name} (${attr.count})
                    </div>
                `).join('');

            elements.attributeFiltersDiv.querySelectorAll('.chip').forEach(chip => {
                chip.onclick = () => toggleFilter(chip, 'attributes');
            });
        }

        // Initialize race filters
        if (elements.raceFiltersDiv) {
            elements.raceFiltersDiv.innerHTML = state.gameData.races
                .map(race => `
                    <div class="chip" data-value="${race.name}">
                        ${race.name} (${race.count})
                    </div>
                `).join('');

            elements.raceFiltersDiv.querySelectorAll('.chip').forEach(chip => {
                chip.onclick = () => toggleFilter(chip, 'races');
            });
        }

        // Initialize channel filters
        const channelFiltersDiv = safeGetElement('channel-filters');
        if (channelFiltersDiv) {
            channelFiltersDiv.innerHTML = state.gameData.releaseChannels
                .map(channel => `
                    <div class="chip" data-value="${channel.name}">
                        ${channel.name} (${channel.count})
                    </div>
                `).join('');

            channelFiltersDiv.querySelectorAll('.chip').forEach(chip => {
                chip.onclick = () => toggleFilter(chip, 'channels');
            });
        }
    }

    function toggleFilter(chipElement, filterType) {
        const value = chipElement.dataset.value;
        const isActive = chipElement.classList.contains('active');

        if (isActive) {
            chipElement.classList.remove('active');
            const index = state.activeFilters[filterType].indexOf(value);
            if (index > -1) state.activeFilters[filterType].splice(index, 1);
        } else {
            chipElement.classList.add('active');
            if (!state.activeFilters[filterType].includes(value)) {
                state.activeFilters[filterType].push(value);
            }
        }

        updateActiveFiltersDisplay();
    }

    function updateActiveFiltersDisplay() {
        if (!elements.activeFiltersDiv) return;

        const allFilters = [
            ...state.activeFilters.attributes.map(attr => ({ type: 'attribute', value: attr, display: `${getAttributeEmoji(attr)} ${attr}` })),
            ...state.activeFilters.races.map(race => ({ type: 'race', value: race, display: race })),
            ...(state.activeFilters.channels || []).map(channel => ({ type: 'channel', value: channel, display: channel }))
        ];

        elements.activeFiltersDiv.innerHTML = allFilters.map(filter => `
            <span class="active-filter">
                ${filter.display}
                <span class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">횞</span>
            </span>
        `).join('');

        elements.activeFiltersDiv.querySelectorAll('.remove-filter').forEach(btn => {
            btn.onclick = () => removeFilter(btn.dataset.type, btn.dataset.value);
        });
    }

    function removeFilter(type, value) {
        const filterMap = { attribute: 'attributes', race: 'races', channel: 'channels' };
        const filterKey = filterMap[type];

        if (filterKey && state.activeFilters[filterKey]) {
            const index = state.activeFilters[filterKey].indexOf(value);
            if (index > -1) state.activeFilters[filterKey].splice(index, 1);
        }

        // Update chip visual state
        const chip = document.querySelector(`[data-value="${value}"]`);
        if (chip) chip.classList.remove('active');

        updateActiveFiltersDisplay();
        filterItems();
    }

    function updateCommunityStats() {
        if (!state.gameData) return;

        const totalCharactersEl = safeGetElement('total-characters');
        const totalKibosEl = safeGetElement('total-kibos');
        const totalChannelsEl = safeGetElement('total-channels');
        const lastUpdatedEl = safeGetElement('last-updated');

        if (totalCharactersEl) totalCharactersEl.textContent = state.gameData.characters.length;
        if (totalKibosEl) totalKibosEl.textContent = state.gameData.kibos.length;
        if (totalChannelsEl) totalChannelsEl.textContent = state.gameData.releaseChannels.length;
        if (lastUpdatedEl) lastUpdatedEl.textContent = state.gameData.metadata?.lastUpdated || '?????놁쓬';
    }

    function updateActiveFiltersDisplay() {
        if (!elements.activeFiltersDiv) return;
        
        const activeFilters = [];
        
        // Add search filter
        if (state.activeFilters.search) {
            activeFilters.push({
                type: 'search',
                value: state.activeFilters.search,
                display: `寃?? "${state.activeFilters.search}"`
            });
        }
        
        // Add attribute filters
        state.activeFilters.attributes.forEach(attr => {
            activeFilters.push({
                type: 'attributes',
                value: attr,
                display: `${getAttributeEmoji(attr)} ${attr}`
            });
        });
        
        // Add race filters
        state.activeFilters.races.forEach(race => {
            activeFilters.push({
                type: 'races',
                value: race,
                display: `醫낆”: ${race}`
            });
        });
        
        // Add channel filters
        state.activeFilters.channels.forEach(channel => {
            activeFilters.push({
                type: 'channels',
                value: channel,
                display: `梨꾨꼸: ${channel}`
            });
        });
        
        elements.activeFiltersDiv.innerHTML = activeFilters.map(filter => `
            <div class="active-filter">
                ${filter.display}
                <span class="remove-filter" onclick="removeActiveFilter('${filter.type}', '${filter.value}')">횞</span>
            </div>
        `).join('');
    }

    // Search and filter event listeners
    if (elements.searchInput) {
        elements.searchInput.oninput = (e) => {
            state.activeFilters.search = e.target.value.toLowerCase();
        };
    }

    if (elements.searchButton) {
        elements.searchButton.onclick = filterItems;
    }

    if (elements.applyFiltersBtn) {
        elements.applyFiltersBtn.onclick = filterItems;
    }

    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.onclick = () => {
            state.activeFilters = { search: '', attributes: [], races: [], channels: [] };
            if (elements.searchInput) elements.searchInput.value = '';
            document.querySelectorAll('.chip.active').forEach(chip => chip.classList.remove('active'));
            updateActiveFiltersDisplay();
            filterItems();
        };
    }

    // Initial Load
    loadData();
}

// ?좏떥由ы떚 ?⑥닔??
function getAttributeEmoji(attribute) {
    const emojis = {
        '遺?: '?뵦', '臾?: '?뮛', '??: '?뙅', '踰덇컻': '??, 
        '諛붾엺': '?뙦截?, '?대몺': '?뙌', '鍮?: '??, '?쇱쓬': '?꾬툘', '?섎Т': '?뙯'
    };
    return emojis[attribute] || '??;
}

function getCharacterColor(attribute) {
    const colors = {
        '遺?: '#FF5722', '臾?: '#2196F3', '??: '#795548', '踰덇컻': '#FFEB3B',
        '諛붾엺': '#4CAF50', '?대몺': '#9C27B0', '鍮?: '#FFC107', '?쇱쓬': '#00BCD4', '?섎Т': '#8BC34A'
    };
    return colors[attribute] || '#ccc';
}

// ?대?吏 寃쎈줈 ?뺢퇋???⑥닔
function normalizeImagePaths() {
    if (!state.gameData) return;
    
    console.log('Normalizing image paths...');
    
    // 罹먮┃???대?吏 寃쎈줈 ?뺢퇋??
    state.gameData.characters.forEach(char => {
        if (char.imageUrl && !char.imageUrl.startsWith('http') && !char.imageUrl.startsWith('./')) {
            char.imageUrl = './' + char.imageUrl;
        }
        console.log(`Character ${char.name}: ${char.imageUrl}`);
    });
    
    // ?ㅻ낫 ?대?吏 寃쎈줈 ?뺢퇋??
    state.gameData.kibos.forEach(kibo => {
        if (kibo.imageUrl && !kibo.imageUrl.startsWith('http') && !kibo.imageUrl.startsWith('./')) {
            kibo.imageUrl = './' + kibo.imageUrl;
        }
        console.log(`Kibo ${kibo.name}: ${kibo.imageUrl}`);
    });
}

// ?꾩뿭 ?대?吏 ?ㅻ쪟 泥섎━ ?⑥닔
window.handleImageError = function(imgElement, originalSrc) {
    console.log('Image loading failed for:', originalSrc);
    
    if (!imgElement.dataset.retryAttempted) {
        imgElement.dataset.retryAttempted = 'true';
        
        // ?ㅼ뼇??寃쎈줈 ?쒕룄
        const pathsToTry = [
            './images/placeholder.png',
            'images/placeholder.png',
            '/page/images/placeholder.png',
            'https://via.placeholder.com/200x200/ddd/999?text=No+Image'
        ];
        
        let currentIndex = 0;
        
        const tryNextPath = () => {
            if (currentIndex < pathsToTry.length) {
                const pathToTry = pathsToTry[currentIndex++];
                console.log('Trying fallback path:', pathToTry);
                
                const testImg = new Image();
                testImg.onload = () => {
                    console.log('Fallback image loaded:', pathToTry);
                    imgElement.src = pathToTry;
                };
                testImg.onerror = () => {
                    console.log('Fallback failed:', pathToTry);
                    tryNextPath();
                };
                testImg.src = pathToTry;
            } else {
                // 紐⑤뱺 寃쎈줈 ?ㅽ뙣??SVG placeholder ?ъ슜
                console.log('All fallback paths failed, using SVG placeholder');
                imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }
        };
        
        tryNextPath();
    }
};

// DOM??濡쒕뱶?섎㈃ 珥덇린??
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
(function(){
  if (typeof window === 'undefined') return;
  // Normalizes various raw CSV-derived JSON shapes to the app's expected shape
  function normalizeRawData(raw){
    try{
      if (raw && Array.isArray(raw.characters) && Array.isArray(raw.kibos)) return raw;
      const rows = (arr)=> Array.isArray(arr)? arr : [];
      const pick = (row, patterns)=>{
        if (!row) return '';
        const keys = Object.keys(row);
        for (const k of keys){
          const lower = (k||'').toString().toLowerCase();
          if (patterns.some(p=> lower.includes(p))) return (row[k]||'').toString().trim();
        }
        return '';
      };
      const buildCharacters = ()=>{
        const out=[];
        for (const r of rows(raw.characters)){
          const name = pick(r, ['캐릭','char','name']);
          if (!name) continue;
          const attribute = pick(r, ['속성','attr']);
          const race = pick(r, ['종족','race']);
          const release = pick(r, ['공개','채널','channel']);
          out.push({ name, attribute, race, releaseChannel: release, imageUrl: ''});
        }
        // If empty, try to parse from characterDetails pivot-like rows
        if (out.length===0){
          const det = rows(raw.characterDetails);
          // Collect column names from the first row (header-like)
          if (det.length){
            const firstKey = Object.keys(det[0])[0];
            const cols = Object.keys(det[0]).filter(k=>k!==firstKey);
            const block = {};
            for(const row of det){
              const label = row[firstKey];
              if (!label) continue;
              block[label] = row;
            }
            for (const col of cols){
              const name = (det[0][col]||'').toString().trim();
              if (!name) continue;
              const attribute = (block['속성']?.[col] || block['�Ӽ�']?.[col] || '').toString().trim();
              const race      = (block['종족']?.[col] || block['����']?.[col] || '').toString().trim();
              const release   = (block['공개채널']?.[col] || block['����ä��']?.[col] || '').toString().trim();
              out.push({ name, attribute, race, releaseChannel: release, imageUrl:'' });
            }
          }
        }
        return out;
      };
      const buildKibos = ()=>{
        const src = rows(raw.kibo || raw.kibos);
        const out=[];
        for(const r of src){
          const name = pick(r, ['키보','kibo','name']);
          if (!name) continue;
          const attribute = pick(r, ['속성','attr']);
          const release = pick(r, ['공개','채널','channel']);
          const note = pick(r, ['비고','note']);
          out.push({ name, attribute, note, releaseChannel: release, imageUrl:'', altName:'' });
        }
        return out;
      };
      const characters = buildCharacters();
      const kibos = buildKibos();
      const aggregate = (arr, field)=>{
        const map = new Map();
        for(const o of arr){
          const v=(o?.[field]||'').toString();
          v.split(/\s*&\s*|,\s*/).forEach(p=>{ p=p.trim(); if(p) map.set(p,(map.get(p)||0)+1); });
        }
        return Array.from(map, ([name,count])=>({ name, count, color: undefined }));
      };
      const attributes = aggregate(characters,'attribute');
      const races = Array.from(new Set(characters.map(c=>c.race).filter(Boolean))).map(n=>({name:n, count: characters.filter(c=>c.race===n).length}));
      const releaseChannels = aggregate(characters,'releaseChannel');
      return { characters, kibos, attributes, races, releaseChannels, metadata: raw?.metadata||{} };
    }catch(e){
      console.warn('normalizeRawData fallback failed:', e);
      return raw;
    }
  }
  window.__normalizeRawData = normalizeRawData;
})();

