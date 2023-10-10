import { SingleValueData, createChartEx } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { parseRgb, rgba, rgbaToString } from "./utils/colors";
import { HorzScaleBehaviorPrice } from "./HorzScaleBehaviorPrice";
import css from "./StrategyChart.module.css";
import { DraggablePointsPrimitive } from "./DraggablePointsPrimitive";
import { linearSpline } from "./LinearSpline";

export function StrategyChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const horzScaleBehavior = new HorzScaleBehaviorPrice();
    const chart = createChartEx<number, HorzScaleBehaviorPrice>(
      containerRef.current,
      horzScaleBehavior,
      {
        handleScroll: {
          // pressedMouseMove: false,
          // horzTouchDrag: false
        },
        leftPriceScale: {
          visible: true,
        }
      }
    );

    const alphaChannel = 0.1;
    const topColor = "#24B29B"; // color-minty-green-a700
    const topFill = rgbaToString(rgba(parseRgb(topColor), alphaChannel));
    const bottomColor = "#e91e63"; // color-berry-pink-500
    const bottomFill = rgbaToString(rgba(parseRgb(bottomColor), alphaChannel));

    const payoffSeries = chart.addBaselineSeries({
      baseValue: { type: "price", price: 0 },
      topLineColor: topColor,
      topFillColor1: topFill,
      topFillColor2: topFill,
      bottomLineColor: bottomColor,
      bottomFillColor1: bottomFill,
      bottomFillColor2: bottomFill,
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: "left",
      lineWidth: 3,
    });

    payoffSeries.setData(getLinePoints({ time: 1, value: -5 }, { time: 10, value: -5 }, { time: 20, value: 5 }));

    const draggable = new DraggablePointsPrimitive();
    draggable.setData(getDraggablePoints(10, -5));

    let oldBreak = { time: 10, value: -5 };

    draggable.subscribeDragComplete((points) => {
      const newBreak = points[0];
      const newPremium = oldBreak.time < newBreak.time ? newBreak.value / 2 : newBreak.value * 2;
      payoffSeries.setData(getLinePoints({ time: 1, value: newPremium }, {
        time: newBreak.time,
        value: newPremium
      }, { time: 20, value: 5 }));
      draggable.setData(getDraggablePoints(newBreak.time, newPremium));
      oldBreak = newBreak;
    });
    payoffSeries.attachPrimitive(draggable);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return <div ref={containerRef} className={css.chart}></div>;
}

const getLinePoints = (start: SingleValueData<any>, breakLine: SingleValueData<any>, end: SingleValueData<any>) => {
  const data = [
    start,
    breakLine,
    end,
  ];
  const newTime = new Array(end.time - start.time).fill(0).map((_, index) => index + start.time);
  const newValue = linearSpline(data.map(_ => _.time), data.map(_ => _.value), newTime);
  return newTime.map((time, index) => ({ time, value: newValue[index] }))
}

const getDraggablePoints = (breakTime: number, premium: number) => {
  return {
    points: [
      {
        time: breakTime,
        value: premium,
      }
    ],
    possiblePoints: [
      {
        time: 3,
        value: premium,
      },
      {
        time: 8,
        value: premium,
      },
      {
        time: 10,
        value: premium,
      },
      {
        time: 11,
        value: premium,
      },
      {
        time: 12,
        value: premium,
      },
      {
        time: 13,
        value: premium,
      },
      {
        time: 15,
        value: premium,
      },
      {
        time: 18,
        value: premium,
      }
    ]
  }
};