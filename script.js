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
        toast.innerHTML = `<div class="toast-content">${message}</div><button class="toast-close">×</button><div class="toast-progress" style="animation-duration: ${duration}ms"></div>`;
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

document.addEventListener('DOMContentLoaded', () => {
    Toast.init();

    const elements = {
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

    const state = {
        gameData: null,
        currentListType: 'characters',
        activeFilters: { search: '', attributes: [], races: [], channels: [] },
        charts: { attribute: null, race: null, channel: null, type: null },
        tournament: { type: '', contestants: [], matchup: [], winners: [] },
        flashcard: { questions: [], currentIndex: 0, score: 0, totalQuestions: 10 }
    };

    // GitHub Pages 호환성을 위한 경로 처리
    function getBasePath() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        console.log('Hostname:', hostname, 'Pathname:', pathname);
        
        // GitHub Pages 환경 감지
        if (hostname.includes('github.io')) {
            // GitHub Pages에서는 절대 경로 사용
            if (pathname.includes('/page/')) {
                return '/page/';
            }
            return '/page/'; // 기본적으로 repository name 포함
        }
        
        // 로컬 개발 환경
        return './';
    }
    
    function getAssetPath(relativePath) {
        const basePath = getBasePath();
        console.log('Getting asset path - Base:', basePath, 'Relative:', relativePath);
        
        if (basePath === './') {
            return relativePath.startsWith('./') ? relativePath : './' + relativePath;
        }
        
        // GitHub Pages 절대 경로
        if (relativePath.startsWith('./')) {
            return basePath + relativePath.substring(2);
        }
        return basePath + relativePath;
    }
    
    const jsonDataPath = getAssetPath('data.json');
    const imageBasePath = getAssetPath('images/');
    const getAttributeEmoji = attribute => ({ '불': '🔥', '물': '💧', '땅': '🌋', '번개': '⚡', '바람': '🌪️', '어둠': '🌑', '빛': '✨', '얼음': '❄️', '나무': '🌲' }[attribute] || '');

    function setImageSource(imgElement, itemName) {
        const placeholderPath = imageBasePath + 'placeholder.png';
        imgElement.src = placeholderPath;
        
        const item = (state.gameData.characters.find(c => c.name === itemName) || state.gameData.kibos.find(k => k.name === itemName));
        if (item && item.imageUrl) {
            // 이미지 URL이 이미 전체 경로인지 확인
            if (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')) {
                imgElement.src = item.imageUrl;
            } else {
                imgElement.src = getAssetPath(item.imageUrl);
            }
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
        const sourceData = state.currentListType === 'characters' ? state.gameData.characters : state.gameData.kibos;
        const filtered = sourceData.filter(item =>
            (!state.activeFilters.search || JSON.stringify(item).toLowerCase().includes(state.activeFilters.search)) &&
            (state.activeFilters.attributes.length === 0 || state.activeFilters.attributes.includes(item.attribute)) &&
            (state.currentListType !== 'characters' || state.activeFilters.races.length === 0 || state.activeFilters.races.includes(item.race)) &&
            (state.activeFilters.channels.length === 0 || state.activeFilters.channels.some(channel => item.releaseChannel && item.releaseChannel.includes(channel)))
        );
        elements.resultCountSpan.textContent = filtered.length;
        elements.itemListDiv.innerHTML = filtered.map(item => {
            const attr = state.gameData.attributes.find(a => a.name === item.attribute);
            return `
            <div class="item-card" data-name="${item.name}" style="border-left-color:${attr ? attr.color : '#ccc'}">
                <img src="${item.imageUrl ? getAssetPath(item.imageUrl) : imageBasePath + 'placeholder.png'}" alt="${item.name}" loading="lazy">
                <h3>${item.name}</h3>
                <span class="attribute-tag">${getAttributeEmoji(item.attribute)}${item.attribute || '미공개'}</span>
                <div class="item-info">
                    ${state.currentListType === 'characters' ? `<small>종족: ${item.race || '미공개'}</small>` : `<small>${item.note || ''}</small>`}
                    <small>채널: ${item.releaseChannel || '미공개'}</small>
                </div>
            </div>`;
        }).join('');
        elements.itemListDiv.querySelectorAll('.item-card').forEach(card => {
            card.onclick = () => displayDetail(filtered.find(item => item.name === card.dataset.name));
        });
    }

    function displayDetail(item) {
        showScreen(elements.detailSection);
        const type = state.gameData.characters.some(c => c.name === item.name) ? 'characters' : 'kibos';
        const detailsHTML = Object.entries(item.details || {}).map(([key, value]) => `<strong>${key}:</strong><span>${value}</span>`).join('');
        elements.itemDetailDiv.innerHTML = `
            <img src="${item.imageUrl ? getAssetPath(item.imageUrl) : imageBasePath + 'placeholder.png'}" alt="${item.name}">
            <h2>${item.name}</h2>
            <div class="info-grid">
                <strong>속성:</strong><span>${getAttributeEmoji(item.attribute)}${item.attribute || '미공개'}</span>
                <strong>${type === 'characters' ? '종족' : '비고'}:</strong><span>${type === 'characters' ? item.race : item.note}</span>
                <strong>공개채널:</strong><span>${item.releaseChannel || '미공개'}</span>
                ${detailsHTML}
            </div>`;
    }

    function initializeCharts() {
        if (typeof Chart === 'undefined') return;
        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const createChart = (canvas, existingChart, type, data, options) => {
            if (!canvas) return null;
            if (existingChart) existingChart.destroy();
            return new Chart(canvas.getContext('2d'), { type, data, options });
        };
        state.charts.attribute = createChart(elements.attributeChartCanvas, state.charts.attribute, 'pie', { labels: state.gameData.attributes.map(a => a.name), datasets: [{ data: state.gameData.attributes.map(a => a.count), backgroundColor: state.gameData.attributes.map(a => a.color) }] }, chartOptions);
        state.charts.race = createChart(elements.raceChartCanvas, state.charts.race, 'bar', { labels: state.gameData.races.map(r => r.name), datasets: [{ label: '캐릭터 수', data: state.gameData.races.map(r => r.count), backgroundColor: ['#FF9800', '#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#3F51B5'] }] }, { ...chartOptions, plugins: { legend: { display: false } } });
        state.charts.channel = createChart(elements.channelChartCanvas, state.charts.channel, 'doughnut', { labels: state.gameData.releaseChannels.map(c => c.name), datasets: [{ data: state.gameData.releaseChannels.map(c => c.count), backgroundColor: ['#00BCD4', '#CDDC39', '#FF5722', '#9E9E9E'] }] }, chartOptions);
        state.charts.type = createChart(elements.typeChartCanvas, state.charts.type, 'pie', { labels: ['캐릭터', '키보'], datasets: [{ data: [state.gameData.characters.length, state.gameData.kibos.length], backgroundColor: ['#5c6bc0', '#26a69a'] }] }, chartOptions);
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
        elements.fcScore.textContent = `${state.flashcard.score} 점`;

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
            Toast.success('정답입니다!');
        } else {
            button.classList.add('incorrect');
            Toast.error('오답입니다!');
        }
        elements.fcScore.textContent = `${state.flashcard.score} 점`;
        elements.fcNextBtn.classList.remove('hidden');
    }

    function showFlashcardResult() {
        elements.flashcardWrap.classList.add('hidden');
        elements.fcResult.classList.remove('hidden');

        // Save score to localStorage
        saveFlashcardScore(state.flashcard.score);

        elements.fcResult.innerHTML = `
            <h3>게임 종료!</h3>
            <p>점수: ${state.flashcard.score}점</p>
            <button id="restart-flashcard" class="btn btn-primary">다시하기</button>
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
                <span class="rank-score">${entry.score}점</span>
                <span class="rank-time">${entry.time}</span>
            </li>
        `).join('');
    }

    function startNewTournament(type) {
        state.tournament.type = type;
        const sourceData = (type === 'characters' ? state.gameData.characters : state.gameData.kibos).filter(i => i.name);
        if (sourceData.length < 2) return Toast.error('항목이 부족합니다.');

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
        elements.tournamentTitle.textContent = `${roundSize === 2 ? "결승" : `${roundSize}강`} - ${state.tournament.type === 'characters' ? '캐릭터' : '키보'} 최애 찾기`;
        state.tournament.matchup = [state.tournament.contestants.pop(), state.tournament.contestants.pop()];
        renderMatchup(state.tournament.matchup[0], elements.matchItem1Div);
        renderMatchup(state.tournament.matchup[1], elements.matchItem2Div);
    }

    function renderMatchup(itemName, element) {
        element.innerHTML = `<img src="${imageBasePath + 'placeholder.png'}" alt="${itemName}"><h3>${itemName}</h3><div class="heart">♥</div>`;
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
        elements.tournamentTitle.textContent = `당신의 최애!`;
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

    // Data loading function
    async function loadData() {
        try {
            elements.loader.style.display = 'flex';
            const response = await fetch(getAssetPath(jsonDataPath));
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            state.gameData = await response.json();

            // Initialize filters
            initializeFilters();

            // Show main content
            elements.loader.style.display = 'none';
            elements.mainContent.classList.remove('hidden');

            // Show character list by default
            displayList('characters');

            // Update community stats
            updateCommunityStats();

            // Update ranking display
            updateRankingDisplay();

            Toast.success('데이터 로딩 완료!');
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            elements.loader.innerHTML = `
                <div class="error-message">
                    <h3>🚫 데이터 로딩 실패</h3>
                    <p>데이터를 불러올 수 없습니다. 네트워크 연결을 확인하고 페이지를 새로고침해주세요.</p>
                    <p class="error-details">오류: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">🔄 새로고침</button>
                </div>
            `;
            Toast.error('데이터 로딩에 실패했습니다.');
        }
    }

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
                <span class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">×</span>
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
        if (lastUpdatedEl) lastUpdatedEl.textContent = state.gameData.metadata?.lastUpdated || '알 수 없음';
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
});