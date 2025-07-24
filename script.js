document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // 경로 설정 및 오류 처리 개선
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const jsonDataPath = 'data.json';
    const imageBasePath = 'images/';

    const mainContent = document.getElementById('main-content');
    const loader = document.getElementById('loader');
    const showCharactersBtn = document.getElementById('show-characters');
    const showKibosBtn = document.getElementById('show-kibos');
    const startTournamentFlowBtn = document.getElementById('start-tournament-flow');
    
    const listSection = document.getElementById('list-section');
    const detailSection = document.getElementById('detail-section');
    const tournamentSection = document.getElementById('tournament-section');
    const selectionSection = document.getElementById('selection-section');
    const statsSection = document.getElementById('stats-section');
    const collectionSection = document.getElementById('collection-section');

    const itemListDiv = document.getElementById('item-list');
    const itemDetailDiv = document.getElementById('item-detail');
    const backToListBtn = document.getElementById('back-to-list-button');

    const tournamentTitle = document.getElementById('tournament-title');
    const matchupContainer = document.getElementById('matchup-container');
    const matchItem1Div = document.getElementById('match-item-1');
    const matchItem2Div = document.getElementById('match-item-2');
    const winnerDisplay = document.getElementById('winner-display');
    const finalWinnerDiv = document.getElementById('final-winner');
    const restartTournamentBtn = document.getElementById('restart-tournament');
    const backToMainMenuBtn = document.getElementById('back-to-main-menu');

    const selectCharBtn = document.getElementById('select-char-tournament');
    const selectKiboBtn = document.getElementById('select-kibo-tournament');
    const closeModalBtn = document.querySelector('.close-modal-button');
    
    // 통계 요소
    const showStatsBtn = document.getElementById('show-stats');
    const attributeChartCanvas = document.getElementById('attribute-chart');
    const raceChartCanvas = document.getElementById('race-chart');
    const channelChartCanvas = document.getElementById('channel-chart');
    const typeChartCanvas = document.getElementById('type-chart');
    
    // 컬렉션 요소
    const showOwnedCheckbox = document.getElementById('show-owned');
    const showWishlistCheckbox = document.getElementById('show-wishlist');
    const characterProgressBar = document.getElementById('character-progress');
    const characterProgressText = document.getElementById('character-progress-text');
    const kiboProgressBar = document.getElementById('kibo-progress');
    const kiboProgressText = document.getElementById('kibo-progress-text');
    const collectionAttributeChartCanvas = document.getElementById('collection-attribute-chart');
    const collectionTabs = document.querySelectorAll('.collection-tab');
    const ownedItemsDiv = document.getElementById('owned-items');
    const wishlistItemsDiv = document.getElementById('wishlist-items');
    
    // 검색 및 필터 요소
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const attributeFiltersDiv = document.getElementById('attribute-filters');
    const raceFiltersDiv = document.getElementById('race-filters');
    const channelFiltersDiv = document.getElementById('channel-filters');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const resultCountSpan = document.getElementById('result-count');
    const activeFiltersDiv = document.getElementById('active-filters');

    // --- Data Store ---
    let gameData = null;
    let currentVisibleSection = null;
    let currentListType = 'characters';
    
    // --- Tournament State ---
    let currentTournamentType = '';
    let tournamentContestants = [];
    let currentMatchup = [];
    let tournamentWinners = [];
    
    // --- Filter State ---
    let activeFilters = {
        search: '',
        attributes: [],
        races: [],
        channels: []
    };
    let filteredItems = [];
    
    // --- Chart State ---
    let charts = {
        attribute: null,
        race: null,
        channel: null,
        type: null,
        collectionAttribute: null
    };
    
    // --- Collection State ---
    let collection = {
        owned: [],
        wishlist: []
    };

    function setImageSource(imgElement, itemName) {
        if (!itemName) {
            imgElement.src = imageBasePath + 'placeholder.png';
            return;
        }
        
        const cleanItemName = itemName.trim();
        
        // 먼저 gameData에서 이미지 URL을 찾습니다
        let imageUrl = null;
        
        if (currentListType === 'characters') {
            const character = gameData.characters.find(c => c.name === cleanItemName);
            if (character) {
                imageUrl = character.imageUrl;
            }
        } else {
            const kibo = gameData.kibos.find(k => k.name === cleanItemName);
            if (kibo) {
                imageUrl = kibo.imageUrl;
            }
        }
        
        if (imageUrl) {
            imgElement.src = imageUrl;
        } else {
            imgElement.src = imageBasePath + 'placeholder.png';
        }
        
        imgElement.onerror = () => { imgElement.src = imageBasePath + 'placeholder.png'; };
    }

    function setupDynamicBackground() {
        if (!gameData || !gameData.characters) return;
        
        // 캐릭터 이미지 중에서 gif가 아닌 것만 선택
        const characterImages = gameData.characters
            .map(char => char.imageUrl)
            .filter(url => url && !url.endsWith('.gif'));
            
        if (characterImages.length === 0) return;
        
        const shuffled = characterImages.sort(() => 0.5 - Math.random());
        const backgroundDiv = document.getElementById('dynamic-background');
        backgroundDiv.style.backgroundImage = `url('${shuffled[0]}')`;
    }

    // --- Data Loading ---
    async function fetchJsonData(path) {
        try {
            // 상대 경로로 시도
            let response = await fetch(path);
            if (!response.ok) {
                // 절대 경로로 시도
                response = await fetch(baseUrl + path);
                if (!response.ok) {
                    // GitHub Pages 경로로 시도
                    response = await fetch(`https://jimmy1030good.github.io/page/${path}`);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${path}`);
                    }
                }
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            throw error;
        }
    }

    async function loadData() {
        try {
            console.log("Attempting to load data from:", jsonDataPath);
            gameData = await fetchJsonData(jsonDataPath);
            console.log("Data loaded successfully:", gameData);
            
            // 필터 옵션 초기화
            initializeFilters();
            
            // 차트 초기화
            initializeCharts();
            
            // 컬렉션 데이터 로드
            loadCollection();
            
            // 컬렉션 필터 이벤트 리스너 설정
            setupCollectionFilters();
            
            displayList('characters');
            setupDynamicBackground();
            
            loader.classList.add('invisible');
            mainContent.classList.remove('hidden');

        } catch (error) {
            loader.innerHTML = `<p style="color: red; font-weight: bold;">데이터를 불러오는 데 실패했습니다. JSON 파일 경로를 확인하고, 로컬 서버가 실행 중인지 확인해주세요.</p>
                               <p>오류 메시지: ${error.message}</p>
                               <p>현재 URL: ${window.location.href}</p>`;
            console.error("데이터 로딩 실패:", error);
        }
    }
    
    // --- 필터 초기화 및 설정 ---
    function initializeFilters() {
        if (!gameData) return;
        
        // 속성 필터 옵션 생성
        attributeFiltersDiv.innerHTML = '';
        gameData.attributes.forEach(attr => {
            if (attr.count > 0) {
                const option = createFilterOption(attr.name, attr.color, 'attribute');
                attributeFiltersDiv.appendChild(option);
            }
        });
        
        // 종족 필터 옵션 생성
        raceFiltersDiv.innerHTML = '';
        gameData.races.forEach(race => {
            if (race.count > 0) {
                const option = createFilterOption(race.name, null, 'race');
                raceFiltersDiv.appendChild(option);
            }
        });
        
        // 공개채널 필터 옵션 생성
        channelFiltersDiv.innerHTML = '';
        gameData.releaseChannels.forEach(channel => {
            if (channel.count > 0) {
                const option = createFilterOption(channel.name, null, 'channel');
                channelFiltersDiv.appendChild(option);
            }
        });
        
        // 필터 이벤트 리스너 설정
        setupFilterEventListeners();
    }
    
    function createFilterOption(name, color, type) {
        const option = document.createElement('label');
        option.classList.add('filter-option');
        option.dataset.value = name;
        option.dataset.type = type;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = name;
        
        let content = '';
        if (color) {
            content += `<span class="color-dot" style="background-color: ${color}"></span>`;
        }
        content += name;
        
        option.appendChild(checkbox);
        option.innerHTML += content;
        
        return option;
    }
    
    function setupFilterEventListeners() {
        // 필터 옵션 클릭 이벤트
        const filterOptions = document.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
            });
        });
        
        // 검색 버튼 클릭 이벤트
        searchButton.addEventListener('click', applyFilters);
        
        // 엔터 키 검색 이벤트
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
        
        // 필터 적용 버튼 클릭 이벤트
        applyFiltersBtn.addEventListener('click', applyFilters);
        
        // 필터 초기화 버튼 클릭 이벤트
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    function applyFilters() {
        // 검색어 가져오기
        activeFilters.search = searchInput.value.trim().toLowerCase();
        
        // 선택된 속성 필터 가져오기
        activeFilters.attributes = [];
        document.querySelectorAll('#attribute-filters .filter-option input:checked').forEach(checkbox => {
            activeFilters.attributes.push(checkbox.value);
        });
        
        // 선택된 종족 필터 가져오기
        activeFilters.races = [];
        document.querySelectorAll('#race-filters .filter-option input:checked').forEach(checkbox => {
            activeFilters.races.push(checkbox.value);
        });
        
        // 선택된 공개채널 필터 가져오기
        activeFilters.channels = [];
        document.querySelectorAll('#channel-filters .filter-option input:checked').forEach(checkbox => {
            activeFilters.channels.push(checkbox.value);
        });
        
        // 필터 적용
        filterItems();
        
        // 활성 필터 표시
        updateActiveFilters();
    }
    
    function resetFilters() {
        // 검색어 초기화
        searchInput.value = '';
        
        // 체크박스 초기화
        document.querySelectorAll('.filter-option input').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 선택 스타일 초기화
        document.querySelectorAll('.filter-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 필터 상태 초기화
        activeFilters = {
            search: '',
            attributes: [],
            races: [],
            channels: []
        };
        
        // 필터 적용
        filterItems();
        
        // 활성 필터 표시 초기화
        updateActiveFilters();
    }
    
    function filterItems() {
        const sourceData = currentListType === 'characters' ? gameData.characters : gameData.kibos;
        
        // 모든 필터 조건 적용
        filteredItems = sourceData.filter(item => {
            // 검색어 필터
            if (activeFilters.search && !itemMatchesSearch(item, activeFilters.search)) {
                return false;
            }
            
            // 속성 필터
            if (activeFilters.attributes.length > 0 && !activeFilters.attributes.includes(item.attribute)) {
                return false;
            }
            
            // 종족 필터 (캐릭터만 해당)
            if (currentListType === 'characters' && activeFilters.races.length > 0 && !activeFilters.races.includes(item.race)) {
                return false;
            }
            
            // 공개채널 필터
            if (activeFilters.channels.length > 0 && !activeFilters.channels.includes(item.releaseChannel)) {
                return false;
            }
            
            // 컬렉션 필터링 비활성화
            
            return true;
        });
        
        // 결과 표시
        displayFilteredItems();
    }
    
    function itemMatchesSearch(item, searchTerm) {
        // 이름 검색
        if (item.name.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // 속성 검색
        if (item.attribute.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // 종족 검색 (캐릭터만 해당)
        if (currentListType === 'characters' && item.race && item.race.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // 공개채널 검색
        if (item.releaseChannel && item.releaseChannel.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // 상세 정보 검색
        if (item.details) {
            for (const key in item.details) {
                if (item.details[key] && item.details[key].toString().toLowerCase().includes(searchTerm)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    function displayFilteredItems() {
        // 결과 카운트 업데이트
        resultCountSpan.textContent = filteredItems.length;
        
        // 아이템 목록 표시
        itemListDiv.innerHTML = '';
        
        filteredItems.forEach(item => {
            const itemName = item.name;
            if (!itemName || !itemName.trim()) return;

            const card = document.createElement('div');
            card.classList.add('item-card');
            card.dataset.id = item.id;
            
            // 속성에 따른 색상 적용
            if (item.attribute && item.attribute !== '미공개') {
                const attributeData = gameData.attributes.find(a => a.name === item.attribute);
                if (attributeData) {
                    card.style.borderLeft = `4px solid ${attributeData.color}`;
                }
            }
            
            const img = document.createElement('img');
            setImageSource(img, itemName);
            img.alt = itemName;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(itemName);
            };

            const name = document.createElement('h3');
            name.textContent = itemName;
            
            // 속성 표시 추가
            const attribute = document.createElement('span');
            attribute.classList.add('attribute-tag');
            attribute.textContent = item.attribute || '미공개';
            
            // 컬렉션 버튼 추가
            const collectionButtons = document.createElement('div');
            collectionButtons.classList.add('collection-buttons');
            
            const ownedButton = document.createElement('button');
            ownedButton.classList.add('collection-button', 'owned');
            ownedButton.textContent = '보유';
            if (collection.owned.includes(item.id)) {
                ownedButton.classList.add('active');
            }
            
            const wishlistButton = document.createElement('button');
            wishlistButton.classList.add('collection-button', 'wishlist');
            wishlistButton.textContent = '위시';
            if (collection.wishlist.includes(item.id)) {
                wishlistButton.classList.add('active');
            }
            
            // 컬렉션 버튼 이벤트 리스너
            ownedButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCollection(item.id, 'owned');
                ownedButton.classList.toggle('active');
                if (ownedButton.classList.contains('active') && wishlistButton.classList.contains('active')) {
                    wishlistButton.classList.remove('active');
                    collection.wishlist = collection.wishlist.filter(id => id !== item.id);
                    saveCollection();
                }
            });
            
            wishlistButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCollection(item.id, 'wishlist');
                wishlistButton.classList.toggle('active');
                if (wishlistButton.classList.contains('active') && ownedButton.classList.contains('active')) {
                    ownedButton.classList.remove('active');
                    collection.owned = collection.owned.filter(id => id !== item.id);
                    saveCollection();
                }
            });
            
            collectionButtons.appendChild(ownedButton);
            collectionButtons.appendChild(wishlistButton);
            
            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(attribute);
            card.appendChild(collectionButtons);
            itemListDiv.appendChild(card);
            
            card.addEventListener('click', () => {
                displayDetail(item, currentListType);
            });
        });
    }
    
    function updateActiveFilters() {
        activeFiltersDiv.innerHTML = '';
        
        // 검색어 필터 태그
        if (activeFilters.search) {
            addActiveFilterTag('검색어', activeFilters.search);
        }
        
        // 속성 필터 태그
        activeFilters.attributes.forEach(attr => {
            addActiveFilterTag('속성', attr);
        });
        
        // 종족 필터 태그
        activeFilters.races.forEach(race => {
            addActiveFilterTag('종족', race);
        });
        
        // 공개채널 필터 태그
        activeFilters.channels.forEach(channel => {
            addActiveFilterTag('공개채널', channel);
        });
    }
    
    function addActiveFilterTag(type, value) {
        const tag = document.createElement('div');
        tag.classList.add('active-filter');
        tag.innerHTML = `${type}: ${value} <span class="remove-filter" data-type="${type}" data-value="${value}">×</span>`;
        
        // 필터 제거 이벤트
        const removeBtn = tag.querySelector('.remove-filter');
        removeBtn.addEventListener('click', function() {
            removeFilter(this.dataset.type, this.dataset.value);
        });
        
        activeFiltersDiv.appendChild(tag);
    }
    
    function removeFilter(type, value) {
        switch (type) {
            case '검색어':
                searchInput.value = '';
                activeFilters.search = '';
                break;
            case '속성':
                const attrCheckbox = document.querySelector(`#attribute-filters .filter-option[data-value="${value}"] input`);
                if (attrCheckbox) {
                    attrCheckbox.checked = false;
                    attrCheckbox.closest('.filter-option').classList.remove('selected');
                }
                activeFilters.attributes = activeFilters.attributes.filter(attr => attr !== value);
                break;
            case '종족':
                const raceCheckbox = document.querySelector(`#race-filters .filter-option[data-value="${value}"] input`);
                if (raceCheckbox) {
                    raceCheckbox.checked = false;
                    raceCheckbox.closest('.filter-option').classList.remove('selected');
                }
                activeFilters.races = activeFilters.races.filter(race => race !== value);
                break;
            case '공개채널':
                const channelCheckbox = document.querySelector(`#channel-filters .filter-option[data-value="${value}"] input`);
                if (channelCheckbox) {
                    channelCheckbox.checked = false;
                    channelCheckbox.closest('.filter-option').classList.remove('selected');
                }
                activeFilters.channels = activeFilters.channels.filter(channel => channel !== value);
                break;
        }
        
        // 필터 적용
        filterItems();
        
        // 활성 필터 표시 업데이트
        updateActiveFilters();
    }

    // --- UI Display Functions ---
    function showScreen(sectionElement) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide all sections first
        listSection.classList.add('hidden');
        detailSection.classList.add('hidden');
        tournamentSection.classList.add('hidden');
        statsSection.classList.add('hidden');
        collectionSection.classList.add('hidden');
        
        // Then show the target section
        if (sectionElement) {
            sectionElement.classList.remove('hidden');
        }
    }

    function displayList(type) {
        currentListType = type;
        showScreen(listSection);
        
        // 필터 초기화
        resetFilters();
        
        // 필터링된 아이템 설정
        filteredItems = type === 'characters' ? gameData.characters : gameData.kibos;
        
        // 결과 표시
        displayFilteredItems();
    }

    function displayDetail(item, type) {
        showScreen(detailSection);
        itemDetailDiv.innerHTML = '';

        if (item) {
            const img = document.createElement('img');
            setImageSource(img, item.name);
            img.alt = item.name;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/300?text=' + encodeURIComponent(item.name);
            };

            const title = document.createElement('h2');
            title.textContent = item.name;

            itemDetailDiv.appendChild(img);
            itemDetailDiv.appendChild(title);

            const infoGrid = document.createElement('div');
            infoGrid.classList.add('info-grid');

            // 기본 정보 표시
            const basicInfo = [
                { key: '속성', value: item.attribute || '미공개' },
                { key: type === 'characters' ? '종족' : '비고', value: type === 'characters' ? item.race : item.note },
                { key: '공개채널', value: item.releaseChannel || '미공개' }
            ];
            
            basicInfo.forEach(info => {
                if (info.value) {
                    const strong = document.createElement('strong');
                    strong.textContent = info.key + ':';
                    const span = document.createElement('span');
                    span.textContent = info.value;
                    infoGrid.appendChild(strong);
                    infoGrid.appendChild(span);
                }
            });
            
            // 상세 정보 표시
            if (item.details) {
                for (const key in item.details) {
                    if (item.details[key]) {
                        const strong = document.createElement('strong');
                        strong.textContent = key + ':';
                        const span = document.createElement('span');
                        span.textContent = item.details[key];
                        infoGrid.appendChild(strong);
                        infoGrid.appendChild(span);
                    }
                }
            }
            
            itemDetailDiv.appendChild(infoGrid);
        } else {
            itemDetailDiv.textContent = '상세 정보를 찾을 수 없습니다.';
        }
    }

    // --- Tournament Logic ---
    function startNewTournament(type) {
        selectionSection.classList.add('hidden');
        currentTournamentType = type;
        showScreen(tournamentSection);
        winnerDisplay.classList.add('hidden');
        matchupContainer.classList.remove('hidden');
        
        let sourceData;
        if (type === 'characters') {
            sourceData = gameData.characters;
        } else {
            sourceData = gameData.kibos;
        }

        let contestants = sourceData.map(item => item.name).filter(name => name && name.trim());
        
        if (contestants.length < 2) {
            alert('토너먼트를 진행하기에 항목이 부족합니다.');
            showScreen(listSection);
            return;
        }

        let nextPowerOfTwo = 2;
        while(nextPowerOfTwo < contestants.length) {
            nextPowerOfTwo *= 2;
        }
        
        tournamentContestants = contestants.sort(() => 0.5 - Math.random()).slice(0, nextPowerOfTwo);
        tournamentWinners = [];
        
        nextMatch();
    }

    function nextMatch() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (tournamentContestants.length === 0 && tournamentWinners.length === 1) {
            displayWinner(tournamentWinners[0]);
            return;
        }

        if (tournamentContestants.length < 2) {
            tournamentContestants.push(...tournamentWinners);
            tournamentWinners = [];
        }
        
        const totalContestants = tournamentContestants.length + tournamentWinners.length;
        let roundText = `${totalContestants}강`;
        if (totalContestants === 2) roundText = "결승전";
        else if (totalContestants === 4) roundText = "4강";
        
        tournamentTitle.textContent = `${roundText} - ${currentTournamentType === 'characters' ? '캐릭터' : '키보'} 최애를 선택하세요!`;

        currentMatchup = [tournamentContestants.pop(), tournamentContestants.pop()];
        
        renderMatchup(currentMatchup[0], matchItem1Div);
        renderMatchup(currentMatchup[1], matchItem2Div);
    }

    function renderMatchup(itemName, element) {
        element.innerHTML = '';
        element.classList.remove('selected');
        
        const img = document.createElement('img');
        setImageSource(img, itemName);
        img.alt = itemName;
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300?text=' + encodeURIComponent(itemName);
        };

        const name = document.createElement('h3');
        name.textContent = itemName;

        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.textContent = '♥';

        element.appendChild(img);
        element.appendChild(name);
        element.appendChild(heart);
    }

    function handleVote(winnerIndex, selectedElement) {
        if (matchupContainer.style.pointerEvents === 'none') return;

        selectedElement.classList.add('selected');
        matchupContainer.style.pointerEvents = 'none';

        setTimeout(() => {
            const winner = currentMatchup[winnerIndex];
            tournamentWinners.push(winner);
            selectedElement.classList.remove('selected');
            matchupContainer.style.pointerEvents = 'auto';
            nextMatch();
        }, 800);
    }

    function displayWinner(winnerName) {
        showScreen(tournamentSection);
        matchupContainer.classList.add('hidden');
        winnerDisplay.classList.remove('hidden');
        finalWinnerDiv.innerHTML = '';
        tournamentTitle.textContent = `당신의 ${currentTournamentType === 'characters' ? '캐릭터' : '키보'} 최애!`;

        const img = document.createElement('img');
        setImageSource(img, winnerName);
        img.alt = winnerName;
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400?text=' + encodeURIComponent(winnerName);
        };

        const name = document.createElement('h3');
        name.textContent = winnerName;

        finalWinnerDiv.appendChild(img);
        finalWinnerDiv.appendChild(name);

        // 상세 정보 찾기
        let winnerItem = null;
        if (currentTournamentType === 'characters') {
            winnerItem = gameData.characters.find(c => c.name === winnerName);
        } else {
            winnerItem = gameData.kibos.find(k => k.name === winnerName);
        }
        
        if (winnerItem) {
            const infoGrid = document.createElement('div');
            infoGrid.classList.add('info-grid');
            
            // 기본 정보 표시
            const basicInfo = [
                { key: '속성', value: winnerItem.attribute || '미공개' },
                { key: currentTournamentType === 'characters' ? '종족' : '비고',
                  value: currentTournamentType === 'characters' ? winnerItem.race : winnerItem.note },
                { key: '공개채널', value: winnerItem.releaseChannel || '미공개' }
            ];
            
            basicInfo.forEach(info => {
                if (info.value) {
                    const strong = document.createElement('strong');
                    strong.textContent = info.key + ':';
                    const span = document.createElement('span');
                    span.textContent = info.value;
                    infoGrid.appendChild(strong);
                    infoGrid.appendChild(span);
                }
            });
            
            // 상세 정보 표시
            if (winnerItem.details) {
                for (const key in winnerItem.details) {
                    if (winnerItem.details[key]) {
                        const strong = document.createElement('strong');
                        strong.textContent = key + ':';
                        const span = document.createElement('span');
                        span.textContent = winnerItem.details[key];
                        infoGrid.appendChild(strong);
                        infoGrid.appendChild(span);
                    }
                }
            }
            
            finalWinnerDiv.appendChild(infoGrid);
        }
    }

    // --- Chart Functions ---
    function initializeCharts() {
        // 차트 생성
        createAttributeChart();
        createRaceChart();
        createChannelChart();
        createTypeChart();
    }
    
    function createAttributeChart() {
        // 기존 차트 제거
        if (charts.attribute) {
            charts.attribute.destroy();
        }
        
        // 데이터 준비
        const attributeData = gameData.attributes.filter(attr => attr.count > 0);
        const labels = attributeData.map(attr => attr.name);
        const data = attributeData.map(attr => attr.count);
        const backgroundColor = attributeData.map(attr => attr.color);
        
        // 차트 생성
        const ctx = attributeChartCanvas.getContext('2d');
        charts.attribute = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}개 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function createRaceChart() {
        // 기존 차트 제거
        if (charts.race) {
            charts.race.destroy();
        }
        
        // 데이터 준비
        const raceData = gameData.races.filter(race => race.count > 0);
        const labels = raceData.map(race => race.name);
        const data = raceData.map(race => race.count);
        
        // 색상 생성
        const backgroundColor = [
            '#FF9800', '#9C27B0', '#2196F3', '#4CAF50',
            '#F44336', '#3F51B5', '#009688', '#FFC107',
            '#795548', '#607D8B', '#E91E63', '#673AB7'
        ];
        
        // 차트 생성
        const ctx = raceChartCanvas.getContext('2d');
        charts.race = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '캐릭터 수',
                    data: data,
                    backgroundColor: backgroundColor.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    function createChannelChart() {
        // 기존 차트 제거
        if (charts.channel) {
            charts.channel.destroy();
        }
        
        // 데이터 준비
        const channelData = gameData.releaseChannels.filter(channel => channel.count > 0);
        const labels = channelData.map(channel => channel.name);
        const data = channelData.map(channel => channel.count);
        
        // 색상 생성
        const backgroundColor = [
            '#00BCD4', '#CDDC39', '#FF5722', '#9E9E9E',
            '#8BC34A', '#FF9800', '#9C27B0', '#2196F3'
        ];
        
        // 차트 생성
        const ctx = channelChartCanvas.getContext('2d');
        charts.channel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}개 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function createTypeChart() {
        // 기존 차트 제거
        if (charts.type) {
            charts.type.destroy();
        }
        
        // 데이터 준비
        const characterCount = gameData.characters.length;
        const kiboCount = gameData.kibos.length;
        const total = characterCount + kiboCount;
        const characterPercentage = Math.round((characterCount / total) * 100);
        const kiboPercentage = Math.round((kiboCount / total) * 100);
        
        // 차트 생성
        const ctx = typeChartCanvas.getContext('2d');
        charts.type = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['캐릭터', '키보'],
                datasets: [{
                    data: [characterCount, kiboCount],
                    backgroundColor: ['#5c6bc0', '#26a69a'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = (label === '캐릭터') ? characterPercentage : kiboPercentage;
                                return `${label}: ${value}개 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function displayStats() {
        showScreen(statsSection);
        
        // 차트 업데이트
        createAttributeChart();
        createRaceChart();
        createChannelChart();
        createTypeChart();
    }
    
    // --- Collection Functions ---
    function loadCollection() {
        const savedCollection = localStorage.getItem('azureCollection');
        if (savedCollection) {
            collection = JSON.parse(savedCollection);
        }
        
        updateCollectionStats();
    }
    
    function saveCollection() {
        localStorage.setItem('azureCollection', JSON.stringify(collection));
        updateCollectionStats();
    }
    
    function toggleCollection(itemId, type) {
        if (collection[type].includes(itemId)) {
            collection[type] = collection[type].filter(id => id !== itemId);
        } else {
            collection[type].push(itemId);
        }
        
        saveCollection();
    }
    
    function setupCollectionFilters() {
        // 컬렉션 필터 기능 비활성화
    }
    
    function updateCollectionStats() {
        // 캐릭터 보유율 계산
        const totalCharacters = gameData.characters.length;
        const ownedCharacters = gameData.characters.filter(char => collection.owned.includes(char.id)).length;
        const characterPercentage = totalCharacters > 0 ? Math.round((ownedCharacters / totalCharacters) * 100) : 0;
        
        // 키보 보유율 계산
        const totalKibos = gameData.kibos.length;
        const ownedKibos = gameData.kibos.filter(kibo => collection.owned.includes(kibo.id)).length;
        const kiboPercentage = totalKibos > 0 ? Math.round((ownedKibos / totalKibos) * 100) : 0;
        
        // 프로그레스 바 업데이트
        characterProgressBar.style.width = `${characterPercentage}%`;
        characterProgressText.textContent = `${ownedCharacters}/${totalCharacters} (${characterPercentage}%)`;
        
        kiboProgressBar.style.width = `${kiboPercentage}%`;
        kiboProgressText.textContent = `${ownedKibos}/${totalKibos} (${kiboPercentage}%)`;
        
        // 속성별 보유 현황 차트 업데이트
        updateCollectionAttributeChart();
        
        // 컬렉션 아이템 목록 업데이트
        updateCollectionItems();
    }
    
    function updateCollectionAttributeChart() {
        // 기존 차트 제거
        if (charts.collectionAttribute) {
            charts.collectionAttribute.destroy();
        }
        
        // 속성별 보유 현황 데이터 준비
        const attributeData = gameData.attributes.filter(attr => attr.count > 0);
        const labels = attributeData.map(attr => attr.name);
        
        // 속성별 보유 캐릭터/키보 수 계산
        const ownedCounts = [];
        const totalCounts = [];
        
        attributeData.forEach(attr => {
            const attrCharacters = gameData.characters.filter(char => char.attribute === attr.name);
            const attrKibos = gameData.kibos.filter(kibo => kibo.attribute === attr.name);
            const attrItems = [...attrCharacters, ...attrKibos];
            
            const ownedAttrItems = attrItems.filter(item => collection.owned.includes(item.id));
            
            ownedCounts.push(ownedAttrItems.length);
            totalCounts.push(attrItems.length);
        });
        
        // 차트 생성
        const ctx = collectionAttributeChartCanvas.getContext('2d');
        charts.collectionAttribute = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '보유',
                        data: ownedCounts,
                        backgroundColor: attributeData.map(attr => attr.color),
                        borderWidth: 1
                    },
                    {
                        label: '미보유',
                        data: totalCounts.map((total, i) => total - ownedCounts[i]),
                        backgroundColor: attributeData.map(attr => {
                            const color = attr.color;
                            return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
                        }),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    function updateCollectionItems() {
        // 보유 아이템 목록 업데이트
        ownedItemsDiv.innerHTML = '';
        const ownedItems = [...gameData.characters, ...gameData.kibos].filter(item => collection.owned.includes(item.id));
        
        ownedItems.forEach(item => {
            const card = createCollectionItemCard(item);
            ownedItemsDiv.appendChild(card);
        });
        
        // 위시리스트 아이템 목록 업데이트
        wishlistItemsDiv.innerHTML = '';
        const wishlistItems = [...gameData.characters, ...gameData.kibos].filter(item => collection.wishlist.includes(item.id));
        
        wishlistItems.forEach(item => {
            const card = createCollectionItemCard(item);
            wishlistItemsDiv.appendChild(card);
        });
    }
    
    function createCollectionItemCard(item) {
        const card = document.createElement('div');
        card.classList.add('item-card');
        
        // 속성에 따른 색상 적용
        if (item.attribute && item.attribute !== '미공개') {
            const attributeData = gameData.attributes.find(a => a.name === item.attribute);
            if (attributeData) {
                card.style.borderLeft = `4px solid ${attributeData.color}`;
            }
        }
        
        const img = document.createElement('img');
        setImageSource(img, item.name);
        img.alt = item.name;
        
        const name = document.createElement('h3');
        name.textContent = item.name;
        
        const attribute = document.createElement('span');
        attribute.classList.add('attribute-tag');
        attribute.textContent = item.attribute || '미공개';
        
        const type = document.createElement('span');
        type.classList.add('attribute-tag');
        type.textContent = gameData.characters.includes(item) ? '캐릭터' : '키보';
        
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(attribute);
        card.appendChild(type);
        
        card.addEventListener('click', () => {
            const itemType = gameData.characters.includes(item) ? 'characters' : 'kibos';
            displayDetail(item, itemType);
        });
        
        return card;
    }
    
    function displayCollection() {
        showScreen(collectionSection);
        updateCollectionStats();
    }
    
    // --- Event Listeners ---
    showCharactersBtn.addEventListener('click', () => displayList('characters'));
    showKibosBtn.addEventListener('click', () => displayList('kibos'));
    showStatsBtn.addEventListener('click', displayStats);
    backToListBtn.addEventListener('click', () => displayList(currentListType));
    
    startTournamentFlowBtn.addEventListener('click', () => {
        selectionSection.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => selectionSection.classList.add('hidden'));
    selectCharBtn.addEventListener('click', () => startNewTournament('characters'));
    selectKiboBtn.addEventListener('click', () => startNewTournament('kibos'));

    matchItem1Div.addEventListener('click', () => handleVote(0, matchItem1Div));
    matchItem2Div.addEventListener('click', () => handleVote(1, matchItem2Div));
    
    restartTournamentBtn.addEventListener('click', () => startNewTournament(currentTournamentType));
    backToMainMenuBtn.addEventListener('click', () => showScreen(listSection));
    
    // 컬렉션 버튼 추가 코드 비활성화

    // --- Initial Load ---
    loadData();
});
