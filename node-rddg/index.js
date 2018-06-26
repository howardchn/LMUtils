const fs = require('fs');
const csv = require('csv');
const _ = require('lodash');
const { table } = require('table');

let csvPath = './resources/search-results-2018-06-14T19_36_48.134-0700.csv';
let csvContent = fs.readFileSync(csvPath, 'utf8');
csv.parse(csvContent, (err, data) => {
    if(err !== null) {
        console.error(err);
        return;
    }
    
    if(data < 1) {
        console.warn('no log found.');
    }
    
    let logItems = data.slice(1).map(d => { return { 
        epoch: d[0], /*mess: d[2],*/ 
        company: d[2].match(/\w+(?=.logicmonitor.com)/)[0], 
        pod: d[2].match(/(?<=pod=).*/)[0] 
    }});

    let logGroups = _.groupBy(logItems, l => `${l.pod} - ${l.company}`);
    let logResult = [];
    for(let key in logGroups) {
        logResult.push({ key, length: logGroups[key].length });
    }

    let logObjects = [];
    _.orderBy(logResult, ['key']).forEach(r => {
        let segs = r.key.split(' - ');
        let pod = segs[0].trim();
        let company = segs[1].trim();
        let count = r.length;
        let log = [pod, company, count];
        logObjects.push(log);
        // console.log(log.pod, log.company, log.count);
    });

    // let groupByPod = _.groupBy(logObjects, o => o[0]);
    // for(let i in groupByPod) {
    //     console.log(i, groupByPod[i].length);
    // }

    let logTable = table(logObjects);
    console.log(logObjects.length + ' companies used API to recover their devices and groups in last 30 days');
    console.log(logTable);

    fs.writeFileSync('./result.txt', logTable, 'utf8');
});