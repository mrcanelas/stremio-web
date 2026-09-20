// Copyright (C) 2017-2026 Smart code 203358507

const PLAYER_LANDSCAPE_LOCK_STORAGE_KEY = 'stremio.playerLandscapeLock';

const parsePlayerLandscapeLock = (value) => {
    return value === 'true';
};

const readPlayerLandscapeLock = () => {
    try {
        return parsePlayerLandscapeLock(globalThis.localStorage.getItem(PLAYER_LANDSCAPE_LOCK_STORAGE_KEY));
    } catch (_) {
        return false;
    }
};

const writePlayerLandscapeLock = (enabled) => {
    try {
        if (enabled) {
            globalThis.localStorage.setItem(PLAYER_LANDSCAPE_LOCK_STORAGE_KEY, 'true');
        } else {
            globalThis.localStorage.removeItem(PLAYER_LANDSCAPE_LOCK_STORAGE_KEY);
        }
    } catch (_) {
        // Ignore quota / private-mode failures; playback must continue.
    }
};

const getScreenOrientationLock = () => {
    try {
        const lock = globalThis.screen?.orientation?.lock;
        return typeof lock === 'function' ? lock : undefined;
    } catch (_) {
        return undefined;
    }
};

const canOfferLandscapeLock = (platform, orientationLock = getScreenOrientationLock()) => {
    return platform.isMobile === true &&
        platform.name === 'android' &&
        platform.shell.active !== true &&
        typeof orientationLock === 'function';
};

const canRequestLandscapeLock = ({ canOffer, enabled, fullscreen, standalone }) => {
    return canOffer === true &&
        enabled === true &&
        (fullscreen === true || standalone === true);
};

const isStandaloneDisplayMode = () => {
    try {
        return typeof globalThis.matchMedia === 'function' &&
            globalThis.matchMedia('(display-mode: standalone)').matches === true;
    } catch (_) {
        return false;
    }
};

const requestLandscapeLock = (orientation) => {
    try {
        const result = orientation.lock('landscape');
        if (result && typeof result.then === 'function') {
            return result.catch(() => undefined);
        }
        return Promise.resolve();
    } catch (_) {
        return Promise.resolve();
    }
};

const releaseLandscapeLock = (orientation) => {
    try {
        if (typeof orientation.unlock === 'function') {
            orientation.unlock();
        }
    } catch (_) {
        // Unlock can throw if the document is no longer allowed to control orientation.
    }
};

module.exports = {
    PLAYER_LANDSCAPE_LOCK_STORAGE_KEY,
    parsePlayerLandscapeLock,
    readPlayerLandscapeLock,
    writePlayerLandscapeLock,
    getScreenOrientationLock,
    canOfferLandscapeLock,
    canRequestLandscapeLock,
    isStandaloneDisplayMode,
    requestLandscapeLock,
    releaseLandscapeLock,
};
