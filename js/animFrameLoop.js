let startTime; let
  previousTimeStamp;
let callback;
let dt;

function animFrameLoop(timestamp) {
  if (startTime === undefined) {
    startTime = timestamp;
    previousTimeStamp = timestamp;
  }

  dt = (timestamp - previousTimeStamp) / 1000;
  callback(dt);

  previousTimeStamp = timestamp;
  window.requestAnimationFrame(animFrameLoop);
}

function startLoop(callFunc) {
  callback = callFunc;
  window.requestAnimationFrame(animFrameLoop);
}
