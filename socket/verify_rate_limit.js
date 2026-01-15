const http = require('http');

const limit = 100;
const url = 'http://localhost:8080/health'; // Adjust port if needed

async function makeRequest(i) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            // console.log(`Request ${i}: Status ${res.statusCode}`);
            resolve(res.statusCode);
        }).on('error', (e) => {
            console.error(`Request ${i} error:`, e.message);
            resolve(null);
        });
    });
}

async function run() {
    console.log(`Sending ${limit + 10} requests...`);
    let blocked = false;
    for (let i = 1; i <= limit + 10; i++) {
        const status = await makeRequest(i);
        if (status === 429) {
            console.log(`Request ${i}: Blocked (429 Too Many Requests)`);
            blocked = true;
            break;
        }
        if (i % 10 === 0) console.log(`Completed ${i} requests...`);
    }

    if (blocked) {
        console.log("verification passed: Rate limiter is working.");
    } else {
        console.log("verification failed: Rate limiter did not block requests.");
    }
}

run();
