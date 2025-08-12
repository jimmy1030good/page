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
        if (!this.processing) {
            this.processQueue();
        }
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
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
            <button class="toast-close">×</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
        `;
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
    
    const jsonDataPath = './data.json';
    const imageBasePath = './images/';

    const mainContent = safeGetElement('main-content');
    const loader = safeGetElement('loader');
    const characterSection = safeGetElement('character');
    const keyboardSection = safeGetElement('keyboard');
    const detailSection = safeGetElement('detail-section');
    const tournamentSection = safeGetElement('tournament-section');
    const statsSection = safeGetElement('stats');
    const communitySection = safeGetElement('community');
    const minigameSection = safeGetElement('minigame');
    const itemListDiv = safeGetElement('item-list');
    const itemDetailDiv = safeGetElement('item-detail');
    const backToListBtn = safeGetElement('back-to-list-button');
    const tournamentTitle = safeGetElement('tournament-title');
    const matchupContainer = safeGetElement('matchup-container');
    const matchItem1Div = safeGetElement('match-item-1');
    const matchItem2Div = safeGetElement('match-item-2');
    const winnerDisplay = safeGetElement('winner-display');
    const finalWinnerDiv = safeGetElement('final-winner');
    const restartTournamentBtn = safeGetElement('restart-tournament');
    const backToMainMenuBtn = safeGetElement('back-to-main-menu');
    const attributeChartCanvas = safeGetElement('attribute-chart');
    const raceChartCanvas = safeGetElement('race-chart');
    const channelChartCanvas = safeGetElement('channel-chart');
    const typeChartCanvas = safeGetElement('type-chart');
    const searchInput = safeGetElement('search-input');
    const searchButton = safeGetElement('search-button');
    const attributeFiltersDiv = safeGetElement('attribute-filters');
    const raceFiltersDiv = safeGetElement('race-filters');
    const channelFiltersDiv = safeGetElement('channel-filters');
    const applyFiltersBtn = safeGetElement('apply-filters');
    const resetFiltersBtn = safeGetElement('reset-filters');
    const resultCountSpan = safeGetElement('result-count');
    const activeFiltersDiv = safeGetElement('active-filters');
    const openFavoriteBtn = safeGetElement('open-favorite');
    const openFlashcardBtn = safeGetElement('open-flashcard');
    const flashcardWrap = safeGetElement('flashcard-wrap');
    const fcCounter = safeGetElement('fc-counter');
    const fcScore = safeGetElement('fc-score');
    const fcImage = safeGetElement('fc-image');
    const fcOptions = safeGetElement('fc-options');
    const fcNextBtn = safeGetElement('fc-next');
    const fcResult = safeGetElement('fc-result');

    let gameData = null;
    let currentListType = 'characters';
    let currentTournamentType = '';
    let tournamentContestants = [];
    let currentMatchup = [];
    let tournamentWinners = [];
    let activeFilters = { search: '', attributes: [], races: [], channels: [] };
    let filteredItems = [];
    let charts = { attribute: null, race: null, channel: null, type: null };
    let flashcard = { questions: [], currentIndex: 0, score: 0, totalQuestions: 10 };

    const getAttributeEmoji = attribute => ({'불':'🔥','물':'💧','땅':'🌋','번개':'⚡','바람':'🌪️','어둠':'🌑','빛':'✨','얼음':'❄️','나무':'🌲'}[attribute] || '');

    function setImageSource(imgElement, itemName) {
        imgElement.src = `${imageBasePath}placeholder.png`;
        const item = (gameData.characters.find(c => c.name === itemName) || gameData.kibos.find(k => k.name === itemName));
        if (item && item.imageUrl) {
            imgElement.src = item.imageUrl;
        }
    }

    async function loadData() {
        try {
            gameData = await (await fetch(jsonDataPath)).json();
            initializeFilters();
            resetFilters();
            displayList('characters');
            loader.classList.add('invisible');
            mainContent.classList.remove('hidden');
            characterSection.classList.add('visible');
        } catch (error) {
            loader.innerHTML = `<p style="color:red;">데이터 로딩 실패: ${error.message}</p>`;
        }
    }

    function initializeFilters() {
        attributeFiltersDiv.innerHTML = gameData.attributes.filter(a => a.count > 0).map(attr => createFilterOption(attr.name, attr.color, 'attribute')).join('');
        raceFiltersDiv.innerHTML = gameData.races.filter(r => r.count > 0).map(race => createFilterOption(race.name, null, 'race')).join('');
        setupFilterEventListeners();
    }

    const createFilterOption = (name, color, type) => `
        <label class="filter-option" data-value="${name}" data-type="${type}">
            <input type="checkbox" value="${name}">
            ${color ? `<span class="color-dot" style="background-color:${color}"></span>` : ''}
            ${name}
        </label>`;

    function setupFilterEventListeners() {
        document.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', function() {
                const checkbox = this.querySelector('input');
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
            });
        });
        searchButton.onclick = applyFilters;
        searchInput.onkeypress = e => e.key === 'Enter' && applyFilters();
        applyFiltersBtn.onclick = applyFilters;
        resetFiltersBtn.onclick = resetFilters;
    }

    function applyFilters() {
        activeFilters.search = searchInput.value.trim().toLowerCase();
        activeFilters.attributes = Array.from(document.querySelectorAll('#attribute-filters input:checked')).map(cb => cb.value);
        activeFilters.races = Array.from(document.querySelectorAll('#race-filters input:checked')).map(cb => cb.value);
        filterItems();
        updateActiveFilters();
    }

    function resetFilters() {
        searchInput.value = '';
        document.querySelectorAll('.filter-option input:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('.filter-option.selected').forEach(opt => opt.classList.remove('selected'));
        activeFilters = { search: '', attributes: [], races: [] };
        filterItems();
        updateActiveFilters();
    }

    function filterItems() {
        const sourceData = currentListType === 'characters' ? gameData.characters : gameData.kibos;
        filteredItems = sourceData.filter(item => 
            (!activeFilters.search || JSON.stringify(item).toLowerCase().includes(activeFilters.search)) &&
            (activeFilters.attributes.length === 0 || activeFilters.attributes.includes(item.attribute)) &&
            (currentListType !== 'characters' || activeFilters.races.length === 0 || activeFilters.races.includes(item.race))
        );
        displayFilteredItems();
    }

    function displayFilteredItems() {
        resultCountSpan.textContent = filteredItems.length;
        itemListDiv.innerHTML = filteredItems.map(item => {
            const attr = gameData.attributes.find(a => a.name === item.attribute);
            return `
            <div class="item-card" data-id="${item.id}" style="border-left-color:${attr ? attr.color : '#ccc'}">
                <img src="${item.imageUrl || imageBasePath + 'placeholder.png'}" alt="${item.name}" loading="lazy">
                <h3>${item.name}</h3>
                <span class="attribute-tag">${getAttributeEmoji(item.attribute)}${item.attribute || '미공개'}</span>
            </div>`;
        }).join('');
        itemListDiv.querySelectorAll('.item-card').forEach(card => {
            card.onclick = () => displayDetail(filteredItems.find(item => item.id == card.dataset.id));
        });
    }
    
    function updateActiveFilters() {
        activeFiltersDiv.innerHTML = '';
        if (activeFilters.search) addActiveFilterTag('검색어', activeFilters.search);
        activeFilters.attributes.forEach(attr => addActiveFilterTag('속성', attr));
        activeFilters.races.forEach(race => addActiveFilterTag('종족', race));
    }

    function addActiveFilterTag(type, value) {
        const tag = document.createElement('div');
        tag.className = 'active-filter';
        tag.textContent = `${type}: ${value} `;
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-filter';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => removeFilter(type, value);
        tag.appendChild(removeBtn);
        activeFiltersDiv.appendChild(tag);
    }

    function removeFilter(type, value) {
        if (type === '검색어') activeFilters.search = '';
        if (type === '속성') activeFilters.attributes = activeFilters.attributes.filter(v => v !== value);
        if (type === '종족') activeFilters.races = activeFilters.races.filter(v => v !== value);
        resetFilters(); 
        applyFilters();
    }

    function showScreen(sectionElement) {
        if (!sectionElement) return;
        document.querySelectorAll('section.panel').forEach(s => s.classList.add('hidden'));
        sectionElement.classList.remove('hidden');
        updateActiveNavButton(sectionElement);
        if (sectionElement.id === 'stats') {
            setTimeout(initializeCharts, 50);
        }
    }

    function updateActiveNavButton(activeSection) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === activeSection.id);
        });
    }

    function displayList(type) {
        currentListType = type;
        showScreen(type === 'characters' ? characterSection : keyboardSection);
        filterItems();
    }

    function displayDetail(item) {
        showScreen(detailSection);
        const type = gameData.characters.some(c => c.id === item.id) ? 'characters' : 'kibos';
        const detailsHTML = Object.entries(item.details || {}).map(([key, value]) => `<strong>${key}:</strong><span>${value}</span>`).join('');
        itemDetailDiv.innerHTML = `
            <img src="${item.imageUrl || imageBasePath + 'placeholder.png'}" alt="${item.name}">
            <h2>${item.name}</h2>
            <div class="info-grid">
                <strong>속성:</strong><span>${getAttributeEmoji(item.attribute)}${item.attribute || '미공개'}</span>
                <strong>${type === 'characters' ? '종족' : '비고'}:</strong><span>${type === 'characters' ? item.race : item.note}</span>
                <strong>공개채널:</strong><span>${item.releaseChannel || '미공개'}</span>
                ${detailsHTML}
            </div>`;
    }

    function startNewTournament(type) {
        currentTournamentType = type;
        const sourceData = (type === 'characters' ? gameData.characters : gameData.kibos).filter(i => i.name);
        if (sourceData.length < 2) return Toast.error('항목이 부족합니다.');
        
        showScreen(tournamentSection);
        winnerDisplay.classList.add('hidden');
        matchupContainer.classList.remove('hidden');
        
        const size = Math.pow(2, Math.floor(Math.log2(sourceData.length)));
        tournamentContestants = sourceData.map(i => i.name).sort(() => 0.5 - Math.random()).slice(0, size);
        tournamentWinners = [];
        nextMatch();
    }

    function nextMatch() {
        if (tournamentContestants.length === 0 && tournamentWinners.length === 1) return displayWinner(tournamentWinners[0]);
        if (tournamentContestants.length === 0) {
            tournamentContestants = [...tournamentWinners];
            tournamentWinners = [];
        }
        const roundSize = tournamentContestants.length + tournamentWinners.length;
        tournamentTitle.textContent = `${roundSize === 2 ? "결승" : `${roundSize}강`} - ${currentTournamentType === 'characters' ? '캐릭터' : '키보'} 최애 찾기`;
        currentMatchup = [tournamentContestants.pop(), tournamentContestants.pop()];
        renderMatchup(currentMatchup[0], matchItem1Div);
        renderMatchup(currentMatchup[1], matchItem2Div);
    }

    function renderMatchup(itemName, element) {
        element.innerHTML = `<img src="${imageBasePath}placeholder.png" alt="${itemName}"><h3>${itemName}</h3><div class="heart">♥</div>`;
        setImageSource(element.querySelector('img'), itemName);
    }

    function handleVote(winnerIndex, selectedElement) {
        if (matchupContainer.dataset.processing === 'true') return;
        matchupContainer.dataset.processing = 'true';
        selectedElement.classList.add('selected');
        setTimeout(() => {
            tournamentWinners.push(currentMatchup[winnerIndex]);
            selectedElement.classList.remove('selected');
            matchupContainer.dataset.processing = 'false';
            nextMatch();
        }, 800);
    }

    function displayWinner(winnerName) {
        matchupContainer.classList.add('hidden');
        winnerDisplay.classList.remove('hidden');
        tournamentTitle.textContent = `당신의 최애!`;
        finalWinnerDiv.innerHTML = `<img src="${imageBasePath}placeholder.png" alt="${winnerName}"><h3>${winnerName}</h3>`;
        setImageSource(finalWinnerDiv.querySelector('img'), winnerName);
    }

    function initializeCharts() {
        if (typeof Chart === 'undefined') return console.error("Chart.js is not loaded.");
        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const createChart = (canvas, existingChart, type, data, options) => {
            if (!canvas) return null;
            if (existingChart) existingChart.destroy();
            return new Chart(canvas.getContext('2d'), { type, data, options });
        };
        charts.attribute = createChart(attributeChartCanvas, charts.attribute, 'pie', { labels: gameData.attributes.map(a => a.name), datasets: [{ data: gameData.attributes.map(a => a.count), backgroundColor: gameData.attributes.map(a => a.color) }] }, chartOptions);
        charts.race = createChart(raceChartCanvas, charts.race, 'bar', { labels: gameData.races.map(r => r.name), datasets: [{ label: '캐릭터 수', data: gameData.races.map(r => r.count), backgroundColor: ['#FF9800', '#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#3F51B5'] }] }, { ...chartOptions, plugins: { legend: { display: false } } });
        charts.channel = createChart(channelChartCanvas, charts.channel, 'doughnut', { labels: gameData.releaseChannels.map(c => c.name), datasets: [{ data: gameData.releaseChannels.map(c => c.count), backgroundColor: ['#00BCD4', '#CDDC39', '#FF5722', '#9E9E9E'] }] }, chartOptions);
        charts.type = createChart(typeChartCanvas, charts.type, 'pie', { labels: ['캐릭터', '키보'], datasets: [{ data: [gameData.characters.length, gameData.kibos.length], backgroundColor: ['#5c6bc0', '#26a69a'] }] }, chartOptions);
    }

    function startFlashcardGame() {
        flashcard.score = 0;
        flashcard.currentIndex = 0;
        flashcard.questions = [...gameData.characters].sort(() => 0.5 - Math.random()).slice(0, flashcard.totalQuestions);
        flashcardWrap.classList.remove('hidden');
        fcResult.classList.add('hidden');
        loadNextFlashcard();
    }

    function loadNextFlashcard() {
        fcOptions.innerHTML = '';
        fcNextBtn.classList.add('hidden');
        if (flashcard.currentIndex >= flashcard.totalQuestions) return showFlashcardResult();
        
        fcCounter.textContent = `${flashcard.currentIndex + 1} / ${flashcard.totalQuestions}`;
        fcScore.textContent = `${flashcard.score} 점`;
        
        const question = flashcard.questions[flashcard.currentIndex];
        setImageSource(fcImage, question.name);
        
        const options = generateFlashcardOptions(question.name);
        options.forEach(name => {
            const button = document.createElement('button');
            button.textContent = name;
            button.className = 'fc-option-btn';
            button.onclick = () => handleFlashcardAnswer(name, question.name, button);
            fcOptions.appendChild(button);
        });
    }

    function generateFlashcardOptions(correctAnswer) {
        const allNames = gameData.characters.map(c => c.name);
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
            flashcard.score += 10;
            Toast.success('정답입니다!');
        } else {
            button.classList.add('incorrect');
            Toast.error('오답입니다!');
        }
        fcScore.textContent = `${flashcard.score} 점`;
        fcNextBtn.classList.remove('hidden');
    }

    function showFlashcardResult() {
        flashcardWrap.classList.add('hidden');
        fcResult.classList.remove('hidden');
        fcResult.innerHTML = `<h3>게임 종료!</h3><p>점수: ${flashcard.score}점</p><button id="restart-flashcard" class="btn btn-primary">다시하기</button>`;
        safeGetElement('restart-flashcard').onclick = startFlashcardGame;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            const section = safeGetElement(targetId);
            if (targetId === 'character') displayList('characters');
            else if (targetId === 'keyboard') displayList('kibos');
            else if (section) showScreen(section);
        };
    });

    backToListBtn.onclick = () => showScreen(currentListType === 'characters' ? characterSection : keyboardSection);
    openFavoriteBtn.onclick = () => startNewTournament('characters');
    openFlashcardBtn.onclick = () => startFlashcardGame();
    fcNextBtn.onclick = () => {
        flashcard.currentIndex++;
        loadNextFlashcard();
    };
    matchItem1Div.onclick = () => handleVote(0, matchItem1Div);
    matchItem2Div.onclick = () => handleVote(1, matchItem2Div);
    restartTournamentBtn.onclick = () => startNewTournament(currentTournamentType);
    backToMainMenuBtn.onclick = () => showScreen(characterSection);

    loadData();
});
