const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;

async function testCleanCosmos() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9891',
    '--window-size=1920,1080',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:3000/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2200));

  try {
    const res = await fetch('http://127.0.0.1:9891/json');
    const tabs = await res.json();
    const target = tabs.find(t => t.url.includes('localhost:3000'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.addEventListener('open', r));
    await send('Page.enable');
    await send('Runtime.enable');

    // Scroll to #who-we-worked-with
    await send('Runtime.evaluate', {
      expression: 'document.getElementById("who-we-worked-with").scrollIntoView({ behavior: "instant", block: "start" })'
    });
    await new Promise(r => setTimeout(r, 800));

    // Capture Step 1 (E-commerce)
    let shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const shot1Path = path.join(OUTPUT_DIR, 'clean_cosmos_step1_ecommerce.png');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('Saved:', shot1Path);

    // Scroll container to step 2 (~25%)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.getElementById('cosmos-scrolly-container');
        const rect = container.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = currentScrollY + rect.top;
        const totalDist = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: containerTop + 0.25 * totalDist, behavior: 'instant' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    let shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const shot2Path = path.join(OUTPUT_DIR, 'clean_cosmos_step2_fashion.png');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('Saved:', shot2Path);

    // Scroll container to step 4 (~70%)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.getElementById('cosmos-scrolly-container');
        const rect = container.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = currentScrollY + rect.top;
        const totalDist = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: containerTop + 0.65 * totalDist, behavior: 'instant' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    let shot4 = await send('Page.captureScreenshot', { format: 'png' });
    const shot4Path = path.join(OUTPUT_DIR, 'clean_cosmos_step4_agencies.png');
    fs.writeFileSync(shot4Path, Buffer.from(shot4.data, 'base64'));
    console.log('Saved:', shot4Path);

    // Scroll container to step 5 (~90%)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.getElementById('cosmos-scrolly-container');
        const rect = container.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = currentScrollY + rect.top;
        const totalDist = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: containerTop + 0.90 * totalDist, behavior: 'instant' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    let shot5 = await send('Page.captureScreenshot', { format: 'png' });
    const shot5Path = path.join(OUTPUT_DIR, 'clean_cosmos_step5_luxury.png');
    fs.writeFileSync(shot5Path, Buffer.from(shot5.data, 'base64'));
    console.log('Saved:', shot5Path);

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    edge.kill();
  }
}

testCleanCosmos();
