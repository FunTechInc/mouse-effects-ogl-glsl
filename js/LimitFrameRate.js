export class LimitFrameRate {
   constructor(framesPerSecond) {
      this.interval = Math.floor(1000 / framesPerSecond);
      this.previousTime = performance.now();
   }
   isLimitFrames(timestamp) {
      const deltaTime = timestamp - this.previousTime;
      const isLimitOver = deltaTime <= this.interval;
      if (!isLimitOver) {
         this.previousTime = timestamp - (deltaTime % this.interval);
      }
      return isLimitOver;
   }
}
