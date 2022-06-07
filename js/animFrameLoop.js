
let startTime, previousTimeStamp;
let done = false

function animFrameLoop(timestamp, callback) {
  if (startTime === undefined) {
    startTime = timestamp;
    }
  const dt = timestamp - startTime;
  callback(dt);
  previousTimeStamp = timestamp
  window.requestAnimationFrame(animFrameLoop);
}

function startLoop(callback) {
  window.requestAnimationFrame(animFrameLoop, callback);
}
