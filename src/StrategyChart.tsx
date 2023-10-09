import { createChartEx } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { parseRgb, rgba, rgbaToString } from "./utils/colors";
import { HorzScaleBehaviorPrice } from "./HorzScaleBehaviorPrice";
import css from "./StrategyChart.module.css";
import { DraggablePointsPrimitive } from "./DraggablePointsPrimitive";

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

    payoffSeries.setData([
      {
        time: 1,
        value: -5,
      },
      {
        time: 10,
        value: -5,
      },
      {
        time: 20,
        value: 5,
      },
    ]);

    const draggable = new DraggablePointsPrimitive();
    draggable.setData([
      {
        time: 10,
        value: -5,
      }
    ]);
    setTimeout(() => {
      draggable.setData([
        {
          time: 10,
          value: -5,
        },
        {
          time: 10,
          value: 5,
        }
      ]);
    }, 5000)

    payoffSeries.attachPrimitive(draggable);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return <div ref={containerRef} className={css.chart}></div>;
}