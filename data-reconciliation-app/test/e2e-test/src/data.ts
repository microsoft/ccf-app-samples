import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// reading CSV file as text (CSV parsing is done by the application)
const member0csvData = fs.readFileSync(path.resolve(__dirname, '../../data-samples/member0_data.csv'), 'utf8');
const csvFileWrongSchema = fs.readFileSync(path.resolve(__dirname, '../../data-samples/member0_wrong_schema.csv'), 'utf8');

// JSON Files
const member0jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data-samples/member0_data_pt2.json'), 'utf8'));
const member1jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data-samples/member1_data.json'), 'utf8'));
const member2jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data-samples/member2_data.json'), 'utf8'));

export const csvDataWrongSchema = csvFileWrongSchema;
export const member0DataPart1 = member0csvData;
export const member0DataPart2 = member0jsonData;
export const member1Data = member1jsonData;
export const member2Data = member2jsonData;
