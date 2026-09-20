// Copyright (C) 2017-2026 Smart code 203358507

import { useEffect, useRef } from 'react';
import { usePlatform } from './Platform';
import usePlayerLandscapeLockSetting from './usePlayerLandscapeLockSetting';
import {
    canOfferLandscapeLock,
    canRequestLandscapeLock,
    getScreenOrientationLock,
    isStandaloneDisplayMode,
    releaseLandscapeLock,
    requestLandscapeLock,
} from './playerLandscapeLock';

const usePlayerLandscapeLock = (fullscreen: boolean) => {
    const platform = usePlatform();
    const { enabled } = usePlayerLandscapeLockSetting();
    const requestedLockRef = useRef(false);

    const canOffer = canOfferLandscapeLock(platform, getScreenOrientationLock());
    const canRequest = canRequestLandscapeLock({
        canOffer,
        enabled,
        fullscreen,
        standalone: isStandaloneDisplayMode(),
    });

    useEffect(() => {
        const orientation = globalThis.screen?.orientation;
        if (!orientation || typeof orientation.lock !== 'function') {
            return;
        }

        if (!canRequest) {
            if (requestedLockRef.current) {
                requestedLockRef.current = false;
                releaseLandscapeLock(orientation);
            }
            return;
        }

        let cancelled = false;
        requestedLockRef.current = true;

        requestLandscapeLock(orientation).then(() => {
            if (cancelled) {
                releaseLandscapeLock(orientation);
            }
        });

        return () => {
            cancelled = true;
            if (requestedLockRef.current) {
                requestedLockRef.current = false;
                releaseLandscapeLock(orientation);
            }
        };
    }, [canRequest]);
};

export default usePlayerLandscapeLock;
