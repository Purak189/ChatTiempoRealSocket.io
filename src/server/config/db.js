import { createClient } from '@libsql/client';
import { DB_URL, DB_TOKEN_TURSO} from './config.js';

let dbInstance = null;

const createDbInstance = () => {
    return createClient ({
        url: DB_URL,
        authToken: DB_TOKEN_TURSO,
    });
};

const getDbInstance = () => {
    if (!dbInstance) {
        dbInstance = createDbInstance();
    }
    return dbInstance;
};

export { getDbInstance };