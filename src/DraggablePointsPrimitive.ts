import {
  IChartApiBase,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  PrimitiveHoveredItem,
  SeriesAttachedParameter,
  SeriesDataItemTypeMap,
  SeriesOptionsMap,
  SeriesPrimitivePaneViewZOrder,
  SeriesType,
  SingleValueData,
  Time,
} from "lightweight-charts";
import { DragHandler } from "./DragHandler";

type IPointsType = SingleValueData<any>[];

export class DraggablePointsPrimitive implements ISeriesPrimitive {
  private _draggablePane: DraggablePointsPane | null = null;
  private _points: IPointsType = [];
  private _requestUpdate?: () => void;

  constructor() {}

  paneViews() {
    return this._draggablePane ? [this._draggablePane] : [];
  }

  attached({
    chart,
    series,
    requestUpdate,
  }: SeriesAttachedParameter<any, keyof SeriesOptionsMap>): void {
    this._requestUpdate = requestUpdate;
    this._draggablePane = new DraggablePointsPane({
      series,
      chart,
    });
    this._draggablePane.setData(this._points);
    console.log("attached");
  }

  detached(): void {
    this._draggablePane?.detached();
  }

  updateAllViews(): void {
    console.log("updateAllViews");
    this._draggablePane?.updatePoints();
  }

  setData(points: IPointsType) {
    this._points = points;
    if (this._draggablePane) {
      this._draggablePane.setData(points);
      this._requestUpdate?.();
    }
  }

  hitTest(x: number, y: number): PrimitiveHoveredItem | null {
    console.log("hitTest");
    if (this._draggablePane === null) return null;
    if (this._draggablePane.recalcHover(x, y)) {
      return {
        zOrder: "top",
        cursorStyle: "move",
        externalId: "draggable-points",
      };
    }
    return null;
  }
}

type IPointModel = {
  x: number;
  y: number;
  time: number;
  value: number;
  isHovered: boolean;
};

class DraggablePointsPane implements ISeriesPrimitivePaneView {
  private _vicinityThreshold = 10;
  private _series: ISeriesApi<SeriesType, any>;
  private _chart: IChartApiBase<any>;
  private _points: IPointModel[] = [];
  private _hoverPoint: IPointModel | null = null;
  private _prevHoverPoint: IPointModel | null = null;
  private _dragHandler: DragHandler;

  constructor({
    series,
    chart,
  }: {
    series: ISeriesApi<SeriesType, any>;
    chart: IChartApiBase<any>;
  }) {
    this._series = series;
    this._chart = chart;
    this._dragHandler = new DragHandler(chart);
    this._dragHandler.onDrag(this._handleDragEvents);
    this._dragHandler.onDragComplete(this._handleDragCompete);
    // this._chart.chartElement().addEventListener('pointerdown', this.onPointerDown);
    // this._chart.chartElement().addEventListener('pointerup', this.onPointerUp);
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
        target.useBitmapCoordinateSpace(({ context }) => {
          const ctx = context;
          for (const point of this._points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();

            if (point.isHovered) {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
              ctx.strokeStyle = "blue";
              ctx.stroke();
            }
          }
        });
      },
    };
  }

  setData(points: IPointsType) {
    this._points = points.map(this._mapPoint);
  }

  updatePoints() {
    this._points.forEach(this._updatePoint);
  }

  recalcHover(x: number, y: number): boolean {
    const point = this._getPointInVicinity(x, y);
    return this._setNewHoverPoint(point);
  }

  private _getPointInVicinity(x: number, y: number): IPointModel | null {
    return (
      this._points.find((p) => {
        return (
          Math.abs(p.x - x) < this._vicinityThreshold &&
          Math.abs(p.y - y) < this._vicinityThreshold
        );
      }) ?? null
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

  private _handleDragEventsStart = () => {
    /**
     * save drag point from hover
     */
  };

  private _handleDragEvents = () => {
    /**
     * find next possible position for point
     * save next possible position
     * fire render dash line and circle for next possible position
     */
  };

  private _handleDragCompete = () => {
    /**
     * change position of drag point to next possible position for point
     * set drag point to null
     *
     */
  };
}
