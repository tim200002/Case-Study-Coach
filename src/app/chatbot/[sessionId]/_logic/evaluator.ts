interface Evaluator<T> {
  addInput(input: T): void;
  addListener(listener: (score: number) => void): void;
}

export class WordSpeedEvaluator implements Evaluator<number> {
  private scoreHistory: number[] = [];
  private listeners: ((score: number) => void)[] = [];

  addListener(listener: (score: number) => void): void {
    this.listeners.push(listener);
  }

  addInput(input: number) {
    console.log("Word Speech Evaluatior input: " + input);
    this.scoreHistory.push(input);

    // caclulate new score using exponentially weighted moving average
    // https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average
    const alpha = 0.9;
    let averageSpeed = 0;
    let weight = 1;
    for (let i = this.scoreHistory.length - 1; i >= 0; i--) {
      averageSpeed += weight * this.scoreHistory[i]!;
      weight *= alpha;
    }

    //ToDo change
    const score = Math.min(averageSpeed / 15, 10);
    this.listeners.forEach((listener) => listener(score));
  }
}
