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
    };

    const state = {
        gameData: null,
        currentListType: 'characters',
        activeFilters: { search: '', attributes: [], races: [] },
        charts: { attribute: null, race: null, channel: null, type: null },
        tournament: { type: '', contestants: [], matchup: [], winners: [] },
        flashcard: { questions: [], currentIndex: 0, score: 0, totalQuestions: 10 }
    };

    const jsonDataPath = './data.json';
    const imageBasePath = './images/';
    const getAttributeEmoji = attribute => ({'불':'🔥','물':'💧','땅':'🌋','번개':'⚡','바람':'🌪️','어둠':'🌑','빛':'✨','얼음':'❄️','나무':'🌲'}[attribute] || '');

    function setImageSource(imgElement, itemName) {
        imgElement.src = `${imageBasePath}placeholder.png`;
        const item = (state.gameData.characters.find(c => c.name === itemName) || state.gameData.kibos.find(k => k.name === itemName));
        if (item && item.imageUrl) imgElement.src = item.imageUrl;
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
            (state.currentListType !== 'characters' || state.activeFilters.races.length === 0 || state.activeFilters.races.includes(item.race))
        );
        elements.resultCountSpan.textContent = filtered.length;
        elements.itemListDiv.innerHTML = filtered.map(item => {
            const attr = state.gameData.attributes.find(a => a.name === item.attribute);
            return `
            <div class="item-card" data-name="${item.name}" style="border-left-color:${attr ? attr.color : '#ccc'}">
                <img src="${item.imageUrl || imageBasePath + 'placeholder.png'}" alt="${item.name}" loading="lazy">
                <h3>${item.name}</h3>
                <span class="attribute-tag">${getAttributeEmoji(item.attribute)}${item.attribute || '미공개'}</span>
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
            <img src="${item.imageUrl || imageBasePath + 'placeholder.png'}" alt="${item.name}">
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
        elements.fcResult.innerHTML = `<h3>게임 종료!</h3><p>점수: ${state.flashcard.score}점</p><button id="restart-flashcard" class="btn btn-primary">다시하기</button>`;
        safeGetElement('restart-flashcard').onclick = startFlashcardGame;
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
        element.innerHTML = `<img src="${imageBasePath}placeholder.png" alt="${itemName}"><h3>${itemName}</h3><div class="heart">♥</div>`;
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
        elements.finalWinnerDiv.innerHTML = `<img src="${imageBasePath}placeholder.png" alt="${winnerName}"><h3>${winnerName}</h3>`;
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

    // Initial Load
    loadData();
});