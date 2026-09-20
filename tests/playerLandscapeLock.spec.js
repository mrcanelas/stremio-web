const {
    parsePlayerLandscapeLock,
    readPlayerLandscapeLock,
    writePlayerLandscapeLock,
    PLAYER_LANDSCAPE_LOCK_STORAGE_KEY,
    canOfferLandscapeLock,
    canRequestLandscapeLock,
} = require('../src/common/playerLandscapeLock');

const androidMobile = {
    isMobile: true,
    name: 'android',
    shell: { active: false },
};

describe('parsePlayerLandscapeLock', () => {
    it('enables only the stored true value', () => {
        expect(parsePlayerLandscapeLock('true')).toBe(true);
    });

    it('treats a missing value as disabled', () => {
        expect(parsePlayerLandscapeLock(null)).toBe(false);
    });

    it('treats any other stored value as disabled', () => {
        expect(parsePlayerLandscapeLock('false')).toBe(false);
        expect(parsePlayerLandscapeLock('1')).toBe(false);
        expect(parsePlayerLandscapeLock('')).toBe(false);
    });
});

describe('playerLandscapeLock storage', () => {
    let store;

    beforeEach(() => {
        store = new Map();
        global.localStorage = {
            getItem: (key) => (store.has(key) ? store.get(key) : null),
            setItem: (key, value) => {
                store.set(key, String(value));
            },
            removeItem: (key) => {
                store.delete(key);
            },
        };
    });

    afterEach(() => {
        delete global.localStorage;
    });

    it('reads as disabled when the key is absent', () => {
        expect(readPlayerLandscapeLock()).toBe(false);
    });

    it('persists the enabled value and can be cleared', () => {
        writePlayerLandscapeLock(true);
        expect(store.get(PLAYER_LANDSCAPE_LOCK_STORAGE_KEY)).toBe('true');
        expect(readPlayerLandscapeLock()).toBe(true);

        writePlayerLandscapeLock(false);
        expect(store.has(PLAYER_LANDSCAPE_LOCK_STORAGE_KEY)).toBe(false);
        expect(readPlayerLandscapeLock()).toBe(false);
    });
});

describe('canOfferLandscapeLock', () => {
    const lock = () => Promise.resolve();

    it('offers the setting on Android mobile with the orientation lock API', () => {
        expect(canOfferLandscapeLock(androidMobile, lock)).toBe(true);
    });

    it('hides the setting on iOS even if lock exists', () => {
        expect(canOfferLandscapeLock({
            isMobile: true,
            name: 'ios',
            shell: { active: false },
        }, lock)).toBe(false);
    });

    it('hides the setting on desktop', () => {
        expect(canOfferLandscapeLock({
            isMobile: false,
            name: 'windows',
            shell: { active: false },
        }, lock)).toBe(false);
    });

    it('hides the setting in the desktop shell', () => {
        expect(canOfferLandscapeLock({
            isMobile: true,
            name: 'android',
            shell: { active: true },
        }, lock)).toBe(false);
    });

    it('hides the setting when the orientation lock API is missing', () => {
        expect(canOfferLandscapeLock(androidMobile, undefined)).toBe(false);
        expect(canOfferLandscapeLock(androidMobile, null)).toBe(false);
    });
});

describe('canRequestLandscapeLock', () => {
    it('requests lock only when offered, enabled, and fullscreen or standalone', () => {
        expect(canRequestLandscapeLock({
            canOffer: true,
            enabled: true,
            fullscreen: true,
            standalone: false,
        })).toBe(true);

        expect(canRequestLandscapeLock({
            canOffer: true,
            enabled: true,
            fullscreen: false,
            standalone: true,
        })).toBe(true);
    });

    it('does not request lock when the option is off or unsupported', () => {
        expect(canRequestLandscapeLock({
            canOffer: true,
            enabled: false,
            fullscreen: true,
            standalone: true,
        })).toBe(false);

        expect(canRequestLandscapeLock({
            canOffer: false,
            enabled: true,
            fullscreen: true,
            standalone: true,
        })).toBe(false);
    });

    it('does not request lock in a regular tab without fullscreen', () => {
        expect(canRequestLandscapeLock({
            canOffer: true,
            enabled: true,
            fullscreen: false,
            standalone: false,
        })).toBe(false);
    });
});

describe('tryApplyLandscapeLock', () => {
    const {
        setApplyLandscapeLockOnFullscreen,
        tryApplyLandscapeLock,
    } = require('../src/common/playerLandscapeLock');

    it('does not lock until the player has asked for it', async () => {
        const lock = jest.fn(() => Promise.resolve());
        global.screen = {
            orientation: {
                lock,
                unlock: jest.fn(),
            },
        };

        setApplyLandscapeLockOnFullscreen(false);
        await tryApplyLandscapeLock();
        expect(lock).not.toHaveBeenCalled();

        setApplyLandscapeLockOnFullscreen(true);
        await tryApplyLandscapeLock();
        expect(lock).toHaveBeenCalledWith('landscape');

        setApplyLandscapeLockOnFullscreen(false);
        delete global.screen;
    });
});
