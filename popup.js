import { get, set, del } from './idb-keyval.js';

const settingsCog = document.querySelector('.settings .cog');
const settingsContent = document.querySelector('.settings .content');
const inputFile = document.querySelector('input.file');
const preFile = document.querySelector('pre.file');
const buttonReset = document.querySelector('button.reset');

settingsCog.addEventListener('click', () => {
  if (settingsContent.getAttribute('aria-expanded') === 'false') {
    settingsContent.setAttribute('aria-expanded',  'true');
    settingsContent.setAttribute('aria-hidden', 'false');
  } else {
    settingsContent.setAttribute('aria-expanded',  'false');
    settingsContent.setAttribute('aria-hidden', 'true');
  }
})


let term = '';

const bookmarksFile = await get('bookmarks');

if (bookmarksFile) {
  preFile.textContent = `Retrieved bookmarks "${bookmarksFile.name}" from IndexedDB.`;
  await loadData(bookmarksFile);
} else {
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      render(data);
    })
}

inputFile.addEventListener('change', async () => {
  try {
    const file = inputFile.files[0];
    await set('bookmarks', file);
    preFile.textContent = `Stored bookmarks for "${file.name}" in IndexedDB.`;
    await loadData(file);
  } catch (err) {
    console.error(err.name, err.message);
  }
})

buttonReset.addEventListener('click', async () => {
  inputFile.value = '';
  await del('bookmarks');
  inputFile.click();
})


function render(data) {
  updateList(data);
  const search = document.getElementById('search');
  search.addEventListener('input', (e) => {
    term = e.target.value.trim();
    updateList(data.filter(x => new RegExp(term, 'i').test(x.name)));
  });
}

function updateList(data) {
  document.getElementById('list').innerHTML = data.map(x =>
    `<li><a target="_blank" href="${x.url}" aria-label="${x.name}">
        <span role="presentation">🔖 </span>${tokenize(x.name)}</a></li>`).join('');
}

function tokenize(text) {
  return text.replaceAll(new RegExp(`(${term})`, 'ig'), `<span class="highlight">$1</span>`);
}

async function loadData(file) {
  const data = JSON.parse(await file.text());
  // todo - validate data before rendering.
  render(data);
  // const contents = await file.text();
  // preContents.textContent = contents;
}

