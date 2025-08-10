const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", async function () {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  await loadDb();
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
    window.__TAURI__.opener.openUrl("https://github.com");
  });
});

let test = {};

const TEST_DB = 't';
const TEST_STORE = 'test';
let testDB;

async function loadDb() {
    test = {};
    try {
        const db = await opentestDB();
        const tx = db.transaction(TEST_STORE, 'readonly');
        const records = await idbRequest(tx.objectStore(TEST_STORE).getAll());
        for (const r of records) {
            test[String(r.id)] = { e: r.e, k: r.k };
        }
        await idbRequest(tx);
    } catch (e) {
        test = {};
    }
}

function opentestDB() {
  if (testDB) return Promise.resolve(testDB);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TEST_DB, 1);
    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(TEST_STORE)) {
        db.createObjectStore(TEST_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = function () {
      testDB = request.result;
      resolve(testDB);
    };
    request.onerror = function () { reject(request.error); };
  });
}

function idbRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

