
let startTime, previousTimeStamp;
let callback;

function animFrameLoop(timestamp) {
  if (startTime === undefined) {
    startTime = timestamp;
    }
  callback(timestamp - startTime);
  previousTimeStamp = timestamp
  window.requestAnimationFrame(animFrameLoop);
}

function startLoop(callFunc) {
  callback = callFunc;
  window.requestAnimationFrame(animFrameLoop);
}
