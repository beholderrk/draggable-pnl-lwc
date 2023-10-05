import {
  ChartOptionsImpl,
  IHorzScaleBehavior,
  InternalHorzScaleItem,
  Mutable,
  TickMark,
  TimeMark,
  TimeScalePoint,
} from "lightweight-charts";

export class HorzScaleBehaviorPrice implements IHorzScaleBehavior<number> {
  options(): ChartOptionsImpl<number> {
    return {} as any;
  }
  setOptions() {}
  preprocessData() {}
  updateFormatter() {}
  createConverterToInternalObj() {
    return (price: number) => price as unknown as InternalHorzScaleItem;
  }

  key(item: any) {
    return item;
  }

  cacheKey(item: InternalHorzScaleItem) {
    return item as unknown as number;
  }

  convertHorzItemToInternal(item: number) {
    return item as unknown as InternalHorzScaleItem;
  }

  formatHorzItem(item: InternalHorzScaleItem) {
    const tp = item as unknown as number;
    return tp.toFixed(2);
  }

  formatTickmark(tickMark: TickMark) {
    return (tickMark.time as unknown as number).toFixed(2);
  }

  maxTickMarkWeight(tickMarks: TimeMark[]) {
    return tickMarks.reduce(markWithGreaterWeight, tickMarks[0]).weight;
  }

  fillWeightsForPoints(sortedTimePoints: readonly Mutable<TimeScalePoint>[], startIndex: number) {
    // const priceWeight = (price) => {
    //   if (price % 10 === 0) return 2;
    //   if (price % 2 === 0) return 1;
    //   return 0;
    // };
    // for (let index = startIndex; index < sortedTimePoints.length; ++index) {
    //   sortedTimePoints[index].timeWeight = priceWeight(
    //     sortedTimePoints[index].time
    //   );
    // }
  }
}

function markWithGreaterWeight(a: TimeMark, b: TimeMark) {
  return a.weight > b.weight ? a : b;
}