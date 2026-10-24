import { appState } from "./state.js";
import { triggerTransition } from "./main.js";

export const modeBtn = document.getElementById('toggle');
export const icon = document.getElementById('icon');
export const mode = document.getElementById('mode');
export const searchBox = document.getElementById('search');
export const customSelect = document.getElementById('customSelect');
export const selectTrigger = customSelect.querySelector('.select-trigger');
export const selectOptions = customSelect.querySelectorAll('.select-options li');
export const triggerText = selectTrigger.querySelector('span');
export const viewPort = document.querySelector('.countries');

const controlsSection = document.querySelector('.controls');
const paginationSection = document.querySelector('.pagination');
const backWrapper = document.querySelector('.back-wrapper');

export async function fetchData(){
    try {
        const response = await fetch(`./data.json`);
        if(!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        appState.countries = data;
        render();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export function chunkArray(arr, size) {
  appState.pages = [];
  for (let i = 0; i < arr.length; i += size) {
    appState.pages.push(arr.slice(i, i + size));
  }
}

export function render(){
    if(appState.dark){
        icon.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        mode.innerText = 'Light';
        document.body.classList.add('dark');
    }else{
        icon.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        mode.innerText = 'Dark';
        document.body.classList.remove('dark');
    }

    if (appState.currentView === 'detail' && appState.selectedCountry) {
        if (controlsSection) controlsSection.style.display = 'none';
        if (paginationSection) paginationSection.style.display = 'none';
        if (backWrapper) backWrapper.style.display = 'block';

        const c = appState.selectedCountry;

        const borderButtons = c.borders && c.borders.length > 0 
            ? c.borders.map(borderCode => {
                const foundBorder = appState.countries.find(item => item.alpha3Code === borderCode);
                return foundBorder ? `<button class="select-country" data-name="${foundBorder.name}">${foundBorder.name}</button>` : '';
              }).join('') 
            : '<span class="result">None</span>';

        viewPort.innerHTML = `
            <article class="country">
                <div class="flag">
                    <img alt="${c.name} flag" src="${c.flags.svg || c.flags.png}" draggable="false">
                </div>
                <div class="country-info">
                    <h2 class="country-title">${c.name}</h2>

                    <div class="details  country-details">
                        <div>
                            <ul class="line"><li class="topic">Native Name:</li><li class="result">${c.nativeName || 'N/A'}</li></ul>
                            <ul class="line"><li class="topic">Population:</li><li class="result">${c.population.toLocaleString()}</li></ul>
                            <ul class="line"><li class="topic">Region:</li><li class="result">${c.region}</li></ul>
                            <ul class="line"><li class="topic">Sub Region:</li><li class="result">${c.subregion || 'N/A'}</li></ul>
                            <ul class="line"><li class="topic">Capital:</li><li class="result">${c.capital || 'N/A'}</li></ul>
                        </div>
                        <div>
                            <ul class="line"><li class="topic">Top Level Domain:</li><li class="result">${c.topLevelDomain ? c.topLevelDomain.join(', ') : 'N/A'}</li></ul>
                            <ul class="line"><li class="topic">Currencies:</li><li class="result">${c.currencies ? c.currencies.map(cur => cur.name).join(', ') : 'N/A'}</li></ul>
                            <ul class="line"><li class="topic">Languages:</li><li class="result">${c.languages ? c.languages.map(lang => lang.name).join(', ') : 'N/A'}</li></ul>
                        </div>
                    </div>

                    <div class="border">
                        <span class="topic">Border Countries:</span>
                        <div class="border-btn">
                            ${borderButtons}
                        </div>
                    </div>
                </div>
            </article>
        `;

        const backBtn = document.querySelector('.back-trigger');
        if(backBtn){
            backBtn.onclick = () => {
                triggerTransition(() => {
                    appState.currentView = 'home';
                    appState.selectedCountry = null;
                    render();
                });
            };
            document.addEventListener('keydown', (e)=>{
                if(e.key === 'Escape'){
                   triggerTransition(() => {
                        appState.currentView = 'home';
                        appState.selectedCountry = null;
                        render();
                    }); 
                }
            })
        }

        document.querySelectorAll('.select-country').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                const nextCountry = appState.countries.find(item => item.name === targetName);
                if(nextCountry){
                    triggerTransition(() => {
                        appState.selectedCountry = nextCountry;
                        render();
                        window.scrollTo(0, 0);
                    });
                }
            });
        });

        return;
    }

    if (controlsSection) controlsSection.style.display = 'flex';
    if (paginationSection) paginationSection.style.display = 'flex';
    if (backWrapper) backWrapper.style.display = 'none';

    const query = searchBox.value.trim().toLowerCase();
    let data = appState.countries;

    if(!appState.filterAll && appState.regions.length > 0){
        triggerText.textContent = appState.regions.length > 2 
            ? appState.regions.map(country => country.slice(0,2)).join(', ') 
            : appState.regions.map(country => country).join(', ');

        data = appState.countries.filter(country => appState.regions.includes(country.region));
    }
    
    if(appState.filterAll){
        triggerText.textContent = 'All';
        data = appState.countries;
    }

    if(appState.regions.length === 0){
        triggerText.textContent = 'Filter by Region';
        data = appState.countries;
    }

    if(query.length > 0){
        data = data.filter(country => country.name.toLowerCase().includes(query));
    }

    chunkArray(data, 8);

    if(appState.pageIndex >= appState.pages.length){
        appState.pageIndex = 0;
    }

    if(appState.pages.length > 0){
        const currentCountries = appState.pages[appState.pageIndex] || [];

        viewPort.innerHTML = currentCountries.map(country =>
            `
            <div class="card" data-name="${country.name}" tabindex="0">
                <div class="country-flag"><img alt="" src="${country.flags.svg}" draggable="false"></div>

                <div class="country-info">
                    <h2 class="country-title">${country.name}</h2>

                    <div class="details">
                        <ul class="line">
                            <li class="topic">Population:</li>
                            <li class="result">${country.population.toLocaleString()}</li>
                        </ul>

                        <ul class="line">
                            <li class="topic">Region:</li>
                            <li class="result">${country.region}</li>
                        </ul>

                         <ul class="line">
                            <li class="topic">Capital:</li>
                            <li class="result">${country.capital}</li>
                        </ul>
                    </div>
                </div>
            </div>
            `
        ).join('');

        document.querySelectorAll('.card').forEach(card => {
            const handleCardAction = () => {
                const countryName = card.getAttribute('data-name');
                const found = appState.countries.find(c => c.name === countryName);
                if(found){
                    triggerTransition(() => {
                        appState.selectedCountry = found;
                        appState.currentView = 'detail';
                        render();
                        window.scrollTo(0, 0);
                    });
                }
            };

            card.addEventListener('click', handleCardAction);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); 
                    handleCardAction();
                }
            });
        });

    } else {
        viewPort.innerHTML = `<p style="color: var(--dark-blue); padding: 1rem;">No countries found.</p>`;
    }

    renderPaginationControls();
}

function renderPaginationControls() {
    const pagesContainer = document.querySelector('.pages');
    if(!pagesContainer) return;

    const totalPages = appState.pages.length;

    if(totalPages <= 1){
        paginationSection.style.display = 'none';
        return;
    } else {
        paginationSection.style.display = 'flex';
    }

    let pagesHTML = '';
    const chunkSize = 4; 
    
    const currentBlock = Math.floor(appState.pageIndex / chunkSize);
    const startIdx = currentBlock * chunkSize;
    const endIdx = Math.min(startIdx + chunkSize, totalPages);

    if (currentBlock > 0) {
        pagesHTML += `<li class="page-ellipsis" style="display: flex; align-items: center; color: var(--dark-blue); padding: 0 5px;" tabindex="0">...</li>`;
    }

    for(let i = startIdx; i < endIdx; i++){
        const pageNum = i + 1;
        const isActive = i === appState.pageIndex ? 'selected' : '';
        pagesHTML += `<li class="page-number ${isActive}" data-index="${i}" tabindex="0">${pageNum}</li>`;
    }

    if (endIdx < totalPages) {
        pagesHTML += `<li class="page-ellipsis" style="display: flex; align-items: center; color: var(--dark-blue); padding: 0 5px;" tabindex="0">...</li>`;
        const lastActive = (totalPages - 1) === appState.pageIndex ? 'selected' : '';
        pagesHTML += `<li class="page-number ${lastActive}" data-index="${totalPages - 1}" tabindex="0">${totalPages}</li>`;
    }

    pagesContainer.innerHTML = pagesHTML;

    document.querySelectorAll('.page-number').forEach(item => {
        const handlePageAction = () => {
            triggerTransition(() => {
                appState.pageIndex = parseInt(item.getAttribute('data-index'));
                render();
                window.scrollTo(0, 0);
            });
        };

        item.addEventListener('click', handlePageAction);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePageAction();
            }
        });
    });
}

document.querySelector('.page-control.left')?.addEventListener('click', () => {
    if(appState.pageIndex > 0){
        triggerTransition(() => {
            appState.pageIndex--;
            render();
            window.scrollTo(0, 0);
        });
    }
});

document.querySelector('.page-control.right')?.addEventListener('click', () => {
    if(appState.pageIndex < appState.pages.length - 1){
        triggerTransition(() => {
            appState.pageIndex++;
            render();
            window.scrollTo(0, 0);
        });
    }
});