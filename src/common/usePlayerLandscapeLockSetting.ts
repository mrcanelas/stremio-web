// Copyright (C) 2017-2026 Smart code 203358507

import { useCallback, useState } from 'react';
import {
    readPlayerLandscapeLock,
    writePlayerLandscapeLock,
} from './playerLandscapeLock';

const usePlayerLandscapeLockSetting = () => {
    const [enabled, setEnabled] = useState(readPlayerLandscapeLock);

    const toggle = useCallback(() => {
        setEnabled((current) => {
            const next = !current;
            writePlayerLandscapeLock(next);
            return next;
        });
    }, []);

    return {
        enabled,
        toggle,
    };
};

export default usePlayerLandscapeLockSetting;
