(function (global) {
  'use strict';

  const memoryFallback = new Map();
  const listeners = new Set();

  function localStorageAvailable() {
    try {
      const key = '__bauman_storage_probe__';
      global.localStorage.setItem(key, '1');
      global.localStorage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  }

  const hasLocalStorage = localStorageAvailable();

  const driver = {
    getItem(key) {
      if (hasLocalStorage) return global.localStorage.getItem(key);
      return memoryFallback.has(key) ? memoryFallback.get(key) : null;
    },
    setItem(key, value) {
      const serialized = String(value);
      if (hasLocalStorage) global.localStorage.setItem(key, serialized);
      else memoryFallback.set(key, serialized);
    },
    removeItem(key) {
      if (hasLocalStorage) global.localStorage.removeItem(key);
      else memoryFallback.delete(key);
    }
  };

  function emit(change) {
    listeners.forEach((listener) => {
      try { listener(change); } catch (error) { console.warn('BaumanStorage listener failed', error); }
    });
  }

  function getItem(key) {
    return driver.getItem(key);
  }

  function setItem(key, value, metadata) {
    const oldValue = driver.getItem(key);
    driver.setItem(key, value);
    emit({ key, oldValue, newValue: String(value), source: 'same-tab', metadata: metadata || null });
  }

  function removeItem(key, metadata) {
    const oldValue = driver.getItem(key);
    driver.removeItem(key);
    emit({ key, oldValue, newValue: null, source: 'same-tab', metadata: metadata || null });
  }

  function getJSON(key, fallback) {
    const raw = getItem(key);
    if (raw === null || raw === '') return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function setJSON(key, value, metadata) {
    setItem(key, JSON.stringify(value), metadata);
  }

  function readFirstJSON(primaryKey, legacyKeys, fallback) {
    const keys = [primaryKey].concat(Array.isArray(legacyKeys) ? legacyKeys : []).filter(Boolean);
    for (const key of keys) {
      const raw = getItem(key);
      if (raw === null || raw === '') continue;
      try {
        return { key, value: JSON.parse(raw), migrated: key !== primaryKey };
      } catch (_) {
        // Preserve malformed legacy data. Never delete it automatically.
      }
    }
    return { key: null, value: fallback, migrated: false };
  }

  function copyLegacyJSON(primaryKey, legacyKeys) {
    if (getItem(primaryKey) !== null) return { copied: false, reason: 'primary-exists' };
    const found = readFirstJSON(primaryKey, legacyKeys, null);
    if (!found.key || found.value === null) return { copied: false, reason: 'not-found' };
    setJSON(primaryKey, found.value, { migrationFrom: found.key });
    return { copied: true, from: found.key, to: primaryKey };
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    return function unsubscribe() { listeners.delete(listener); };
  }

  if (hasLocalStorage && global.addEventListener) {
    global.addEventListener('storage', (event) => {
      if (!event.key) return;
      emit({ key: event.key, oldValue: event.oldValue, newValue: event.newValue, source: 'cross-tab', metadata: null });
    });
  }

  global.BaumanPlatformStorage = Object.freeze({
    version: 1,
    mode: hasLocalStorage ? 'localStorage' : 'memory-fallback',
    getItem,
    setItem,
    removeItem,
    getJSON,
    setJSON,
    readFirstJSON,
    copyLegacyJSON,
    subscribe,
    localStorageAvailable: hasLocalStorage
  });
})(window);
