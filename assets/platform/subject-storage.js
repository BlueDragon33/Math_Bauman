(function (global) {
  'use strict';

  const base = global.BaumanPlatformStorage;
  if (!base) throw new Error('BaumanSubjectStorage requires BaumanPlatformStorage');

  const scopes = new Map();

  function cleanSubjectId(value) {
    const id = String(value || '').trim();
    if (!id) throw new Error('subjectId is required');
    return id;
  }

  function metadata(subjectId, action, extra) {
    return {
      layer: 'subject-storage',
      subjectId,
      action,
      ...(extra || {})
    };
  }

  function createScope(subjectId) {
    const id = cleanSubjectId(subjectId);
    if (scopes.has(id)) return scopes.get(id);

    const api = Object.freeze({
      subjectId: id,
      mode: base.mode,
      getItem(key) {
        return base.getItem(String(key));
      },
      setItem(key, value, extra) {
        base.setItem(String(key), value, metadata(id, 'set', extra));
        return value;
      },
      removeItem(key, extra) {
        base.removeItem(String(key), metadata(id, 'remove', extra));
      },
      getJSON(key, fallback) {
        return base.getJSON(String(key), fallback);
      },
      setJSON(key, value, extra) {
        base.setJSON(String(key), value, metadata(id, 'set-json', extra));
        return value;
      },
      readJSONWithLimit(key, fallback, maxChars) {
        const raw = base.getItem(String(key));
        if (!raw) return { value: fallback, status: 'missing', chars: 0 };
        const limit = Number(maxChars) > 0 ? Number(maxChars) : Infinity;
        if (raw.length > limit) {
          return { value: fallback, status: 'oversize-preserved', chars: raw.length };
        }
        try {
          return { value: JSON.parse(raw), status: 'ok', chars: raw.length };
        } catch (error) {
          return { value: fallback, status: 'invalid-json-preserved', chars: raw.length, error: String(error?.message || error) };
        }
      },
      readFirstJSON(primaryKey, legacyKeys, fallback) {
        return base.readFirstJSON(
          String(primaryKey),
          (legacyKeys || []).map(String),
          fallback
        );
      },
      copyLegacyJSON(targetKey, legacyKeys, extra) {
        const result = base.copyLegacyJSON(
          String(targetKey),
          (legacyKeys || []).map(String),
          metadata(id, 'copy-legacy', extra)
        );
        return result && result.copied
          ? { ...result, sourceKey: result.from }
          : result;
      }
    });

    scopes.set(id, api);
    return api;
  }

  global.BaumanSubjectStorage = Object.freeze({
    version: 1,
    forSubject: createScope,
    baseMode: base.mode
  });
})(window);
