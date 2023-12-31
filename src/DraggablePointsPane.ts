import {
  SingleValueData,
  ISeriesPrimitivePaneView,
  ISeriesApi,
  SeriesType,
  IChartApiBase,
  SeriesPrimitivePaneViewZOrder,
  ISeriesPrimitivePaneRenderer,
} from "lightweight-charts";
import { DragHandler } from "./DragHandler";

type IPointsType = SingleValueData<any>[];

export type IXYPoint = {
  x: number;
  y: number;
};

export type ILogicalPoint = {
  time: number;
  value: number;
}

export type IPointModel = IXYPoint & ILogicalPoint & {
  isHovered: boolean;
};

type IPossiblePoint = ILogicalPoint;

type IInternalPossiblePoint = IXYPoint & ILogicalPoint;

type IDataParams = {
  points: IPointsType;
  possiblePoints: IPossiblePoint[];
};

type IDraggablePointsPaneOptions = {
  onDragComplete?: (points: IPointModel[]) => void;
  onDragStart?: (nextPossiblePoint: IXYPoint & ILogicalPoint, dragPoint: IPointModel) => void;
  onDragMove?: (nextPossiblePoint: IXYPoint & ILogicalPoint, dragPoint: IPointModel) => void;
};

export class DraggablePointsPane implements ISeriesPrimitivePaneView {
  private _vicinityThreshold = 10;
  private _series: ISeriesApi<SeriesType, any>;
  private _chart: IChartApiBase<any>;
  private _points: IPointModel[] = [];
  private _hoverPoint: IPointModel | null = null;
  private _prevHoverPoint: IPointModel | null = null;
  private _draggablePoint: IPointModel | null = null;
  private _nextPossiblePoint: IInternalPossiblePoint | null = null;
  private _dragHandler: DragHandler;
  private _possiblePoints: IInternalPossiblePoint[] = [];
  private _options: IDraggablePointsPaneOptions = {};

  constructor({
    series,
    chart,
    options,
  }: {
    series: ISeriesApi<SeriesType, any>;
    chart: IChartApiBase<any>;
    options: IDraggablePointsPaneOptions;
  }) {
    this._series = series;
    this._chart = chart;
    this._dragHandler = new DragHandler(chart);
    this._dragHandler.onDragStart(this._handleDragEventsStart);
    this._dragHandler.onDrag(this._handleDragEvents);
    this._dragHandler.onDragComplete(this._handleDragCompete);
    this._dragHandler.onDragCancel(this._handleDragCancel);
    this._options = options;
  }

  detached() {
    this._dragHandler.disconnect();
  }

  zOrder(): SeriesPrimitivePaneViewZOrder {
    return "top";
  }

  renderer(): ISeriesPrimitivePaneRenderer | null {
    return {
      draw: (target) => {
        target.useMediaCoordinateSpace(({ context }) => {
          const ctx = context;
          for (const point of this._points) {
            if (point !== this._draggablePoint) {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "blue";
              ctx.fill();
            }

            if (point.isHovered) {
              if (this._draggablePoint === null) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                ctx.strokeStyle = "blue";
                ctx.stroke();
              }
            }
          }
          if (this._draggablePoint !== null) {
            for (const possiblePoint of this._possiblePoints) {
              ctx.beginPath();
              ctx.arc(possiblePoint.x, possiblePoint.y, 3, 0, 2 * Math.PI);
              ctx.fillStyle = "#aaaaaa";
              ctx.fill();
            }
          }
          if (this._nextPossiblePoint !== null) {
            ctx.beginPath();
            ctx.arc(
              this._nextPossiblePoint.x,
              this._nextPossiblePoint.y,
              5,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "green";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
              this._nextPossiblePoint.x,
              this._nextPossiblePoint.y,
              10,
              0,
              2 * Math.PI
            );
            ctx.strokeStyle = "green";
            ctx.stroke();
          }
        });
      },
    };
  }

  setData({ points, possiblePoints }: IDataParams) {
    this._points = points.map(this._mapPoint);
    this._possiblePoints = possiblePoints.map(this._mapPossiblePoint);
  }

  updatePoints() {
    this._points.forEach(this._updatePoint);
    this._possiblePoints.forEach(this._updatePossiblePoint);
  }

  recalcHover(x: number, y: number): boolean {
    const point = this._getPointInVicinity(x, y, this._points);
    return this._setNewHoverPoint(point);
  }

  private _getPointInVicinity<T extends { x: number; y: number }>(
    x: number,
    y: number,
    points: T[]
  ): T | null {
    return (
      points.find((p) => {
        return (
          Math.abs(p.x - x) < this._vicinityThreshold &&
          Math.abs(p.y - y) < this._vicinityThreshold
        );
      }) ?? null
    );
  }

  private _getNearestPoint<T extends { x: number; y: number }>(
    x: number,
    y: number,
    points: T[]
  ): T {
    return (
      points.reduce((prev, curr) => {
        return Math.hypot(curr.x - x, curr.y - y) <
          Math.hypot(prev.x - x, prev.y - y)
          ? curr
          : prev;
      })
    );
  }

  private _setNewHoverPoint(point: IPointModel | null): boolean {
    if (this._prevHoverPoint !== null) {
      this._prevHoverPoint.isHovered = false;
    }
    this._prevHoverPoint = this._hoverPoint;
    this._hoverPoint = point;
    if (this._hoverPoint !== null) {
      this._hoverPoint.isHovered = true;
    }
    return point !== null;
  }

  private _mapPoint = (point: IPointsType[0]): IPointModel => {
    return {
      x: this._chart
        .timeScale()
        .timeToCoordinate(point.time) as unknown as number,
      y: this._series.priceToCoordinate(point.value) as unknown as number,
      time: point.time,
      value: point.value,
      isHovered: false,
    };
  };

  private _updatePoint = (point: IPointModel) => {
    point.x = this._chart
      .timeScale()
      .timeToCoordinate(point.time) as unknown as number;
    point.y = this._series.priceToCoordinate(point.value) as unknown as number;
  };

  private _mapPossiblePoint = (
    point: IPossiblePoint
  ): IInternalPossiblePoint => {
    return {
      x: this._chart
        .timeScale()
        .timeToCoordinate(point.time) as unknown as number,
      y: this._series.priceToCoordinate(point.value) as unknown as number,
      time: point.time,
      value: point.value,
    };
  };

  private _updatePossiblePoint = (point: IInternalPossiblePoint) => {
    point.x = this._chart
      .timeScale()
      .timeToCoordinate(point.time) as unknown as number;
    point.y = this._series.priceToCoordinate(point.value) as unknown as number;
  };

  private _handleDragEventsStart = ({ x, y }: { x: number; y: number }) => {
    // find point in vicinity
    const point = this._getPointInVicinity(x, y, this._points);
    if (point === null) {
      return;
    }
    // stop pane of chart
    this._chart.applyOptions({
      handleScroll: {
        horzTouchDrag: false,
        vertTouchDrag: false,
        pressedMouseMove: false,
      },
    });
    // save drag point
    this._draggablePoint = point;
    this._nextPossiblePoint = point;
    // console.log('_handleDragEventsStart', point)
    this._options.onDragStart?.(this._nextPossiblePoint, this._draggablePoint);
  };

  private _handleDragEvents = ({ x, y }: { x: number; y: number }) => {
    if (this._draggablePoint == null) return;

    // find next possible position for point
    const nextPossiblePoint = this._getNearestPoint(x, y, this._possiblePoints);
    this._nextPossiblePoint = nextPossiblePoint;
    // console.log('_handleDragEvents', { x, y })
    this._options.onDragMove?.(nextPossiblePoint, this._draggablePoint);
  };

  private _handleDragCompete = () => {
    // console.log('_handleDragCompete', this._draggablePoint)
    if (this._draggablePoint === null) return;

    // change position of drag point to next possible position for point
    if (this._nextPossiblePoint !== null && this._draggablePoint !== null) {
      this._draggablePoint.x = this._nextPossiblePoint.x;
      this._draggablePoint.time = this._nextPossiblePoint.time;
      this._draggablePoint.y = this._nextPossiblePoint.y;
      this._draggablePoint.value = this._nextPossiblePoint.value;
      this._draggablePoint.isHovered = false;
    }

    // set drag point and next possible position to null
    this._nextPossiblePoint = null;
    this._draggablePoint = null;
    this._chart.applyOptions({
      handleScroll: {
        horzTouchDrag: true,
        vertTouchDrag: true,
        pressedMouseMove: true,
      },
    });
    this._options.onDragComplete?.(this._points);
  };

  private _handleDragCancel = () => {
    this._nextPossiblePoint = null;
    this._draggablePoint = null;
    this._chart.applyOptions({
      handleScroll: {
        horzTouchDrag: true,
        vertTouchDrag: true,
        pressedMouseMove: true,
      },
    });
  }
}
