// importing json files as modules
import { default as member0pt2json } from '../../data-samples/member0_data_pt2.json';
import { default as member1json } from '../../data-samples/member1_data.json';
import { default as member2json } from '../../data-samples/member2_data.json';

// reading CSF file as text (CSV parsing is done by the application)
const member0pt1csv = require('fs').readFileSync(require('path').resolve(__dirname, '../../data-samples/member0_data.csv'), 'utf8');

export const member0DataPart1 = member0pt1csv;
export const member0DataPart2 = member0pt2json;
export const member1Data = member1json;
export const member2Data = member2json;
