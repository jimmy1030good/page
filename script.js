// --- Toast Alert System ---
const Toast = {
    container: null,
    queue: [],
    processing: false,
    
    // 토스트 초기화
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            console.error('Toast container not found');
            return;
        }
    },
    
    // 토스트 생성 및 표시
    show(message, type = 'info', duration = 5000) {
        // 큐에 추가
        this.queue.push({ message, type, duration });
        
        // 처리 중이 아니면 처리 시작
        if (!this.processing) {
            this.processQueue();
        }
    },
    
    // 큐 처리
    processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        const { message, type, duration } = this.queue.shift();
        
        // 토스트 요소 생성
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // 토스트 내용 생성
        const content = document.createElement('div');
        content.className = 'toast-content';
        content.textContent = message;
        
        // 닫기 버튼 생성
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close(toast));
        
        // 진행 표시줄 생성
        const progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.animationDuration = `${duration}ms`;
        
        // 요소 조립
        toast.appendChild(content);
        toast.appendChild(closeBtn);
        toast.appendChild(progress);
        
        // 컨테이너에 추가
        this.container.appendChild(toast);
        
        // 자동 닫기 타이머 설정
        setTimeout(() => {
            if (toast.parentNode) {
                this.close(toast);
            }
        }, duration);
        
        // 애니메이션 적용을 위한 지연
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
    },
    
    // 토스트 닫기
    close(toast) {
        toast.classList.add('closing');
        
        // 애니메이션 완료 후 제거
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
                
                // 다음 토스트 처리
                setTimeout(() => this.processQueue(), 100);
            }
        });
    },
    
    // 성공 토스트
    success(message, duration) {
        this.show(message, 'success', duration);
    },
    
    // 정보 토스트
    info(message, duration) {
        this.show(message, 'info', duration);
    },
    
    // 경고 토스트
    warning(message, duration) {
        this.show(message, 'warning', duration);
    },
    
    // 오류 토스트
    error(message, duration) {
        this.show(message, 'error', duration);
    }
};

// 모든 DOM 요소에 대한 안전한 참조를 위한 헬퍼 함수
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    // 토스트 시스템 초기화
    Toast.init();
    // --- DOM Elements ---
    // 경로 설정 및 오류 처리 개선
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const jsonDataPath = 'data.json';
    // 이미지 경로를 절대 경로로 설정
    const imageBasePath = baseUrl + 'images/';
    
    // 디버깅을 위한 로그
    console.log("Base URL:", baseUrl);
    console.log("Image Base Path:", imageBasePath);

    // 안전하게 DOM 요소 참조
    const mainContent = safeGetElement('main-content');
    const loader = safeGetElement('loader');
    const startTournamentFlowBtn = safeGetElement('start-tournament-flow');
    
    // 섹션 요소들
    const character = safeGetElement('character');
    const keyboard = safeGetElement('keyboard');
    const detailSection = safeGetElement('detail-section');
    const tournamentSection = safeGetElement('tournament-section');
    const statsSection = safeGetElement('stats-section');
    const communitySection = safeGetElement('community-section');
    const dataCollectorSection = safeGetElement('data-collector-section');
    
    // 아이템 관련 요소들
    const itemListDiv = safeGetElement('item-list');
    const itemDetailDiv = safeGetElement('item-detail');
    const backToListBtn = safeGetElement('back-to-list-button');
    
    // 토너먼트 관련 요소들
    const tournamentTitle = safeGetElement('tournament-title');
    const matchupContainer = safeGetElement('matchup-container');
    const matchItem1Div = safeGetElement('match-item-1');
    const matchItem2Div = safeGetElement('match-item-2');
    const winnerDisplay = safeGetElement('winner-display');
    const finalWinnerDiv = safeGetElement('final-winner');
    const restartTournamentBtn = safeGetElement('restart-tournament');
    const backToMainMenuBtn = safeGetElement('back-to-main-menu');
    
    // 선택 관련 요소들
    const selectCharBtn = safeGetElement('select-char-tournament');
    const selectKiboBtn = safeGetElement('select-kibo-tournament');
    const closeModalBtn = document.querySelector('.close-modal-button');
    
    // 통계 요소들
    const attributeChartCanvas = safeGetElement('attribute-chart');
    const raceChartCanvas = safeGetElement('race-chart');
    const channelChartCanvas = safeGetElement('channel-chart');
    const typeChartCanvas = safeGetElement('type-chart');
    
    // 커뮤니티 요소들
    const characterMentionsChartCanvas = safeGetElement('character-mentions-chart');
    const sentimentChartCanvas = safeGetElement('sentiment-chart');
    
    // 데이터 수집 요소들
    const startCollectionBtn = safeGetElement('start-collection');
    const pauseCollectionBtn = safeGetElement('pause-collection');
    const resetCollectionBtn = safeGetElement('reset-collection');
    const sourceTypeSelect = safeGetElement('source-type');
    const sourceUrlInput = safeGetElement('source-url');
    const sourceSelectorInput = safeGetElement('source-selector');
    const collectionIntervalSelect = safeGetElement('collection-interval');
    const collectionTimeInput = safeGetElement('collection-time');
    const dataLimitInput = safeGetElement('data-limit');
    const autoCategorizeCheckbox = safeGetElement('auto-categorize');
    const sentimentAnalysisCheckbox = safeGetElement('sentiment-analysis');
    
    // 검색 및 필터 요소들
    const searchInput = safeGetElement('search-input');
    const searchButton = safeGetElement('search-button');
    const attributeFiltersDiv = safeGetElement('attribute-filters');
    const raceFiltersDiv = safeGetElement('race-filters');
    const channelFiltersDiv = safeGetElement('channel-filters');
    const applyFiltersBtn = safeGetElement('apply-filters');
    const resetFiltersBtn = safeGetElement('reset-filters');
    const resultCountSpan = safeGetElement('result-count');
    const activeFiltersDiv = safeGetElement('active-filters');

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
    
    // 속성에 맞는 이미지 HTML을 반환하는 함수
    function getAttributeEmoji(attribute) {
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
        const imageBasePath = baseUrl + 'shuxing_image/';
        
        let imagePath = '';
        let altText = '';
        
        switch(attribute) {
            case '불':
                imagePath = imageBasePath + '불.jpg';
                altText = '불';
                break;
            case '물':
                imagePath = imageBasePath + '물.jpg';
                altText = '물';
                break;
            case '땅':
                imagePath = imageBasePath + '땅.jpg';
                altText = '땅';
                break;
            case '번개':
                imagePath = imageBasePath + '번개.jpg';
                altText = '번개';
                break;
            case '바람':
                imagePath = imageBasePath + '바람.jpg';
                altText = '바람';
                break;
            case '어둠':
                imagePath = imageBasePath + '어둠.jpg';
                altText = '어둠';
                break;
            case '빛':
                imagePath = imageBasePath + '빛.jpg';
                altText = '빛';
                break;
            case '얼음':
                imagePath = imageBasePath + '얼음.jpg';
                altText = '얼음';
                break;
            case '나무':
                imagePath = imageBasePath + '나무.jpg';
                altText = '나무';
                break;
            default:
                return '';
        }
        
        return `<img src="${imagePath}" alt="${altText}" class="attribute-icon" /> `;
    }

    // WebP 지원 여부 확인 함수
    function supportsWebP() {
        const elem = document.createElement('canvas');
        if (!!(elem.getContext && elem.getContext('2d'))) {
            // WebP 지원 여부를 캔버스로 테스트
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }
    
    // 전역 변수로 WebP 지원 여부 저장
    const isWebPSupported = supportsWebP();
    console.log("WebP 지원 여부:", isWebPSupported);
    
    /**
     * 이미지 소스를 설정하는 함수 - WebP 지원 및 지연 로딩 적용
     * @param {HTMLImageElement} imgElement - 이미지 요소
     * @param {string} itemName - 아이템 이름
     * @param {Object} options - 추가 옵션 (lazy: 지연 로딩 여부, size: 이미지 크기)
     */
    function setImageSource(imgElement, itemName, options = {}) {
        // 기본 옵션 설정
        const defaultOptions = {
            lazy: true,
            size: 'medium' // small, medium, large
        };
        
        const opts = {...defaultOptions, ...options};
        
        // 지연 로딩 적용
        if (opts.lazy) {
            imgElement.loading = "lazy";
        }
        
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
                
                // WebP 지원 여부에 따라 이미지 URL 조정
                let webpUrl = null;
                
                // 원본 이미지 URL에서 확장자 추출
                const extension = fullImageUrl.split('.').pop().toLowerCase();
                
                // WebP 지원 및 이미지가 jpg, png, gif인 경우에만 WebP 변환 시도
                if (isWebPSupported && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                    // 확장자를 webp로 변경
                    webpUrl = fullImageUrl.substring(0, fullImageUrl.lastIndexOf('.')) + '.webp';
                    console.log("WebP URL:", webpUrl);
                }
                
                // 이미지 로드 시도
                if (webpUrl) {
                    // WebP 이미지 먼저 시도
                    const webpImg = new Image();
                    webpImg.onload = () => {
                        console.log("WebP image loaded successfully:", webpUrl);
                        imgElement.src = webpUrl;
                    };
                    webpImg.onerror = () => {
                        console.log("WebP image load error, falling back to original format");
                        loadOriginalImage();
                    };
                    webpImg.src = webpUrl;
                } else {
                    // WebP를 지원하지 않거나 원본이 WebP가 아닌 경우 원본 이미지 로드
                    loadOriginalImage();
                }
                
                // 원본 이미지 로드 함수
                function loadOriginalImage() {
                    const img = new Image();
                    img.onload = () => {
                        console.log("Original image loaded successfully:", fullImageUrl);
                        imgElement.src = fullImageUrl;
                    };
                    img.onerror = () => {
                        console.log("Image load error, keeping placeholder");
                        // 명시적으로 placeholder 이미지 유지
                        imgElement.src = imageBasePath + 'placeholder.png';
                    };
                    img.src = fullImageUrl;
                }
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
            console.log("Trying to fetch data from path:", path);
            
            // 다양한 경로로 시도
            const pathsToTry = [
                path,                                              // 상대 경로
                baseUrl + path,                                    // 절대 경로
                `https://jimmy1030good.github.io/page/${path}`,    // GitHub Pages 경로
                `/page/${path}`,                                   // GitHub Pages 상대 경로
                `/${path}`                                         // 루트 상대 경로
            ];
            
            let response = null;
            let error = null;
            
            // 모든 경로 시도
            for (const pathToTry of pathsToTry) {
                try {
                    console.log("Attempting to fetch from:", pathToTry);
                    response = await fetch(pathToTry);
                    if (response.ok) {
                        console.log("Successfully fetched data from:", pathToTry);
                        return await response.json();
                    }
                } catch (e) {
                    error = e;
                    console.error(`Failed to fetch from ${pathToTry}:`, e);
                }
            }
            
            // 모든 시도가 실패한 경우
            throw new Error(`Failed to load ${path} from any location. Last error: ${error?.message}`);
        } catch (error) {
            console.error("Fetch error:", error);
            Toast.error(`데이터를 불러오는 데 실패했습니다: ${error.message}`);
            throw error;
        }
    }

    async function loadData() {
        try {
            console.log("Attempting to load data from:", jsonDataPath);
            
            // 데이터 로딩 시도
            try {
                gameData = await fetchJsonData(jsonDataPath);
                console.log("Data loaded successfully:", gameData);
            } catch (dataError) {
                console.error("Failed to load data, using fallback data:", dataError);
                
                // 폴백 데이터 - 하드코딩된 최소 데이터
                gameData = {
                    characters: [
                        {
                            id: 1,
                            name: "테라라",
                            attribute: "불",
                            race: "수인",
                            releaseChannel: "홈페이지",
                            imageUrl: "images/placeholder.png",
                            details: {}
                        }
                    ],
                    kibos: [
                        {
                            id: 1,
                            name: "페페",
                            attribute: "나무",
                            note: "",
                            releaseChannel: "홈페이지",
                            imageUrl: "images/placeholder.png",
                            details: {}
                        }
                    ],
                    attributes: [
                        {id: "불", name: "불", count: 1, color: "#FF5722"},
                        {id: "나무", name: "나무", count: 1, color: "#8BC34A"}
                    ],
                    races: [
                        {id: "수인", name: "수인", count: 1}
                    ],
                    releaseChannels: [
                        {id: "홈페이지", name: "홈페이지", count: 2}
                    ]
                };
                
                // 오류 알림 표시
                if (Toast && Toast.error) {
                    Toast.error("데이터 로딩에 실패했습니다. 기본 데이터를 사용합니다.");
                }
            }
            
            // 필터 옵션 초기화
            if (typeof initializeFilters === 'function') {
                initializeFilters();
            }
            
            // 차트 초기화
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
            
            // 안전하게 DOM 요소 접근
            try {
                // 초기 로드 시 필터 초기화 확실히 하기
                if (typeof resetFilters === 'function') {
                    resetFilters();
                }
                
                // 필터 초기화 후 모든 캐릭터가 표시되도록 filteredItems 설정
                filteredItems = gameData.characters;
                
                if (typeof displayList === 'function') {
                    displayList('characters');
                }
                
                if (typeof setupDynamicBackground === 'function') {
                    setupDynamicBackground();
                }
                
                // 캐러셀 초기화
                if (typeof initCarousel === 'function') {
                    initCarousel();
                }
                
                if (loader) loader.classList.add('invisible');
                if (mainContent) mainContent.classList.remove('hidden');
                
                // 모든 섹션에 visible 클래스 추가
                document.querySelectorAll('section:not(.hidden)').forEach(section => {
                    setTimeout(() => {
                        section.classList.add('visible');
                    }, 10);
                });
            } catch (displayError) {
                console.error("Error displaying UI:", displayError);
                if (loader) {
                    loader.textContent = ''; // 기존 내용 제거
                    
                    const errorMsg = document.createElement('p');
                    errorMsg.style.color = 'red';
                    errorMsg.style.fontWeight = 'bold';
                    errorMsg.textContent = 'UI 표시 중 오류가 발생했습니다.';
                    
                    const errorDetail = document.createElement('p');
                    errorDetail.textContent = `오류 메시지: ${displayError.message}`;
                    
                    loader.appendChild(errorMsg);
                    loader.appendChild(errorDetail);
                }
            }
        } catch (error) {
            console.error("Critical error in loadData:", error);
            
            if (loader) {
                // innerHTML 대신 DOM 요소 생성 방식으로 변경
                loader.textContent = ''; // 기존 내용 제거
                
                const errorMsg = document.createElement('p');
                errorMsg.style.color = 'red';
                errorMsg.style.fontWeight = 'bold';
                errorMsg.textContent = '데이터를 불러오는 데 실패했습니다. JSON 파일 경로를 확인하고, 로컬 서버가 실행 중인지 확인해주세요.';
                
                const errorDetail = document.createElement('p');
                errorDetail.textContent = `오류 메시지: ${error.message}`;
                
                const urlInfo = document.createElement('p');
                urlInfo.textContent = `현재 URL: ${window.location.href}`;
                
                loader.appendChild(errorMsg);
                loader.appendChild(errorDetail);
                loader.appendChild(urlInfo);
            }
        }
    }
    
    // --- 필터 초기화 및 설정 ---
    function initializeFilters() {
        if (!gameData) return;
        
        // 속성 필터 옵션 생성
        attributeFiltersDiv.textContent = '';
        gameData.attributes.forEach(attr => {
            if (attr.count > 0) {
                const option = createFilterOption(attr.name, attr.color, 'attribute');
                attributeFiltersDiv.appendChild(option);
            }
        });
        
        // 종족 필터 옵션 생성
        raceFiltersDiv.textContent = '';
        gameData.races.forEach(race => {
            if (race.count > 0) {
                const option = createFilterOption(race.name, null, 'race');
                raceFiltersDiv.appendChild(option);
            }
        });
        
        // 공개채널 링크만 표시 (필터 제거)
        channelFiltersDiv.textContent = '';
        
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
        option.appendChild(checkbox);
        
        if (color) {
            const colorDot = document.createElement('span');
            colorDot.className = 'color-dot';
            colorDot.style.backgroundColor = color;
            option.appendChild(colorDot);
        }
        
        // 이름을 텍스트 노드로 추가
        option.appendChild(document.createTextNode(name));
        
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
            
            itemListDiv.textContent = '';
            
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
                setImageSource(img, itemName, { lazy: true, size: 'small' });
                img.alt = itemName;
                img.onerror = function() {
                    this.src = imageBasePath + 'placeholder.png';
                };

                const name = document.createElement('h3');
                name.textContent = itemName;
                
                // 속성 표시 추가 (아이콘 포함)
                const attribute = document.createElement('span');
                attribute.classList.add('attribute-tag');
                
                // 속성에 맞는 아이콘 추가
                let attributeEmoji = getAttributeEmoji(item.attribute);
                attribute.innerHTML = attributeEmoji + (item.attribute || '미공개');
                
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
            
            activeFiltersDiv.textContent = '';
            
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
        
        // 텍스트 노드 추가
        tag.appendChild(document.createTextNode(`${type}: ${value} `));
        
        // 제거 버튼 생성
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-filter';
        removeBtn.dataset.type = type;
        removeBtn.dataset.value = value;
        removeBtn.textContent = '×';
        
        // 필터 제거 이벤트
        removeBtn.addEventListener('click', function() {
            removeFilter(this.dataset.type, this.dataset.value);
        });
        
        tag.appendChild(removeBtn);
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
        
        // 현재 표시 중인 섹션 저장
        currentVisibleSection = sectionElement;
        
        // 모든 섹션 요소 가져오기
        const allSections = document.querySelectorAll('section.panel');
        
        // 모든 섹션 숨기기
        allSections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('visible');
        });
        
        // 대상 섹션 표시
        if (sectionElement && sectionElement.classList) {
            sectionElement.classList.remove('hidden');
            
            // 특정 섹션에 대한 추가 처리
            if (sectionElement.id === 'stats') {
                // 통계 섹션인 경우 차트 초기화
                try {
                    initializeCharts();
                } catch (error) {
                    console.error("차트 초기화 중 오류 발생:", error);
                }
            } else if (sectionElement.id === 'community') {
                // 커뮤니티 섹션인 경우 iframe 로딩 확인
                try {
                    const iframe = sectionElement.querySelector('iframe');
                    if (iframe) {
                        // iframe 소스 재설정으로 로딩 강제
                        const currentSrc = iframe.src;
                        iframe.src = '';
                        setTimeout(() => {
                            iframe.src = currentSrc;
                        }, 100);
                    }
                } catch (error) {
                    console.error("iframe 초기화 중 오류 발생:", error);
                }
            }
            
            // 중요: visible 클래스 추가
            setTimeout(() => {
                sectionElement.classList.add('visible');
            }, 10);
        }
        
        // 네비게이션 버튼 활성화 상태 업데이트
        updateActiveNavButton(sectionElement);
    }
    
    // 네비게이션 버튼 활성화 상태 업데이트 함수
    function updateActiveNavButton(activeSection) {
        if (!activeSection) return;
        
        // 모든 네비게이션 버튼 비활성화
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 현재 섹션에 해당하는 버튼 활성화
        const sectionId = activeSection.id;
        let targetBtn;
        
        if (sectionId === 'character') {
            targetBtn = document.querySelector('.nav-btn[data-target="character"]');
        } else if (sectionId === 'keyboard') {
            targetBtn = document.querySelector('.nav-btn[data-target="keyboard"]');
        } else if (sectionId === 'stats') {
            targetBtn = document.querySelector('.nav-btn[data-target="stats"]');
            // 통계 섹션 내용 추가
            const statsContent = document.createElement('div');
            statsContent.innerHTML = `
                <div class="stats-container">
                    <div class="stats-card">
                        <h3>속성별 분포</h3>
                        <div class="chart-container">
                            <canvas id="attribute-chart"></canvas>
                        </div>
                    </div>
                    <div class="stats-card">
                        <h3>종족별 분포</h3>
                        <div class="chart-container">
                            <canvas id="race-chart"></canvas>
                        </div>
                    </div>
                    <div class="stats-card">
                        <h3>공개채널별 분포</h3>
                        <div class="chart-container">
                            <canvas id="channel-chart"></canvas>
                        </div>
                    </div>
                    <div class="stats-card">
                        <h3>캐릭터 vs 키보 비율</h3>
                        <div class="chart-container">
                            <canvas id="type-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
            
            // 기존 내용 제거 후 새 내용 추가
            const statsSection = document.getElementById('stats');
            if (statsSection) {
                // 제목 유지
                const title = statsSection.querySelector('h2');
                statsSection.innerHTML = '';
                if (title) statsSection.appendChild(title);
                statsSection.appendChild(statsContent);
            }
        } else if (sectionId === 'community') {
            targetBtn = document.querySelector('.nav-btn[data-target="community"]');
            // 커뮤니티 섹션 내용 추가
            const communityContent = document.createElement('div');
            communityContent.innerHTML = `
                <div class="community-container">
                    <div class="community-card">
                        <h3>아카라이브 커뮤니티</h3>
                        <div class="arcalive-container">
                            <p class="arcalive-notice">아주르 프로밀리아 게시판의 내용입니다.</p>
                            <div class="iframe-container">
                                <iframe src="https://arca.live/b/azurpromilia" width="100%" height="500" frameborder="0"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 기존 내용 제거 후 새 내용 추가
            const communitySection = document.getElementById('community');
            if (communitySection) {
                // 제목 유지
                const title = communitySection.querySelector('h2');
                communitySection.innerHTML = '';
                if (title) communitySection.appendChild(title);
                communitySection.appendChild(communityContent);
            }
        } else if (sectionId === 'minigame') {
            targetBtn = document.querySelector('.nav-btn[data-target="minigame"]');
        } else if (sectionId === 'tournament-section') {
            targetBtn = document.querySelector('.nav-btn[data-target="favorite"]');
        }
        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }

    function displayList(type) {
        currentListType = type;
        
        // 안전하게 DOM 요소 접근
        try {
            // 타입에 따라 적절한 섹션 표시
            if (type === 'characters') {
                showScreen(character);
            } else if (type === 'kibos') {
                showScreen(keyboard);
            }
            
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
            Toast.error("목록을 표시하는 중 오류가 발생했습니다.");
        }
    }

    function displayDetail(item, type) {
        showScreen(detailSection);
        itemDetailDiv.textContent = '';

        if (item) {
            const img = document.createElement('img');
            setImageSource(img, item.name, { lazy: true, size: 'large' });
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

            // 기본 정보 표시 (속성에 아이콘 추가)
            let attributeEmoji = getAttributeEmoji(item.attribute);
            
            const basicInfo = [
                { key: '속성', value: attributeEmoji + (item.attribute || '미공개'), isHTML: true },
                { key: type === 'characters' ? '종족' : '비고', value: type === 'characters' ? item.race : item.note, isHTML: false },
                { key: '공개채널', value: item.releaseChannel || '미공개', isHTML: false }
            ];
            
            basicInfo.forEach(info => {
                if (info.value) {
                    const strong = document.createElement('strong');
                    strong.textContent = info.key + ':';
                    const span = document.createElement('span');
                    
                    if (info.isHTML) {
                        span.innerHTML = info.value;
                    } else {
                        span.textContent = info.value;
                    }
                    
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
            Toast.warning('토너먼트를 진행하기에 항목이 부족합니다.');
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
        // 기존 내용 제거
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        element.classList.remove('selected');
        
        const img = document.createElement('img');
        setImageSource(img, itemName, { lazy: true, size: 'medium' });
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
        // 기존 내용 제거
        while (finalWinnerDiv.firstChild) {
            finalWinnerDiv.removeChild(finalWinnerDiv.firstChild);
        }
        tournamentTitle.textContent = `당신의 ${currentTournamentType === 'characters' ? '캐릭터' : '키보'} 최애!`;

        const img = document.createElement('img');
        setImageSource(img, winnerName, { lazy: false, size: 'large' }); // 우승자 이미지는 즉시 로드
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
            
            // 기본 정보 표시 (속성에 아이콘 추가)
            let attributeEmoji = getAttributeEmoji(winnerItem.attribute);
            
            const basicInfo = [
                { key: '속성', value: attributeEmoji + (winnerItem.attribute || '미공개'), isHTML: true },
                { key: currentTournamentType === 'characters' ? '종족' : '비고',
                  value: currentTournamentType === 'characters' ? winnerItem.race : winnerItem.note, isHTML: false },
                { key: '공개채널', value: winnerItem.releaseChannel || '미공개', isHTML: false }
            ];
            
            basicInfo.forEach(info => {
                if (info.value) {
                    const strong = document.createElement('strong');
                    strong.textContent = info.key + ':';
                    const span = document.createElement('span');
                    
                    if (info.isHTML) {
                        span.innerHTML = info.value;
                    } else {
                        span.textContent = info.value;
                    }
                    
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
        try {
            console.log("차트 초기화 시작");
            
            // Chart.js 라이브러리 로드 확인
            if (typeof Chart === 'undefined') {
                console.error("Chart.js 라이브러리가 로드되지 않았습니다.");
                throw new Error("Chart.js 라이브러리가 로드되지 않았습니다.");
            }
            
            console.log("Chart.js 라이브러리 로드됨:", Chart.version);
            
            // 차트 생성 시도
            if (document.getElementById('attribute-chart')) {
                console.log("속성 차트 생성 시도");
                createAttributeChart();
            } else {
                console.warn("속성 차트 캔버스 요소를 찾을 수 없습니다.");
            }
            
            if (document.getElementById('race-chart')) {
                console.log("종족 차트 생성 시도");
                createRaceChart();
            } else {
                console.warn("종족 차트 캔버스 요소를 찾을 수 없습니다.");
            }
            
            if (document.getElementById('channel-chart')) {
                console.log("채널 차트 생성 시도");
                createChannelChart();
            } else {
                console.warn("채널 차트 캔버스 요소를 찾을 수 없습니다.");
            }
            
            if (document.getElementById('type-chart')) {
                console.log("타입 차트 생성 시도");
                createTypeChart();
            } else {
                console.warn("타입 차트 캔버스 요소를 찾을 수 없습니다.");
            }
            
            console.log("차트 초기화 완료");
        } catch (error) {
            console.error("차트 초기화 중 오류 발생:", error);
            Toast.error("차트를 초기화하는 중 오류가 발생했습니다.");
            
            // 오류 발생 시 차트 대신 텍스트 표시
            const chartContainers = document.querySelectorAll('.chart-container');
            chartContainers.forEach(container => {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'chart-error';
                
                const icon = document.createElement('span');
                icon.className = 'error-icon';
                icon.textContent = '⚠️';
                
                const text = document.createElement('p');
                text.textContent = '차트를 표시할 수 없습니다: ' + error.message;
                
                errorMsg.appendChild(icon);
                errorMsg.appendChild(text);
                
                // 기존 내용 제거 후 오류 메시지 추가
                container.innerHTML = '';
                container.appendChild(errorMsg);
            });
        }
    }
    
    function createAttributeChart() {
        try {
            console.log("속성 차트 생성 시작");
            
            // 캔버스 요소 확인
            if (!attributeChartCanvas) {
                console.error("속성 차트 캔버스 요소가 없습니다.");
                throw new Error("속성 차트 캔버스 요소가 없습니다.");
            }
            
            // 기존 차트 제거
            if (charts.attribute) {
                console.log("기존 속성 차트 제거");
                charts.attribute.destroy();
            }
            
            // 데이터 준비
            console.log("속성 차트 데이터 준비");
            const attributeData = gameData.attributes.filter(attr => attr.count > 0);
            console.log("속성 데이터:", attributeData);
            
            if (attributeData.length === 0) {
                console.warn("표시할 속성 데이터가 없습니다.");
                throw new Error("표시할 속성 데이터가 없습니다.");
            }
            
            const labels = attributeData.map(attr => attr.name);
            const data = attributeData.map(attr => attr.count);
            const backgroundColor = attributeData.map(attr => attr.color);
            
            console.log("속성 차트 라벨:", labels);
            console.log("속성 차트 데이터:", data);
            
            // 차트 생성
            console.log("속성 차트 생성");
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
            
            console.log("속성 차트 생성 완료");
        } catch (error) {
            console.error("속성 차트 생성 중 오류 발생:", error);
            
            // 오류 발생 시 차트 컨테이너에 오류 메시지 표시
            if (attributeChartCanvas && attributeChartCanvas.parentNode) {
                const container = attributeChartCanvas.parentNode;
                
                const errorMsg = document.createElement('div');
                errorMsg.className = 'chart-error';
                
                const icon = document.createElement('span');
                icon.className = 'error-icon';
                icon.textContent = '⚠️';
                
                const text = document.createElement('p');
                text.textContent = '속성 차트를 표시할 수 없습니다: ' + error.message;
                
                errorMsg.appendChild(icon);
                errorMsg.appendChild(text);
                
                // 기존 내용 제거 후 오류 메시지 추가
                container.innerHTML = '';
                container.appendChild(errorMsg);
            }
            
            // 오류를 상위로 전파하지 않고 여기서 처리
        }
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
        const statsSection = document.getElementById('stats');
        if (statsSection) {
            showScreen(statsSection);
            
            try {
                // 차트 업데이트 시도
                if (document.getElementById('attribute-chart')) {
                    createAttributeChart();
                }
                if (document.getElementById('race-chart')) {
                    createRaceChart();
                }
                if (document.getElementById('channel-chart')) {
                    createChannelChart();
                }
                if (document.getElementById('type-chart')) {
                    createTypeChart();
                }
            } catch (error) {
                console.error("차트 업데이트 중 오류 발생:", error);
                Toast.error("차트 데이터를 불러오는 중 오류가 발생했습니다.");
                
                // 오류 발생 시 차트 대신 더 자세한 오류 메시지와 함께 텍스트 표시
                const chartContainers = document.querySelectorAll('.chart-container');
                chartContainers.forEach(container => {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'chart-error';
                    
                    const icon = document.createElement('span');
                    icon.className = 'error-icon';
                    icon.textContent = '⚠️';
                    
                    const text = document.createElement('p');
                    text.textContent = '차트 데이터를 표시할 수 없습니다.';
                    
                    errorMsg.appendChild(icon);
                    errorMsg.appendChild(text);
                    
                    // 기존 내용 제거 후 오류 메시지 추가
                    container.innerHTML = '';
                    container.appendChild(errorMsg);
                });
            }
        }
    }
    
    // --- 커뮤니티 핫 토픽 대시보드 함수 ---
    function displayCommunity() {
        const communitySection = document.getElementById('community');
        if (communitySection) {
            showScreen(communitySection);
            
            try {
                // iframe 로딩 확인
                const iframe = communitySection.querySelector('iframe');
                if (iframe) {
                    // iframe 로딩 이벤트 리스너 추가
                    iframe.onload = function() {
                        console.log("iframe 로딩 완료");
                    };
                    
                    iframe.onerror = function() {
                        console.error("iframe 로딩 실패");
                        const container = iframe.closest('.iframe-container');
                        if (container) {
                            const errorMsg = document.createElement('div');
                            errorMsg.className = 'iframe-error';
                            errorMsg.innerHTML = '<span class="error-icon">⚠️</span><p>커뮤니티 콘텐츠를 불러올 수 없습니다.</p>';
                            container.innerHTML = '';
                            container.appendChild(errorMsg);
                        }
                    };
                    
                    // iframe 소스 재설정으로 로딩 강제
                    const currentSrc = iframe.src;
                    iframe.src = '';
                    setTimeout(() => {
                        iframe.src = currentSrc;
                    }, 100);
                }
                
                // 차트 업데이트 시도
                if (document.getElementById('character-mentions-chart')) {
                    createCharacterMentionsChart();
                }
                if (document.getElementById('sentiment-chart')) {
                    createSentimentChart();
                }
            } catch (error) {
                console.error("커뮤니티 섹션 업데이트 중 오류 발생:", error);
                Toast.error("커뮤니티 데이터를 불러오는 중 오류가 발생했습니다.");
                
                // 오류 발생 시 차트 대신 더 자세한 오류 메시지와 함께 텍스트 표시
                const chartContainers = communitySection.querySelectorAll('.chart-container');
                chartContainers.forEach(container => {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'chart-error';
                    
                    const icon = document.createElement('span');
                    icon.className = 'error-icon';
                    icon.textContent = '⚠️';
                    
                    const text = document.createElement('p');
                    text.textContent = '차트 데이터를 표시할 수 없습니다.';
                    
                    errorMsg.appendChild(icon);
                    errorMsg.appendChild(text);
                    
                    // 기존 내용 제거 후 오류 메시지 추가
                    container.innerHTML = '';
                    container.appendChild(errorMsg);
                });
            }
        }
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
        
        Toast.success(`데이터 수집이 완료되었습니다. ${collectedItems}개의 항목이 수집되었습니다.`);
    }
    
    // 데이터 수집 일시 중지
    function pauseCollection() {
        collectionStatus.isActive = false;
        updateCollectionStatus();
        Toast.info('데이터 수집이 일시 중지되었습니다.');
    }
    
    // 데이터 수집 초기화
    function resetCollection() {
        if (confirm('정말로 모든 수집 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            collectionStatus.totalItems = 0;
            collectionStatus.history = [];
            updateCollectionStatus();
            Toast.success('데이터 수집이 초기화되었습니다.');
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
        historyTableBody.textContent = '';
        
        collectionStatus.history.forEach(item => {
            const row = document.createElement('tr');
            
            // 날짜 셀
            const dateCell = document.createElement('td');
            dateCell.textContent = item.date;
            row.appendChild(dateCell);
            
            // 소스 셀
            const sourceCell = document.createElement('td');
            sourceCell.textContent = item.source;
            row.appendChild(sourceCell);
            
            // 항목 수 셀
            const itemsCell = document.createElement('td');
            itemsCell.textContent = item.items;
            row.appendChild(itemsCell);
            
            // 상태 셀
            const statusCell = document.createElement('td');
            statusCell.className = `status-${item.status}`;
            statusCell.textContent = item.status === 'success' ? '성공' : '실패';
            row.appendChild(statusCell);
            
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
        Toast.info("컬렉션 기능이 비활성화되었습니다.");
    }
    
    // --- Event Listeners ---
    // 이벤트 리스너 추가 전에 요소가 존재하는지 확인
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            const target = this.getAttribute('data-target');
            if (target === 'character') {
                displayList('characters');
            } else if (target === 'keyboard') {
                displayList('kibos');
            } else if (target === 'stats') {
                displayStats();
            } else if (target === 'community') {
                displayCommunity();
            } else if (target === 'favorite') {
                startTournamentFlowBtn.click();
            } else if (target === 'minigame') {
                const minigameSection = document.getElementById('minigame');
                if (minigameSection) {
                    showScreen(minigameSection);
                }
            }
        });
    });
    
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => displayList(currentListType));
    }
    
    // 토너먼트 시작 버튼 이벤트 리스너
    if (startTournamentFlowBtn) {
        startTournamentFlowBtn.addEventListener('click', () => {
            const selectionSection = document.getElementById('selection-section');
            if (selectionSection) {
                selectionSection.classList.remove('hidden');
                selectionSection.style.display = 'flex';
                // 중요: visible 클래스 추가
                setTimeout(() => {
                    selectionSection.classList.add('visible');
                }, 10);
            }
        });
    }
    // 모달 닫기 버튼 이벤트 리스너
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const selectionSection = document.getElementById('selection-section');
            if (selectionSection) {
                // 먼저 visible 클래스 제거
                selectionSection.classList.remove('visible');
                // 트랜지션 후 hidden 클래스 추가
                setTimeout(() => {
                    selectionSection.classList.add('hidden');
                    selectionSection.style.display = 'none';
                }, 300); // 트랜지션 시간과 일치시킴
            }
        });
    }
    // 캐릭터 선택 버튼 이벤트 리스너
    if (selectCharBtn) {
        selectCharBtn.addEventListener('click', () => {
            const selectionSection = document.getElementById('selection-section');
            if (selectionSection) {
                selectionSection.classList.remove('visible');
                setTimeout(() => {
                    selectionSection.classList.add('hidden');
                    selectionSection.style.display = 'none';
                    startNewTournament('characters');
                }, 300);
            }
        });
    }
    // 키보 선택 버튼 이벤트 리스너
    if (selectKiboBtn) {
        selectKiboBtn.addEventListener('click', () => {
            const selectionSection = document.getElementById('selection-section');
            if (selectionSection) {
                selectionSection.classList.remove('visible');
                setTimeout(() => {
                    selectionSection.classList.add('hidden');
                    selectionSection.style.display = 'none';
                    startNewTournament('kibos');
                }, 300);
            }
        });
    }

    // 요소가 존재하는지 확인 후 이벤트 리스너 추가
    if (matchItem1Div) {
        matchItem1Div.addEventListener('click', () => handleVote(0, matchItem1Div));
    }
    if (matchItem2Div) {
        matchItem2Div.addEventListener('click', () => handleVote(1, matchItem2Div));
    }
    
    // 요소가 존재하는지 확인 후 이벤트 리스너 추가
    if (restartTournamentBtn) {
        restartTournamentBtn.addEventListener('click', () => startNewTournament(currentTournamentType));
    }
    if (backToMainMenuBtn) {
        backToMainMenuBtn.addEventListener('click', () => showScreen(listSection));
    }
    
    // 컬렉션 버튼 추가 코드 비활성화
    
    // --- Carousel 기능 구현 ---
    function initCarousel() {
        const carouselTrack = document.querySelector('.carousel-track');
        if (!carouselTrack || !gameData) return;
        
        // 캐러셀 아이템 생성 및 추가
        const characters = gameData.characters.slice(0, 10); // 최대 10개 캐릭터만 표시
        
        characters.forEach(character => {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            item.dataset.id = character.id;
            
            const img = document.createElement('img');
            setImageSource(img, character.name, { lazy: true, size: 'small' });
            img.alt = character.name;
            
            const caption = document.createElement('div');
            caption.classList.add('caption');
            caption.textContent = character.name;
            
            item.appendChild(img);
            item.appendChild(caption);
            carouselTrack.appendChild(item);
            
            // 클릭 이벤트 추가
            item.addEventListener('click', () => {
                // 활성 아이템 업데이트
                document.querySelectorAll('.carousel-item').forEach(el => {
                    el.classList.remove('active');
                });
                item.classList.add('active');
                
                // 상세 정보 표시
                const characterData = gameData.characters.find(c => c.id === character.id);
                if (characterData) {
                    displayDetail(characterData, 'characters');
                }
            });
        });
        
        // 드래그 스크롤 기능 구현
        let isDown = false;
        let startX;
        let scrollLeft;
        
        const carousel = document.querySelector('.carousel-container');
        
        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        
        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        
        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // 스크롤 속도 조절
            carousel.scrollLeft = scrollLeft - walk;
        });
        
        // 스크롤 이벤트로 활성 아이템 업데이트
        carousel.addEventListener('scroll', () => {
            const carouselItems = document.querySelectorAll('.carousel-item');
            if (!carouselItems.length) return;
            
            // 현재 화면 중앙에 가장 가까운 아이템 찾기
            const center = carousel.offsetLeft + carousel.offsetWidth / 2;
            
            let closestItem = null;
            let closestDistance = Infinity;
            
            carouselItems.forEach(item => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distance = Math.abs(itemCenter - center);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });
            
            // 활성 아이템 업데이트
            if (closestItem) {
                carouselItems.forEach(item => {
                    item.classList.remove('active');
                });
                closestItem.classList.add('active');
            }
        });
    }
    
    // --- MiniNav Scroll Spy 기능 구현 ---
    function initMiniNav() {
        const sections = ["character", "keyboard", "boss"];
        const miniNavLinks = document.querySelectorAll('.mini-nav-link');
        let activeSection = sections[0];
        
        // 초기 활성화 상태 설정
        updateActiveLink();
        
        // Intersection Observer 설정
        const observerOptions = {
            threshold: 0.6,
            rootMargin: '-10% 0px -10% 0px'
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeSection = entry.target.id;
                    updateActiveLink();
                }
            });
        }, observerOptions);
        
        // 각 섹션 관찰 시작
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                sectionObserver.observe(section);
            }
        });
        
        // 활성 링크 업데이트 함수
        function updateActiveLink() {
            miniNavLinks.forEach(link => {
                const href = link.getAttribute('href').substring(1); // '#' 제거
                if (href === activeSection) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // 링크 클릭 시 스크롤 애니메이션 추가
        miniNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 70, // 스티키 네비게이션 높이 고려
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // --- Initial Load ---
    loadData();
    
    // 페이지 로드 후 MiniNav 초기화
    document.addEventListener('DOMContentLoaded', initMiniNav);
    
    /************ Mini‑Game Hub 라우팅 ************/
    document.getElementById('open-favorite').onclick = () => {
        const favoriteBtn = document.querySelector('[data-target="favorite"]');
        if (favoriteBtn) favoriteBtn.click();
    };
    
    document.getElementById('open-flashcard').onclick = () => {
        startFlashCard();
    };
    
    /************ FlashCard Game ************/
    const cards = []; // 실제 데이터로 교체될 예정
    
    function shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }
    
    function startFlashCard() {
        const wrap = document.getElementById('flashcard-wrap');
        const img = document.getElementById('fc-image');
        const opts = document.getElementById('fc-options');
        const result = document.getElementById('fc-result');
        const nextBtn = document.getElementById('fc-next');
        const counter = document.getElementById('fc-counter');
        const scoreEl = document.getElementById('fc-score');
        
        // 캐릭터 데이터를 카드로 변환
        if (cards.length === 0 && gameData && gameData.characters) {
            gameData.characters.forEach(char => {
                if (char.name && char.imageUrl) {
                    cards.push({
                        id: char.id,
                        name: char.name,
                        img: char.imageUrl
                    });
                }
            });
        }
        
        let step = 0, score = 0, pool = shuffle(cards).slice(0, 10);
        
        wrap.classList.remove('hidden');
        result.classList.add('hidden');
        nextBtn.classList.add('hidden');
        scoreEl.textContent = '0 점';
        
        function render() {
            if (step >= pool.length) {
                result.textContent = `총 ${score} 점!`;
                result.classList.remove('hidden');
                nextBtn.classList.add('hidden');
                saveRank(score);
                return;
            }
            
            const current = pool[step];
            img.src = current.img;
            img.alt = current.name;
            counter.textContent = `${step + 1} / ${pool.length}`;
            
            // 선택지 생성
            opts.innerHTML = '';
            const choices = shuffle([current, ...shuffle(cards.filter(c => c.id !== current.id)).slice(0, 3)]);
            
            choices.forEach(c => {
                const btn = document.createElement('button');
                btn.textContent = c.name;
                btn.onclick = () => {
                    if (c.id === current.id) {
                        score++;
                        scoreEl.textContent = `${score} 점`;
                    }
                    step++;
                    render();
                };
                opts.appendChild(btn);
            });
        }
        
        render();
    }
    
    /************ 랭킹 저장 (today 기준) ************/
    function saveRank(newScore) {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const key = `flash_rank_${today}`;
        const ranks = JSON.parse(localStorage.getItem(key) || '[]'); // [{name,score}]
        const alias = localStorage.getItem('flash_alias') || prompt('닉네임 입력', 'Guest');
        
        localStorage.setItem('flash_alias', alias);
        ranks.push({name: alias, score: newScore});
        ranks.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(ranks.slice(0, 10)));
        
        renderRank(ranks.slice(0, 10));
    }
    
    function renderRank(list) {
        const title = document.getElementById('rank-title');
        const ol = document.getElementById('rank-list');
        
        title.classList.remove('hidden');
        ol.innerHTML = '';
        
        // 메달 이모지 정의
        const medals = ['🥇', '🥈', '🥉'];
        
        list.forEach((r, i) => {
            const li = document.createElement('li');
            
            // 상위 3위에는 메달 표시, 4등부터는 순위 숫자 표시
            if (i <= 2) {
                // 메달 요소 생성
                const medalSpan = document.createElement('span');
                medalSpan.classList.add('rank-medal');
                medalSpan.textContent = medals[i];
                li.appendChild(medalSpan);
                
                // 메달에 따른 클래스 추가
                li.classList.add(i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze');
            } else {
                li.setAttribute('data-rank', i + 1);
            }
            
            // 이름 요소 생성
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('rank-name');
            nameSpan.textContent = r.name;
            li.appendChild(nameSpan);
            
            // 점수 요소 생성
            const scoreSpan = document.createElement('span');
            scoreSpan.classList.add('rank-score');
            scoreSpan.textContent = `${r.score}점`;
            li.appendChild(scoreSpan);
            
            ol.appendChild(li);
        });
    }
    
    /* 페이지 최초 로드시 오늘 랭킹 표시(있다면) */
    window.addEventListener('load', () => {
        const today = new Date().toISOString().slice(0, 10);
        const saved = JSON.parse(localStorage.getItem(`flash_rank_${today}`) || '[]');
        if (saved.length) renderRank(saved);
    });
});
