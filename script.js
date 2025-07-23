document.addEventListener('DOMContentLoaded', () => {
    const characterCsvPath = './캐릭터.csv';
    const characterDetailCsvPath = './캐릭터 상세.csv';
    const kiboCsvPath = './키보.csv';
    const kiboDetailCsvPath = './키보 상세.csv';
    const imageBasePath = './images/';

    const showCharactersBtn = document.getElementById('show-characters');
    const showKibosBtn = document.getElementById('show-kibos');
    const backButton = document.getElementById('back-button');
    const listSection = document.getElementById('list-section');
    const detailSection = document.getElementById('detail-section');
    const itemListDiv = document.getElementById('item-list');
    const itemDetailDiv = document.getElementById('item-detail');

    let characters = [];
    let characterDetails = [];
    let kibos = [];
    let kiboDetails = [];

    async function fetchCsv(path) {
        const response = await fetch(path);
        const text = await response.text();
        return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
    }

    async function loadData() {
        characters = await fetchCsv(characterCsvPath);
        characterDetails = await fetchCsv(characterDetailCsvPath);
        kibos = await fetchCsv(kiboCsvPath);
        kiboDetails = await fetchCsv(kiboDetailCsvPath);
        displayList('characters'); // Default display
    }

    function displayList(type) {
        itemListDiv.innerHTML = '';
        listSection.classList.remove('hidden');
        detailSection.classList.add('hidden');

        const data = type === 'characters' ? characters : kibos;
        const detailData = type === 'characters' ? characterDetails : kiboDetails;

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('item-card');
            card.dataset.name = item['캐릭터 이름'] || item['키보 이름'];

            const img = document.createElement('img');
            const imageName = card.dataset.name.replace(/\*/g, '');
            const possibleExtensions = ['png', 'jpg', 'gif'];
            let currentExtensionIndex = 0;

            function tryNextImage() {
                if (currentExtensionIndex < possibleExtensions.length) {
                    img.src = `${imageBasePath}${imageName}.${possibleExtensions[currentExtensionIndex]}`;
                    currentExtensionIndex++;
                } else {
                    img.src = `${imageBasePath}placeholder.png`;
                    img.onerror = null; // Stop trying to load
                }
            }

            img.onerror = tryNextImage; // Set the initial error handler
            tryNextImage(); // Start the process

            img.alt = card.dataset.name;

            const name = document.createElement('h3');
            name.textContent = card.dataset.name;

            card.appendChild(img);
            card.appendChild(name);
            itemListDiv.appendChild(card);

            card.addEventListener('click', () => {
                displayDetail(card.dataset.name, detailData, type);
            });
        });
    }

    function displayDetail(name, detailData, type) {
        itemDetailDiv.innerHTML = '';
        listSection.classList.add('hidden');
        detailSection.classList.remove('hidden');

        const item = detailData.find(d => (d['캐릭터 이름'] || d['키보 이름']) === name);

        if (item) {
            const img = document.createElement('img');
            const imageName = name.replace(/\*/g, '');
            const possibleExtensions = ['png', 'jpg', 'gif'];
            let currentExtensionIndex = 0;

            function tryNextImageDetail() {
                if (currentExtensionIndex < possibleExtensions.length) {
                    img.src = `${imageBasePath}${imageName}.${possibleExtensions[currentExtensionIndex]}`;
                    currentExtensionIndex++;
                } else {
                    img.src = `${imageBasePath}placeholder.png`;
                    img.onerror = null; // Stop trying to load
                }
            }

            img.onerror = tryNextImageDetail; // Set the initial error handler
            tryNextImageDetail(); // Start the process

            img.alt = name;

            const title = document.createElement('h2');
            title.textContent = name;

            itemDetailDiv.appendChild(img);
            itemDetailDiv.appendChild(title);

            // Display all other properties from the detail CSV
            for (const key in item) {
                if (key !== '캐릭터 이름' && key !== '키보 이름' && key !== '#') {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
                    itemDetailDiv.appendChild(p);
                }
            }
        } else {
            itemDetailDiv.textContent = '상세 정보를 찾을 수 없습니다.';
        }
    }

    showCharactersBtn.addEventListener('click', () => displayList('characters'));
    showKibosBtn.addEventListener('click', () => displayList('kibos'));
    backButton.addEventListener('click', () => displayList(itemListDiv.dataset.currentType));

    loadData();
});
