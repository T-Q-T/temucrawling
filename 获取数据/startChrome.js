const { exec } = require('child_process');

const command = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="${process.env.HOME}/ChromeProfile" \
  --no-default-browser-check \
  --no-first-run \
  --disable-blink-features=AutomationControlled \
  --disable-features=IsolateOrigins,site-per-process`;

console.log('正在启动Chrome...');
console.log('执行命令:', command);

const chrome = exec(command);

chrome.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

chrome.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

chrome.on('error', (error) => {
  console.error('Error:', error);
});