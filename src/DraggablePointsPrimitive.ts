import {
  ISeriesPrimitive,
  PrimitiveHoveredItem,
  SeriesAttachedParameter,
  SeriesOptionsMap,
  SingleValueData,
} from "lightweight-charts";
import {
  DraggablePointsPane,
  ILogicalPoint,
  IPointModel,
  IXYPoint,
} from "./DraggablePointsPane";
import { Delegate } from "./Delegate";

type IPointsType = SingleValueData<any>[];

export class DraggablePointsPrimitive implements ISeriesPrimitive {
  private _draggablePane: DraggablePointsPane | null = null;
  private _points: IPointsType = [];
  private _possiblePoints: IPointsType = [];
  private _requestUpdate?: () => void;
  private _dragCompleteDelegate = new Delegate();
  private _dragStartDelegate = new Delegate();
  private _dragMoveDelegate = new Delegate();

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
        onDragComplete: (points: IPointModel[]) =>
          this._dragCompleteDelegate.fire(points),
        onDragStart: (
          nextPossiblePoint: IXYPoint & ILogicalPoint,
          dragPoint: IPointModel
        ) => this._dragStartDelegate.fire(nextPossiblePoint, dragPoint),
        onDragMove: (
          nextPossiblePoint: IXYPoint & ILogicalPoint,
          dragPoint: IPointModel
        ) => this._dragMoveDelegate.fire(nextPossiblePoint, dragPoint),
      },
    });
    this._draggablePane.setData({
      points: this._points,
      possiblePoints: this._possiblePoints,
    });
  }

  detached(): void {
    this._draggablePane?.detached();
    this._dragCompleteDelegate.destroy();
    this._dragStartDelegate.destroy();
  }

  updateAllViews(): void {
    // console.log("updateAllViews");
    this._draggablePane?.updatePoints();
  }

  setData({
    points,
    possiblePoints,
  }: {
    points: IPointsType;
    possiblePoints: IPointsType;
  }) {
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

  subscribeDragComplete(cb: (points: IPointModel[]) => void) {
    this._dragCompleteDelegate.subscribe(this, cb);
  }

  subscribeDragStart(
    cb: (nextPossiblePoint: IXYPoint & ILogicalPoint, dragPoint: IPointModel) => void
  ) {
    this._dragStartDelegate.subscribe(this, cb);
  }

  subscribeDragMove(
    cb: (nextPossiblePoint: IXYPoint & ILogicalPoint, dragPoint: IPointModel) => void
  ) {
    this._dragMoveDelegate.subscribe(this, cb);
  }
}
