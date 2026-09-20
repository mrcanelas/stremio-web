// Copyright (C) 2017-2026 Smart code 203358507

import { useEffect, useRef } from 'react';
import { usePlatform } from './Platform';
import usePlayerLandscapeLockSetting from './usePlayerLandscapeLockSetting';
import {
    canOfferLandscapeLock,
    canRequestLandscapeLock,
    getScreenOrientationLock,
    isDocumentFullscreen,
    isStandaloneDisplayMode,
    releaseLandscapeLock,
    requestLandscapeLock,
    setApplyLandscapeLockOnFullscreen,
} from './playerLandscapeLock';

const usePlayerLandscapeLock = () => {
    const platform = usePlatform();
    const { enabled } = usePlayerLandscapeLockSetting();
    const requestedLockRef = useRef(false);

    const canOffer = canOfferLandscapeLock(platform, getScreenOrientationLock());

    useEffect(() => {
        const orientation = globalThis.screen?.orientation;
        const canRequest = canRequestLandscapeLock({
            canOffer,
            enabled,
            fullscreen: isDocumentFullscreen(),
            standalone: isStandaloneDisplayMode(),
        });

        if (!orientation || typeof orientation.lock !== 'function' || !canOffer || !enabled) {
            setApplyLandscapeLockOnFullscreen(false);
            if (requestedLockRef.current && orientation) {
                requestedLockRef.current = false;
                releaseLandscapeLock(orientation);
            }
            return;
        }

        let cancelled = false;
        setApplyLandscapeLockOnFullscreen(true);

        const applyLock = () => {
            if (cancelled) {
                return;
            }

            requestedLockRef.current = true;
            requestLandscapeLock(orientation).then(() => {
                if (cancelled) {
                    releaseLandscapeLock(orientation);
                }
            });
        };

        const onFullscreenChange = () => {
            if (isDocumentFullscreen()) {
                applyLock();
                return;
            }

            if (requestedLockRef.current && !isStandaloneDisplayMode()) {
                requestedLockRef.current = false;
                releaseLandscapeLock(orientation);
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);

        if (canRequest) {
            applyLock();
        }

        return () => {
            cancelled = true;
            setApplyLandscapeLockOnFullscreen(false);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            if (requestedLockRef.current) {
                requestedLockRef.current = false;
                releaseLandscapeLock(orientation);
            }
        };
    }, [canOffer, enabled]);
};

export default usePlayerLandscapeLock;
