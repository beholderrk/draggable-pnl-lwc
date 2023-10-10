import {
  ISeriesPrimitive,
  PrimitiveHoveredItem,
  SeriesAttachedParameter,
  SeriesOptionsMap,
  SingleValueData
} from "lightweight-charts";
import { DraggablePointsPane } from "./DraggablePointsPane";
import { Delegate } from "./Delegate";

type IPointsType = SingleValueData<any>[];

export class DraggablePointsPrimitive implements ISeriesPrimitive {
  private _draggablePane: DraggablePointsPane | null = null;
  private _points: IPointsType = [];
  private _possiblePoints: IPointsType = [];
  private _requestUpdate?: () => void;
  private _dragCompleteDelegate = new Delegate();

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
      options: {
        onDragComplete: () => this._dragCompleteDelegate.fire(),
      }
    });
    this._draggablePane.setData({
      points: this._points,
      possiblePoints: this._possiblePoints,
    });
    // console.log("attached");
  }

  detached(): void {
    this._draggablePane?.detached();
    this._dragCompleteDelegate.destroy();
  }

  updateAllViews(): void {
    // console.log("updateAllViews");
    this._draggablePane?.updatePoints();
  }

  setData({ points, possiblePoints }: { points: IPointsType, possiblePoints: IPointsType }) {
    this._points = points;
    this._possiblePoints = possiblePoints;
    if (this._draggablePane) {
      this._draggablePane.setData({
        points,
        possiblePoints,
      });
      this._requestUpdate?.();
    }
  }

  hitTest(x: number, y: number): PrimitiveHoveredItem | null {
    // console.log("hitTest");
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

  subscribeDragComplete(cb: () => void) {
    this._dragCompleteDelegate.subscribe(this, cb);
  }
}


