import { IChartApiBase, ISeriesApi, SingleValueData, createChartEx } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { parseRgb, rgba, rgbaToString } from "./utils/colors";
import { HorzScaleBehaviorPrice } from "./HorzScaleBehaviorPrice";
import css from "./StrategyChart.module.css";
import { DraggablePointsPrimitive } from "./DraggablePointsPrimitive";
import { linearSpline } from "./LinearSpline";
import { Spinner } from "./Spinner";

export function StrategyChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const payoffSeriesRef = useRef<ISeriesApi<"Baseline", number> | null>(null);
  const shadowPayoffRef = useRef<ISeriesApi<"Line", number> | null>(null);
  const draggableRef = useRef<DraggablePointsPrimitive | null>(null);
  const chartRef = useRef<IChartApiBase<number>>();
  const [ fetchParams, setFetchParams ] = useState({
    start: { time: 1, value: -5 },
    break: { time: 10, value: -5 },
    end: { time: 20, value: 5 },
  });
  const fetchParamsRef = useRef(fetchParams);
  fetchParamsRef.current = fetchParams;
  const [ loading, setLoading ] = useState(false);

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
        rightPriceScale: {
          visible: false,
        },
        leftPriceScale: {
          visible: true,
        },
      }
    );
    chartRef.current = chart;

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
    payoffSeriesRef.current = payoffSeries;

    const draggable = new DraggablePointsPrimitive();
    draggableRef.current = draggable;

    const shadowPayoff = chart.addLineSeries({
      visible: false,
      lineWidth: 3,
      priceScaleId: "left",
      color: "rgba(0,0,0,0.2)",
      pointMarkersVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false
    })
    shadowPayoffRef.current = shadowPayoff;

    draggable.subscribeDragMove((nextPossiblePoint) => {
      shadowPayoff.setData(getLinePoints(fetchParamsRef.current.start, nextPossiblePoint, fetchParamsRef.current.end));
      shadowPayoff.applyOptions({ visible: true });
    });

    let oldBreak = fetchParamsRef.current.break;

    draggable.subscribeDragComplete((points) => {
      const newBreak = points[0];
      const newPremium =
        oldBreak.time < newBreak.time ? newBreak.value / 2 : newBreak.value * 2;

      setFetchParams((s) => ({
        ...s,
        start: { time: 1, value: newPremium },
        break: { time: newBreak.time, value: newPremium },  
      }));
      oldBreak = newBreak;
      
    });
    payoffSeries.attachPrimitive(draggable);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!payoffSeriesRef.current) return;
    setLoading(true);
    fetchLinePoints(
      fetchParams.start,
      fetchParams.break,
      fetchParams.end,
    ).then((data) => {
      payoffSeriesRef.current!.setData(data);
      chartRef.current!.timeScale().fitContent();
      draggableRef.current!.setData(getDraggablePoints(fetchParams.break.time, fetchParams.break.value));
      shadowPayoffRef.current!.applyOptions({ visible: false });
      setLoading(false);
    });
  }, [fetchParams]);

  return <div ref={containerRef} className={css.chart}>
    {loading && <Spinner className={ css.spinner } />}
  </div>;
}

const getLinePoints = (
  start: SingleValueData<any>,
  breakLine: SingleValueData<any>,
  end: SingleValueData<any>
) => {
  const data = [start, breakLine, end];
  const newTime = new Array(end.time - start.time)
    .fill(0)
    .map((_, index) => index + start.time);
  const newValue = linearSpline(
    data.map((_) => _.time),
    data.map((_) => _.value),
    newTime
  );
  return newTime.map((time, index) => ({ time, value: newValue[index] }));
};

const fetchLinePoints = async (
  start: SingleValueData<any>,
  breakLine: SingleValueData<any>,
  end: SingleValueData<any>
) => {
  await sleep(300);
  return getLinePoints(start, breakLine, end);
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getDraggablePoints = (breakTime: number, premium: number) => {
  return {
    points: [
      {
        time: breakTime,
        value: premium,
      },
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
      },
    ],
  };
};
