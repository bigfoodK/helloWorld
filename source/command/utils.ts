import { ServerConfig } from "./types";
import database from '../database';
import Level from 'level-ts';
import config from '../config';

const defaultServerConfig: ServerConfig = {
  prefix: config.prefix,
}

export async function getConfig(guildId: string): Promise<ServerConfig> {
  const prefix = await (database as Level<string>)
    .get(`config.${guildId}.prefix`)
    .catch(() => {
      database.put(`config.${guildId}.prefix`, defaultServerConfig.prefix);
      return defaultServerConfig.prefix;
    });

  return {
    prefix: prefix || defaultServerConfig.prefix,
  }
}