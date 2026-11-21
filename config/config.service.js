import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV || "development";

const envPath = {
    development: ".env.development",
    production: ".env.production"
}

config({path: resolve(`config/${envPath[NODE_ENV]}`)});

export const PORT = +process.env.PORT;
export const DB_URI = process.env.DB_URI;
export const RADIS_URL = process.env.RADIS_URL;
export const EMAIL = process.env.EMAIL;
export const PASS = process.env.PASS;
export const AUDINCE_GAMIL = process.env.AUDINCE_GAMIL;
export const DB_URI_ONLINE = process.env.DB_URI_ONLINE;
export const REFRESH_TOKEN_SIGHNATURE = process.env.REFRESH_TOKEN_SIGHNATURE;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const ACCESS_TOKEN_SIGHNATURE = process.env.ACCESS_TOKEN_SIGHNATURE;
export const ALLOW_ORIGINS = process.env.ALLOW_ORIGINS?.split(",") || [];