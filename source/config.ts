import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function getEnv(key: string, require?: boolean) {
  const value = process.env[key];
  if (require && !value) {
    throw new Error(`No ${key} exist in .env. Add it`)
  }
  return value;
}

export default {
  musicStorageDirectoryPath: getEnv('MUSIC_STORAGE_DIRECTORY_PATH') || path.join(__dirname, '../../storage'),
  leveldbPath: getEnv('LEVELDB_PATH') || '../../leveldb',
  tokken: getEnv('TOKKEN', true),
  prefix: getEnv('PREFIX') || '!',
} as const;
