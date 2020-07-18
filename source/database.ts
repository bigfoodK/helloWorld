import Level from 'level-ts';
import config from './config';

const database = new Level(config.leveldbPath);

export default database;
