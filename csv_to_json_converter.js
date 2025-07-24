document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const characterFileInput = document.getElementById('characterFile');
    const characterDetailFileInput = document.getElementById('characterDetailFile');
    const kiboFileInput = document.getElementById('kiboFile');
    const kiboDetailFileInput = document.getElementById('kiboDetailFile');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressText = document.getElementById('progressText');
    const logElement = document.getElementById('log');

    // 데이터 저장 변수
    let characterData = null;
    let characterDetailData = null;
    let kiboData = null;
    let kiboDetailData = null;
    let convertedData = null;

    // 로그 함수
    function log(message, type = 'info') {
        const logItem = document.createElement('div');
        logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        if (type === 'success') {
            logItem.classList.add('success');
        } else if (type === 'error') {
            logItem.classList.add('error');
        }
        logElement.appendChild(logItem);
        logElement.scrollTop = logElement.scrollHeight;
    }

    // CSV 파일 파싱 함수
    function parseCSV(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 선택되지 않았습니다.'));
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`파싱 오류: ${results.errors[0].message}`));
                        return;
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    // 속성 데이터 추출 및 정규화
    function extractAttributes(characters, kibos) {
        const attributeMap = new Map();
        const attributes = [];
        
        // 캐릭터 속성 추출
        characters.forEach(char => {
            const attribute = char['속성'];
            if (attribute && attribute !== '미공개' && !attributeMap.has(attribute)) {
                attributeMap.set(attribute, {
                    id: attribute,
                    name: attribute,
                    count: 0,
                    color: getAttributeColor(attribute)
                });
            }
        });
        
        // 키보 속성 추출
        kibos.forEach(kibo => {
            const attribute = kibo['속성'];
            if (attribute && attribute !== '미공개' && !attributeMap.has(attribute)) {
                attributeMap.set(attribute, {
                    id: attribute,
                    name: attribute,
                    count: 0,
                    color: getAttributeColor(attribute)
                });
            }
        });
        
        // 속성별 캐릭터 수 계산
        characters.forEach(char => {
            const attribute = char['속성'];
            if (attribute && attribute !== '미공개' && attributeMap.has(attribute)) {
                attributeMap.get(attribute).count++;
            }
        });
        
        // 속성별 키보 수 계산
        kibos.forEach(kibo => {
            const attribute = kibo['속성'];
            if (attribute && attribute !== '미공개' && attributeMap.has(attribute)) {
                attributeMap.get(attribute).count++;
            }
        });
        
        // Map을 배열로 변환
        attributeMap.forEach(attr => {
            attributes.push(attr);
        });
        
        return attributes;
    }
    
    // 종족 데이터 추출 및 정규화
    function extractRaces(characterDetails) {
        const raceMap = new Map();
        const races = [];
        
        // 종족 추출
        characterDetails.forEach(char => {
            const race = char['종족'];
            if (race && !raceMap.has(race)) {
                raceMap.set(race, {
                    id: race,
                    name: race,
                    count: 0
                });
            }
        });
        
        // 종족별 캐릭터 수 계산
        characterDetails.forEach(char => {
            const race = char['종족'];
            if (race && raceMap.has(race)) {
                raceMap.get(race).count++;
            }
        });
        
        // Map을 배열로 변환
        raceMap.forEach(race => {
            races.push(race);
        });
        
        return races;
    }
    
    // 공개채널 데이터 추출 및 정규화
    function extractReleaseChannels(characterDetails, kiboDetails) {
        const channelMap = new Map();
        const channels = [];
        
        // 캐릭터 공개채널 추출
        characterDetails.forEach(char => {
            const channel = char['공개채널'];
            if (channel && !channelMap.has(channel)) {
                channelMap.set(channel, {
                    id: channel,
                    name: channel,
                    count: 0
                });
            }
        });
        
        // 키보 공개채널 추출
        kiboDetails.forEach(kibo => {
            const channel = kibo['공개채널'];
            if (channel && !channelMap.has(channel)) {
                channelMap.set(channel, {
                    id: channel,
                    name: channel,
                    count: 0
                });
            }
        });
        
        // 공개채널별 아이템 수 계산
        characterDetails.forEach(char => {
            const channel = char['공개채널'];
            if (channel && channelMap.has(channel)) {
                channelMap.get(channel).count++;
            }
        });
        
        kiboDetails.forEach(kibo => {
            const channel = kibo['공개채널'];
            if (channel && channelMap.has(channel)) {
                channelMap.get(channel).count++;
            }
        });
        
        // Map을 배열로 변환
        channelMap.forEach(channel => {
            channels.push(channel);
        });
        
        return channels;
    }
    
    // 캐릭터 데이터 정규화
    function normalizeCharacters(characters, characterDetails) {
        const normalizedCharacters = [];
        
        characters.forEach(char => {
            const id = parseInt(char['#']) || normalizedCharacters.length + 1;
            const name = char['캐릭터 이름'];
            
            if (!name || name.trim() === '') return;
            
            // 상세 정보 찾기
            const detail = characterDetails.find(d => {
                // 캐릭터 상세.csv 파일의 구조가 특이하여 여러 행에 걸쳐 있을 수 있음
                return d['캐릭터명'] === name || d['종족'] === name;
            });
            
            const normalizedChar = {
                id: id,
                name: name,
                attribute: char['속성'] || '미공개',
                race: detail ? detail['종족'] || '미공개' : '미공개',
                releaseChannel: detail ? detail['공개채널'] || '미공개' : '미공개',
                imageUrl: getImageUrl(name),
                details: {}
            };
            
            // 상세 정보가 있으면 추가
            if (detail) {
                for (const key in detail) {
                    if (key !== '캐릭터명' && key !== '종족' && key !== '속성' && key !== '공개채널' && detail[key]) {
                        normalizedChar.details[key] = detail[key];
                    }
                }
            }
            
            normalizedCharacters.push(normalizedChar);
        });
        
        return normalizedCharacters;
    }
    
    // 키보 데이터 정규화
    function normalizeKibos(kibos, kiboDetails) {
        const normalizedKibos = [];
        
        kibos.forEach(kibo => {
            const id = parseInt(kibo['#']) || normalizedKibos.length + 1;
            const name = kibo['키보 이름'];
            
            if (!name || name.trim() === '') return;
            
            // 상세 정보 찾기
            const detail = kiboDetails.find(d => {
                return d['키보 이름'] === name;
            });
            
            const normalizedKibo = {
                id: id,
                name: name,
                attribute: kibo['속성'] || '미공개',
                note: kibo['비고'] || '',
                releaseChannel: detail ? detail['공개채널'] || '미공개' : '미공개',
                imageUrl: getImageUrl(name),
                details: {}
            };
            
            // 상세 정보가 있으면 추가
            if (detail) {
                for (const key in detail) {
                    if (key !== '키보 이름' && key !== '속성' && key !== '공개채널' && key !== '비고' && detail[key]) {
                        normalizedKibo.details[key] = detail[key];
                    }
                }
            }
            
            normalizedKibos.push(normalizedKibo);
        });
        
        return normalizedKibos;
    }
    
    // 이미지 URL 가져오기
    function getImageUrl(name) {
        // 기존 script.js의 localImageMap 참조
        const localImageMap = {
            '테라라': 'terara.gif',
            '한요요': 'han_yoyo.gif',
            '샬레·엔시스': 'shalle.gif',
            '페페': 'pepe.gif',
            '노노': 'nono.gif',
            '모르윈·할콘*': 'morrwin_halkon.jpg',
            '파리다*': 'farida.jpg',
            '낙경*': '낙경.png',
            '도산지상*': '도산지상.png',
            '루루카*': '루루카.jpg',
            '멧사*': '멧사.jpg',
            '미나모토 치요*': '미나모토 치요.jpg',
            '미티*': '미티.png',
            '심포리아·던윈드*': '심포리아·던윈드.png',
            '아비*': '아비.png',
            '캐시벨*': '캐시벨.jpg',
            '코코*': '코코.jpg',
            '펭펭*': '펭펭.png'
        };
        
        const cleanName = name.trim();
        const imageName = localImageMap[cleanName];
        
        if (imageName) {
            return `images/${imageName}`;
        } else {
            return 'images/placeholder.png';
        }
    }
    
    // 속성별 색상 가져오기
    function getAttributeColor(attribute) {
        const colorMap = {
            '불': '#FF5722',
            '물': '#2196F3',
            '땅': '#795548',
            '번개': '#FFEB3B',
            '바람': '#4CAF50',
            '어둠': '#9C27B0',
            '빛': '#FFC107',
            '얼음': '#00BCD4',
            '나무': '#8BC34A',
            '미공개': '#9E9E9E'
        };
        
        return colorMap[attribute] || '#9E9E9E';
    }
    
    // CSV 데이터를 JSON으로 변환
    function convertToJson() {
        try {
            // 속성, 종족, 공개채널 데이터 추출
            const attributes = extractAttributes(characterData, kiboData);
            const races = extractRaces(characterDetailData);
            const releaseChannels = extractReleaseChannels(characterDetailData, kiboDetailData);
            
            // 캐릭터 및 키보 데이터 정규화
            const characters = normalizeCharacters(characterData, characterDetailData);
            const kibos = normalizeKibos(kiboData, kiboDetailData);
            
            // 최종 JSON 구조 생성
            const jsonData = {
                metadata: {
                    lastUpdated: new Date().toISOString().split('T')[0],
                    version: '1.0'
                },
                characters: characters,
                kibos: kibos,
                attributes: attributes,
                races: races,
                releaseChannels: releaseChannels
            };
            
            return jsonData;
        } catch (error) {
            throw new Error(`JSON 변환 오류: ${error.message}`);
        }
    }
    
    // JSON 다운로드 함수
    function downloadJson(jsonData) {
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `azure_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    }
    
    // 변환 버튼 클릭 이벤트
    convertBtn.addEventListener('click', async () => {
        try {
            progressContainer.style.display = 'block';
            downloadBtn.disabled = true;
            
            log('변환 시작...');
            
            // 1. CSV 파일 파싱
            log('캐릭터.csv 파싱 중...');
            characterData = await parseCSV(characterFileInput.files[0]);
            log('캐릭터.csv 파싱 완료', 'success');
            
            log('캐릭터 상세.csv 파싱 중...');
            characterDetailData = await parseCSV(characterDetailFileInput.files[0]);
            log('캐릭터 상세.csv 파싱 완료', 'success');
            
            log('키보.csv 파싱 중...');
            kiboData = await parseCSV(kiboFileInput.files[0]);
            log('키보.csv 파싱 완료', 'success');
            
            log('키보 상세.csv 파싱 중...');
            kiboDetailData = await parseCSV(kiboDetailFileInput.files[0]);
            log('키보 상세.csv 파싱 완료', 'success');
            
            // 2. JSON으로 변환
            log('JSON으로 변환 중...');
            convertedData = convertToJson();
            log('JSON 변환 완료', 'success');
            
            // 3. 다운로드 버튼 활성화
            downloadBtn.disabled = false;
            progressText.textContent = '변환 완료! 다운로드 버튼을 클릭하세요.';
            
            log(`총 ${convertedData.characters.length}개의 캐릭터와 ${convertedData.kibos.length}개의 키보 데이터 변환 완료`, 'success');
        } catch (error) {
            log(`오류 발생: ${error.message}`, 'error');
            progressText.textContent = '변환 실패. 로그를 확인하세요.';
        }
    });
    
    // 다운로드 버튼 클릭 이벤트
    downloadBtn.addEventListener('click', () => {
        if (convertedData) {
            downloadJson(convertedData);
            log('JSON 파일 다운로드 완료', 'success');
        } else {
            log('다운로드할 데이터가 없습니다.', 'error');
        }
    });
});