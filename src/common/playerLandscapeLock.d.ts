export const PLAYER_LANDSCAPE_LOCK_STORAGE_KEY: string;

export function parsePlayerLandscapeLock(value: string | null): boolean;
export function readPlayerLandscapeLock(): boolean;
export function writePlayerLandscapeLock(enabled: boolean): void;
export function getScreenOrientationLock(): ((type: string) => Promise<void>) | undefined;
export function canOfferLandscapeLock(
    platform: {
        isMobile: boolean,
        name: string,
        shell: { active: boolean },
    },
    orientationLock?: unknown,
): boolean;
export function canRequestLandscapeLock(args: {
    canOffer: boolean,
    enabled: boolean,
    fullscreen: boolean,
    standalone: boolean,
}): boolean;
export function isStandaloneDisplayMode(): boolean;
export function isDocumentFullscreen(): boolean;
export function requestLandscapeLock(orientation: {
    lock: (type: string) => Promise<void> | void,
}): Promise<void>;
export function releaseLandscapeLock(orientation: {
    unlock?: () => void,
}): void;
export function setApplyLandscapeLockOnFullscreen(enabled: boolean): void;
export function tryApplyLandscapeLock(): Promise<void>;
