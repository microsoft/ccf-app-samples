// reading CSV file as text (CSV parsing is done by the application)
const member0csvData = require('fs').readFileSync(require('path').resolve(__dirname, '../../data-samples/member0_data.csv'), 'utf8');

// JSON Files
const member0jsonData = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, '../../data-samples/member0_data_pt2.json')));
const member1jsonData = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, '../../data-samples/member1_data.json')));
const member2jsonData = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, '../../data-samples/member2_data.json')));

export const member0DataPart1 = member0csvData;
export const member0DataPart2 = member0jsonData;
export const member1Data = member1jsonData;
export const member2Data = member2jsonData;
