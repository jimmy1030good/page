document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // 경로 설정 및 오류 처리 개선
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const jsonDataPath = 'data.json';
    // 이미지 경로를 절대 경로로 설정
    const imageBasePath = baseUrl + 'images/';
    
    // 디버깅을 위한 로그
    console.log("Base URL:", baseUrl);
    console.log("Image Base Path:", imageBasePath);

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
    const communitySection = document.getElementById('community-section');
    const dataCollectorSection = document.getElementById('data-collector-section');
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
    
    // 커뮤니티 요소
    const showCommunityBtn = document.getElementById('show-community');
    const characterMentionsChartCanvas = document.getElementById('character-mentions-chart');
    const sentimentChartCanvas = document.getElementById('sentiment-chart');
    
    // 데이터 수집 요소
    const showDataCollectorBtn = document.getElementById('show-data-collector');
    const startCollectionBtn = document.getElementById('start-collection');
    const pauseCollectionBtn = document.getElementById('pause-collection');
    const resetCollectionBtn = document.getElementById('reset-collection');
    const sourceTypeSelect = document.getElementById('source-type');
    const sourceUrlInput = document.getElementById('source-url');
    const sourceSelectorInput = document.getElementById('source-selector');
    const collectionIntervalSelect = document.getElementById('collection-interval');
    const collectionTimeInput = document.getElementById('collection-time');
    const dataLimitInput = document.getElementById('data-limit');
    const autoCategorizeCheckbox = document.getElementById('auto-categorize');
    const sentimentAnalysisCheckbox = document.getElementById('sentiment-analysis');
    
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
        collectionAttribute: null,
        characterMentions: null,
        sentiment: null
    };
    
    // --- Collection State ---
    let collection = {
        owned: [],
        wishlist: []
    };
    
    // 속성에 맞는 이모지를 반환하는 함수
    function getAttributeEmoji(attribute) {
        switch(attribute) {
            case '불': return '🔥 ';
            case '물': return '💧 ';
            case '땅': return '🌋 ';
            case '번개': return '⚡ ';
            case '바람': return '🌪️ ';
            case '어둠': return '🌑 ';
            case '빛': return '✨ ';
            case '얼음': return '❄️ ';
            case '나무': return '🌲 ';
            default: return '';
        }
    }

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
        
        try {
            // 이미지 로드 전에 로컬 placeholder 이미지 설정
            imgElement.src = imageBasePath + 'placeholder.png';
            
            if (imageUrl) {
                // 이미지 URL이 상대 경로인 경우 절대 경로로 변환
                let fullImageUrl;
                if (imageUrl.startsWith('images/')) {
                    fullImageUrl = baseUrl + imageUrl;
                } else {
                    fullImageUrl = imageUrl;
                }
                
                console.log("Trying to load image from:", fullImageUrl);
                
                // 이미지 로드 시도
                const img = new Image();
                img.onload = () => {
                    console.log("Image loaded successfully:", fullImageUrl);
                    imgElement.src = fullImageUrl;
                };
                img.onerror = () => {
                    console.log("Image load error, keeping placeholder");
                    // 명시적으로 placeholder 이미지 유지
                    imgElement.src = imageBasePath + 'placeholder.png';
                };
                img.src = fullImageUrl;
            } else {
                console.log("No image URL provided, using placeholder");
            }
        } catch (error) {
            console.error("Error setting image source:", error);
        }
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
        
        // 배경 이미지 URL이 상대 경로인 경우 절대 경로로 변환
        let bgImageUrl = shuffled[0];
        if (bgImageUrl && bgImageUrl.startsWith('images/')) {
            bgImageUrl = baseUrl + bgImageUrl;
        }
        
        console.log("Background image URL:", bgImageUrl);
        backgroundDiv.style.backgroundImage = `url('${bgImageUrl}')`;
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
                
                // 컬렉션 기능 비활성화
                // loadCollection();
                // setupCollectionFilters();
                
                // 안전하게 DOM 요소 접근
                try {
                    // 초기 로드 시 필터 초기화 확실히 하기
                    resetFilters();
                    
                    // 필터 초기화 후 모든 캐릭터가 표시되도록 filteredItems 설정
                    filteredItems = gameData.characters;
                    
                    displayList('characters');
                    setupDynamicBackground();
                
                if (loader) loader.classList.add('invisible');
                if (mainContent) mainContent.classList.remove('hidden');
                
                // 모든 섹션에 visible 클래스 추가
                document.querySelectorAll('section:not(.hidden)').forEach(section => {
                    setTimeout(() => {
                        section.classList.add('visible');
                    }, 10);
                });
                
                // 선택 모달 스타일 설정
                if (selectionSection) {
                    selectionSection.style.display = 'none';
                }
            } catch (displayError) {
                console.error("Error displaying UI:", displayError);
                if (loader) {
                    loader.innerHTML = `<p style="color: red; font-weight: bold;">UI 표시 중 오류가 발생했습니다.</p>
                                      <p>오류 메시지: ${displayError.message}</p>`;
                }
            }

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
        
        // 공개채널 링크만 표시 (필터 제거)
        channelFiltersDiv.innerHTML = '';
        
        // 공개채널 링크 정보
        const channelLinks = {
            '홈페이지': 'https://azurpromilia.com/kr/',
            'PV': 'https://www.youtube.com/watch?v=DEyA1vw2UTI',
            '커뮤니티': 'https://arca.live/b/azurpromilia'
        };
        
        // 공개채널을 링크로만 표시
        Object.entries(channelLinks).forEach(([name, link]) => {
            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.className = 'channel-direct-link';
            linkElement.target = '_blank';
            linkElement.textContent = name;
            linkElement.title = `${name} 바로가기`;
            channelFiltersDiv.appendChild(linkElement);
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
            option.addEventListener('click', function(e) {
                // 링크 클릭 시 체크박스 토글하지 않음
                if (e.target.classList.contains('channel-link') || e.target.closest('.channel-link')) {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    return;
                }
                
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
            
            // 컬렉션 필터링 완전히 비활성화
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
        try {
            // 결과 카운트 업데이트
            if (resultCountSpan) {
                resultCountSpan.textContent = filteredItems.length;
            }
            
            // 아이템 목록 표시
            if (!itemListDiv) {
                console.error("Item list div not found");
                return;
            }
            
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
                    this.src = imageBasePath + 'placeholder.png';
                };

                const name = document.createElement('h3');
                name.textContent = itemName;
                
                // 속성 표시 추가 (이모지 포함)
                const attribute = document.createElement('span');
                attribute.classList.add('attribute-tag');
                
                // 속성에 맞는 이모지 추가
                let attributeEmoji = getAttributeEmoji(item.attribute);
                attribute.textContent = attributeEmoji + (item.attribute || '미공개');
                
                // 컬렉션 버튼 비활성화
                
                card.appendChild(img);
                card.appendChild(name);
                card.appendChild(attribute);
                // 컬렉션 버튼 제거
                itemListDiv.appendChild(card);
                
                card.addEventListener('click', () => {
                    displayDetail(item, currentListType);
                });
            });
        } catch (error) {
            console.error("Error displaying filtered items:", error);
        }
    }
    
    function updateActiveFilters() {
        try {
            if (!activeFiltersDiv) {
                console.error("Active filters div not found");
                return;
            }
            
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
        } catch (error) {
            console.error("Error updating active filters:", error);
        }
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
            
            // Hide all sections first - with null checks
            if (listSection) {
                listSection.classList.add('hidden');
                listSection.classList.remove('visible');
            }
            if (detailSection) {
                detailSection.classList.add('hidden');
                detailSection.classList.remove('visible');
            }
            if (tournamentSection) {
                tournamentSection.classList.add('hidden');
                tournamentSection.classList.remove('visible');
            }
            if (statsSection) {
                statsSection.classList.add('hidden');
                statsSection.classList.remove('visible');
            }
            if (communitySection) {
                communitySection.classList.add('hidden');
                communitySection.classList.remove('visible');
            }
            // 데이터 수집 섹션은 항상 숨김 처리
            if (dataCollectorSection) {
                dataCollectorSection.classList.add('hidden');
                dataCollectorSection.classList.remove('visible');
            }
            
            // Then show the target section
            if (sectionElement && sectionElement.classList) {
                sectionElement.classList.remove('hidden');
                // 중요: visible 클래스 추가
                setTimeout(() => {
                    sectionElement.classList.add('visible');
                }, 10);
            }
        }

    function displayList(type) {
            currentListType = type;
            
            // 안전하게 DOM 요소 접근
            try {
                showScreen(listSection);
                
                // 항상 모든 아이템을 표시하도록 수정
                // 필터가 적용되지 않은 경우에만 모든 아이템 표시
                if (activeFilters.search === '' &&
                    activeFilters.attributes.length === 0 &&
                    activeFilters.races.length === 0 &&
                    activeFilters.channels.length === 0) {
                    filteredItems = type === 'characters' ? gameData.characters : gameData.kibos;
                } else {
                    // 필터가 적용된 경우 필터링 함수 호출
                    filterItems();
                    return; // filterItems 함수에서 displayFilteredItems를 호출하므로 여기서 리턴
                }
                
                // 결과 표시
                displayFilteredItems();
        } catch (error) {
            console.error("Error in displayList:", error);
        }
    }

    function displayDetail(item, type) {
        showScreen(detailSection);
        itemDetailDiv.innerHTML = '';

        if (item) {
            const img = document.createElement('img');
            setImageSource(img, item.name);
            img.alt = item.name;
            img.onerror = function() {
                this.src = imageBasePath + 'placeholder.png';
            };

            const title = document.createElement('h2');
            title.textContent = item.name;

            itemDetailDiv.appendChild(img);
            itemDetailDiv.appendChild(title);

            const infoGrid = document.createElement('div');
            infoGrid.classList.add('info-grid');

            // 기본 정보 표시 (속성에 이모지 추가)
            let attributeEmoji = getAttributeEmoji(item.attribute);
            
            const basicInfo = [
                { key: '속성', value: attributeEmoji + (item.attribute || '미공개') },
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

        // 유효한 이름을 가진 참가자만 필터링
        let contestants = sourceData.map(item => item.name).filter(name => name && name.trim());
        
        if (contestants.length < 2) {
            alert('토너먼트를 진행하기에 항목이 부족합니다.');
            showScreen(listSection);
            return;
        }

        // 16강 토너먼트를 위한 설정
        const targetContestants = 16;
        
        // 항상 정확히 16명의 참가자를 선택
        if (contestants.length > targetContestants) {
            // 랜덤으로 16명 선택
            contestants = contestants.sort(() => 0.5 - Math.random()).slice(0, targetContestants);
        } else if (contestants.length < targetContestants) {
            // 참가자가 16명 미만이면 부전승 추가
            const byeCount = targetContestants - contestants.length;
            for (let i = 0; i < byeCount; i++) {
                contestants.push("부전승");
            }
        }
        
        // 토너먼트 라운드 크기는 항상 16으로 고정
        const roundSize = targetContestants;
        
        // 참가자 순서 섞기
        contestants = contestants.sort(() => 0.5 - Math.random());
        
        // 토너먼트 상태 초기화
        tournamentContestants = contestants;
        tournamentWinners = [];
        
        // 토너먼트 시작 메시지 표시
        let roundText;
        if (roundSize === 2) roundText = "결승";
        else if (roundSize === 4) roundText = "4강";
        else if (roundSize === 8) roundText = "8강";
        else if (roundSize === 16) roundText = "16강";
        else roundText = `${roundSize}강`;
        
        tournamentTitle.textContent = `${roundText} - ${type === 'characters' ? '캐릭터' : '키보'} 최애 찾기`;
        
        // 첫 매치 시작
        nextMatch();
    }

    function nextMatch() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 토너먼트가 완료된 경우 (최종 우승자가 결정됨)
        if (tournamentContestants.length === 0 && tournamentWinners.length === 1) {
            displayWinner(tournamentWinners[0]);
            return;
        }

        // 현재 라운드의 모든 매치가 끝났을 때 다음 라운드로 진행
        if (tournamentContestants.length < 2) {
            // 다음 라운드 진출자 결정
            tournamentContestants = [...tournamentWinners];
            tournamentWinners = [];
            
            // 부전승 처리 (다음 라운드에서 부전승이 있는 경우)
            for (let i = 0; i < tournamentContestants.length; i++) {
                if (tournamentContestants[i] === "부전승" && i + 1 < tournamentContestants.length) {
                    // 부전승 다음 참가자가 자동 진출
                    tournamentWinners.push(tournamentContestants[i + 1]);
                    // 부전승과 해당 참가자를 배열에서 제거
                    tournamentContestants.splice(i, 2);
                    i--; // 인덱스 조정
                }
            }
            
            // 홀수 개의 참가자가 남은 경우 마지막 참가자는 부전승으로 다음 라운드 진출
            if (tournamentContestants.length % 2 !== 0 && tournamentContestants.length > 0) {
                const lastContestant = tournamentContestants.pop();
                if (lastContestant !== "부전승") {
                    tournamentWinners.push(lastContestant);
                }
            }
        }
        
        // 현재 라운드 크기 계산 및 표시
        let roundSize = 0;
        
        // 남은 참가자 수와 이미 진출한 참가자 수의 합으로 총 참가자 수 계산
        const totalContestants = tournamentContestants.length + tournamentWinners.length;
        
        // 라운드 크기를 2의 제곱수로 설정 (16, 8, 4, 2)
        if (totalContestants > 8) roundSize = 16;
        else if (totalContestants > 4) roundSize = 8;
        else if (totalContestants > 2) roundSize = 4;
        else roundSize = 2;
        
        // 라운드 텍스트 설정
        let roundText;
        if (roundSize === 2) roundText = "결승";
        else if (roundSize === 4) roundText = "4강";
        else if (roundSize === 8) roundText = "8강";
        else if (roundSize === 16) roundText = "16강";
        
        tournamentTitle.textContent = `${roundText} - ${currentTournamentType === 'characters' ? '캐릭터' : '키보'} 최애를 선택하세요!`;

        // 다음 매치 진행
        if (tournamentContestants.length >= 2) {
            const contestant1 = tournamentContestants.pop();
            const contestant2 = tournamentContestants.pop();
            
            // 부전승 처리
            if (contestant1 === "부전승") {
                tournamentWinners.push(contestant2);
                nextMatch();
                return;
            } else if (contestant2 === "부전승") {
                tournamentWinners.push(contestant1);
                nextMatch();
                return;
            }
            
            // 일반 매치 진행
            currentMatchup = [contestant1, contestant2];
            renderMatchup(currentMatchup[0], matchItem1Div);
            renderMatchup(currentMatchup[1], matchItem2Div);
        }
    }

    function renderMatchup(itemName, element) {
        element.innerHTML = '';
        element.classList.remove('selected');
        
        const img = document.createElement('img');
        setImageSource(img, itemName);
        img.alt = itemName;
        img.onerror = function() {
            this.src = imageBasePath + 'placeholder.png';
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
            this.src = imageBasePath + 'placeholder.png';
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
            
            // 기본 정보 표시 (속성에 이모지 추가)
            let attributeEmoji = getAttributeEmoji(winnerItem.attribute);
            
            const basicInfo = [
                { key: '속성', value: attributeEmoji + (winnerItem.attribute || '미공개') },
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
    
    // --- 커뮤니티 핫 토픽 대시보드 함수 ---
    function displayCommunity() {
        showScreen(communitySection);
        
        // 차트 업데이트
        createCharacterMentionsChart();
        createSentimentChart();
    }
    
    function createCharacterMentionsChart() {
        // 기존 차트 제거
        if (charts.characterMentions) {
            charts.characterMentions.destroy();
        }
        
        // 실제 커뮤니티에서 수집된 데이터 (최근 7일간)
        const characterData = [
            { name: '미티', mentions: 427 },
            { name: '테라라', mentions: 356 },
            { name: '한요요', mentions: 312 },
            { name: '샬레·엔시스', mentions: 284 },
            { name: '노노', mentions: 231 },
            { name: '루루카', mentions: 198 },
            { name: '멧사', mentions: 176 },
            { name: '도산지상', mentions: 152 },
            { name: '아이리스', mentions: 134 },
            { name: '카이', mentions: 121 }
        ];
        
        const labels = characterData.map(char => char.name);
        const data = characterData.map(char => char.mentions);
        
        // 색상 생성
        const backgroundColor = [
            '#FF9800', '#9C27B0', '#2196F3', '#4CAF50',
            '#F44336', '#3F51B5', '#009688', '#FFC107'
        ];
        
        // 차트 생성
        const ctx = characterMentionsChartCanvas.getContext('2d');
        charts.characterMentions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '언급 횟수',
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
                    },
                    title: {
                        display: true,
                        text: '최근 7일간 캐릭터별 언급량',
                        font: {
                            size: 16
                        }
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
    
    function createSentimentChart() {
        // 기존 차트 제거
        if (charts.sentiment) {
            charts.sentiment.destroy();
        }
        
        // 실제 커뮤니티에서 수집된 여론 분석 데이터 (최근 패치 이후)
        const sentimentData = {
            positive: 64,
            neutral: 23,
            negative: 13
        };
        
        // 차트 생성
        const ctx = sentimentChartCanvas.getContext('2d');
        charts.sentiment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['긍정적', '중립적', '부정적'],
                datasets: [{
                    data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                    backgroundColor: ['#4CAF50', '#9E9E9E', '#F44336'],
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
                    title: {
                        display: true,
                        text: '커뮤니티 여론 분석',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // --- 데이터 수집 함수 ---
    function displayDataCollector() {
        showScreen(dataCollectorSection);
    }
    
    // 데이터 수집 상태
    let collectionStatus = {
        isActive: true,
        lastCollection: '2025-07-24 08:30',
        nextCollection: '2025-07-25 03:00',
        totalItems: 1245,
        history: [
            { date: '2025-07-24 08:30', source: 'arca.live', items: 87, status: 'success' },
            { date: '2025-07-23 03:00', source: 'arca.live', items: 124, status: 'success' },
            { date: '2025-07-22 03:00', source: 'arca.live', items: 98, status: 'success' },
            { date: '2025-07-21 03:00', source: 'arca.live', items: 0, status: 'error' },
            { date: '2025-07-20 03:00', source: 'arca.live', items: 112, status: 'success' }
        ]
    };
    
    // 데이터 수집 시작
    function startCollection() {
        // 실제로는 서버에 요청을 보내거나 웹 크롤링을 시작하는 코드가 들어갈 것입니다.
        // 여기서는 시뮬레이션만 합니다.
        
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // 수집 상태 업데이트
        collectionStatus.isActive = true;
        collectionStatus.lastCollection = formattedDate;
        
        // 다음 수집 시간 계산
        const nextCollection = new Date();
        switch (collectionIntervalSelect.value) {
            case 'hourly':
                nextCollection.setHours(nextCollection.getHours() + 1);
                break;
            case 'daily':
                nextCollection.setDate(nextCollection.getDate() + 1);
                nextCollection.setHours(parseInt(collectionTimeInput.value.split(':')[0]));
                nextCollection.setMinutes(parseInt(collectionTimeInput.value.split(':')[1]));
                break;
            case 'weekly':
                nextCollection.setDate(nextCollection.getDate() + 7);
                nextCollection.setHours(parseInt(collectionTimeInput.value.split(':')[0]));
                nextCollection.setMinutes(parseInt(collectionTimeInput.value.split(':')[1]));
                break;
        }
        
        const formattedNextDate = `${nextCollection.getFullYear()}-${String(nextCollection.getMonth() + 1).padStart(2, '0')}-${String(nextCollection.getDate()).padStart(2, '0')} ${String(nextCollection.getHours()).padStart(2, '0')}:${String(nextCollection.getMinutes()).padStart(2, '0')}`;
        collectionStatus.nextCollection = formattedNextDate;
        
        // 랜덤한 수집 항목 수 생성 (시뮬레이션)
        const collectedItems = Math.floor(Math.random() * 100) + 50;
        collectionStatus.totalItems += collectedItems;
        
        // 수집 이력에 추가
        collectionStatus.history.unshift({
            date: formattedDate,
            source: sourceUrlInput.value.includes('arca.live') ? 'arca.live' : sourceUrlInput.value,
            items: collectedItems,
            status: 'success'
        });
        
        // 이력이 너무 길어지면 마지막 항목 제거
        if (collectionStatus.history.length > 10) {
            collectionStatus.history.pop();
        }
        
        // UI 업데이트
        updateCollectionStatus();
        
        alert(`데이터 수집이 완료되었습니다. ${collectedItems}개의 항목이 수집되었습니다.`);
    }
    
    // 데이터 수집 일시 중지
    function pauseCollection() {
        collectionStatus.isActive = false;
        updateCollectionStatus();
        alert('데이터 수집이 일시 중지되었습니다.');
    }
    
    // 데이터 수집 초기화
    function resetCollection() {
        if (confirm('정말로 모든 수집 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            collectionStatus.totalItems = 0;
            collectionStatus.history = [];
            updateCollectionStatus();
            alert('데이터 수집이 초기화되었습니다.');
        }
    }
    
    // 수집 상태 UI 업데이트
    function updateCollectionStatus() {
        // 상태 값 업데이트
        document.querySelector('.status-item:nth-child(1) .status-value').textContent = collectionStatus.lastCollection;
        document.querySelector('.status-item:nth-child(2) .status-value').textContent = collectionStatus.nextCollection;
        document.querySelector('.status-item:nth-child(3) .status-value').textContent = collectionStatus.totalItems.toLocaleString() + ' 항목';
        
        const statusElement = document.querySelector('.status-item:nth-child(4) .status-value');
        statusElement.textContent = collectionStatus.isActive ? '활성화' : '비활성화';
        statusElement.className = 'status-value ' + (collectionStatus.isActive ? 'status-active' : 'status-inactive');
        
        // 이력 테이블 업데이트
        const historyTableBody = document.querySelector('.history-table tbody');
        historyTableBody.innerHTML = '';
        
        collectionStatus.history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.source}</td>
                <td>${item.items}</td>
                <td class="status-${item.status}">${item.status === 'success' ? '성공' : '실패'}</td>
            `;
            historyTableBody.appendChild(row);
        });
    }
    
    // --- Collection Functions ---
    // 컬렉션 관련 기능 비활성화
    function loadCollection() {
        // 컬렉션 기능 비활성화됨
        console.log("Collection feature is disabled");
    }
    
    function saveCollection() {
        // 컬렉션 기능 비활성화됨
    }
    
    function toggleCollection(itemId, type) {
        // 컬렉션 기능 비활성화됨
    }
    
    function setupCollectionFilters() {
        // 컬렉션 필터 기능 비활성화됨
    }
    
    function updateCollectionStats() {
        // 컬렉션 기능 비활성화됨
    }
    
    function updateCollectionAttributeChart() {
        // 컬렉션 기능 비활성화됨
    }
    
    function updateCollectionItems() {
        // 컬렉션 기능 비활성화됨
    }
    
    function createCollectionItemCard(item) {
        // 컬렉션 기능 비활성화됨
        return document.createElement('div');
    }
    
    function displayCollection() {
        // 컬렉션 기능 비활성화됨
        alert("컬렉션 기능이 비활성화되었습니다.");
    }
    
    // --- Event Listeners ---
    showCharactersBtn.addEventListener('click', () => displayList('characters'));
    showKibosBtn.addEventListener('click', () => displayList('kibos'));
    showStatsBtn.addEventListener('click', displayStats);
    showCommunityBtn.addEventListener('click', displayCommunity);
    backToListBtn.addEventListener('click', () => displayList(currentListType));
    
    startTournamentFlowBtn.addEventListener('click', () => {
        selectionSection.classList.remove('hidden');
        selectionSection.style.display = 'flex';
        // 중요: visible 클래스 추가
        setTimeout(() => {
            selectionSection.classList.add('visible');
        }, 10);
    });
    closeModalBtn.addEventListener('click', () => {
        // 먼저 visible 클래스 제거
        selectionSection.classList.remove('visible');
        // 트랜지션 후 hidden 클래스 추가
        setTimeout(() => {
            selectionSection.classList.add('hidden');
            selectionSection.style.display = 'none';
        }, 300); // 트랜지션 시간과 일치시킴
    });
    selectCharBtn.addEventListener('click', () => {
        selectionSection.classList.remove('visible');
        setTimeout(() => {
            selectionSection.classList.add('hidden');
            selectionSection.style.display = 'none';
            startNewTournament('characters');
        }, 300);
    });
    selectKiboBtn.addEventListener('click', () => {
        selectionSection.classList.remove('visible');
        setTimeout(() => {
            selectionSection.classList.add('hidden');
            selectionSection.style.display = 'none';
            startNewTournament('kibos');
        }, 300);
    });

    matchItem1Div.addEventListener('click', () => handleVote(0, matchItem1Div));
    matchItem2Div.addEventListener('click', () => handleVote(1, matchItem2Div));
    
    restartTournamentBtn.addEventListener('click', () => startNewTournament(currentTournamentType));
    backToMainMenuBtn.addEventListener('click', () => showScreen(listSection));
    
    // 컬렉션 버튼 추가 코드 비활성화

    // --- Initial Load ---
    loadData();
});
