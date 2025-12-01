
export type ClockProps =
  | {
      type: "timer"
      duration: number // in ms
    }
  | {
      type: "stopwatch"
    }


export const dummyTimer: ClockProps = {
  type: "timer",
  duration: 5000
}

export const dummyStopwatch: ClockProps = {
  type: "stopwatch"
}
