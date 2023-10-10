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
    draggable.setData({
      points: [
        {
          time: 10,
          value: -5,
        }
      ],
      possiblePoints: [
        {
          time: 3,
          value: -5,
        },
        {
          time: 8,
          value: -5,
        },
        {
          time: 10,
          value: -5,
        },
        {
          time: 11,
          value: -5,
        },
        {
          time: 12,
          value: -5,
        },
        {
          time: 13,
          value: -5,
        },
        {
          time: 15,
          value: -5,
        },
        {
          time: 18,
          value: -5,
        }
      ]
    });
    // setTimeout(() => {
    //   draggable.setData({
    //     points: [
    //       {
    //         time: 10,
    //         value: -5,
    //       },
    //       {
    //         time: 10,
    //         value: 5,
    //       }
    //     ],
    //     possiblePoints: [
    //       {
    //         time: 10,
    //         value: -5,
    //       },
    //       {
    //         time: 11,
    //         value: -5,
    //       },
    //       {
    //         time: 12,
    //         value: -5,
    //       },
    //       {
    //         time: 13,
    //         value: -5,
    //       }
    //     ]
    //   });
    // }, 5000)
    draggable.subscribeDragComplete((points) => {
      payoffSeries.setData(getLinePoints({ time: 1, value: -5 }, points[0], { time: 20, value: 5 }))
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