const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const EVENT_START_HOUR = 10;
const EVENT_START_MINUTE = 0;
const TALK_DURATION_MINUTES = 60;
const BREAK_DURATION_MINUTES = 10;
const LUNCH_DURATION_MINUTES = 60;
const LUNCH_AFTER_TALK_INDEX = 3; // Lunch after the 3rd talk

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
};

const server = http.createServer((req, res) => {
    if (req.url === '/api/schedule') {
        generateSchedule((err, schedule) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to generate schedule.' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(schedule));
        });
    } else {
        // Serve static files
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code == 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>');
                } else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+err.code+' ..\n');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

function generateSchedule(callback) {
    fs.readFile(path.join(__dirname, 'data', 'talks.json'), 'utf8', (err, data) => {
        if (err) {
            return callback(err);
        }
        const talks = JSON.parse(data);
        const schedule = [];
        let currentTime = new Date();
        currentTime.setHours(EVENT_START_HOUR, EVENT_START_MINUTE, 0, 0);

        talks.forEach((talk, index) => {
            // Add talk
            const talkStartTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + TALK_DURATION_MINUTES);
            const talkEndTime = new Date(currentTime);
            schedule.push({
                type: 'talk',
                startTime: formatTime(talkStartTime),
                endTime: formatTime(talkEndTime),
                ...talk
            });

            // Add lunch break
            if (index + 1 === LUNCH_AFTER_TALK_INDEX) {
                const lunchStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + LUNCH_DURATION_MINUTES);
                const lunchEndTime = new Date(currentTime);
                schedule.push({
                    type: 'lunch',
                    title: 'Lunch Break',
                    startTime: formatTime(lunchStartTime),
                    endTime: formatTime(lunchEndTime),
                });
            }
            // Add short break (but not after the last talk)
            else if (index < talks.length - 1) {
                const breakStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + BREAK_DURATION_MINUTES);
                const breakEndTime = new Date(currentTime);
                schedule.push({
                    type: 'break',
                    title: 'Transition',
                    startTime: formatTime(breakStartTime),
                    endTime: formatTime(breakEndTime),
                });
            }
        });
        callback(null, schedule);
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('To test the API, visit http://localhost:3001/api/schedule');
});
