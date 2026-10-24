import { appState } from "./state.js";
import { 
    fetchData,
    render,
    customSelect,
    selectTrigger,
    selectOptions,
    modeBtn,
    searchBox,
    mode
} from "./control.js";

fetchData();

export function triggerTransition(callback) {
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            callback();
        });
    } else {
        callback();
    }
}

function darkmode() {
    triggerTransition(() => {
        if (!appState.dark) {
            appState.dark = true;
        } else {
            appState.dark = false;
        }
        render();
    });
}

function selectOption(option){
    const text = option.textContent;

    if(!option.classList.contains('selected')){
        option.classList.add('selected');
        appState.regions.push(text);
    }else{
        option.classList.remove('selected');
        appState.regions = appState.regions.filter(country => country !== text);
    }

    appState.pageIndex = 0;

    triggerTransition(() => {
        if(appState.regions.length === selectOptions.length){
            appState.filterAll = true;
            render();
        }else if(appState.regions.length > 0){
            appState.filterAll = false;
            render();
        }else{
            render();
        }
    });
}

modeBtn.addEventListener('click', () => {
    darkmode();
});

modeBtn.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
        darkmode();
    }
})

selectTrigger.addEventListener('click', () => {
    const isOpen = customSelect.classList.toggle('open');
    selectTrigger.setAttribute('aria-expanded', isOpen);
});

selectOptions.forEach(option => {
    option.addEventListener('click', () => {
       selectOption(option);
    });

    option.addEventListener('keydown', (e)=>{
        if(e.key==='Enter'){
            selectOption(option);
        }
    })
});

document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
        customSelect.classList.remove('open');
        selectTrigger.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
        selectTrigger.setAttribute('aria-expanded', 'false');
    }
});

searchBox.addEventListener('input', ()=>{
    appState.pageIndex = 0;
    triggerTransition(() => {
        render();
    });
});
