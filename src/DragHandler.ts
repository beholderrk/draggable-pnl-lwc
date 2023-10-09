import { IChartApiBase, MouseEventParams } from "lightweight-charts";

export class DragHandler {
  private _chart: IChartApiBase<any>;
  private _externalDragHandler?: (param: MouseEventParams<any>) => void;
  private _externalDragStartHandler?: () => void;
  private _externalDragCompleteHandler?: () => void;

  constructor(chart: IChartApiBase<any>) {
    this._chart = chart;
    this._chart
      .chartElement()
      .addEventListener("pointerdown", this._onPointerDown);
    this._chart.chartElement().addEventListener("pointerup", this._onPointerUp);
  }

  onDragStart(dragStartHandler: () => void) {
    this._externalDragStartHandler = dragStartHandler;
  }

  onDrag(dragHandler: (param: MouseEventParams<any>) => void) {
    this._externalDragHandler = dragHandler;
  }

  onDragComplete(dragCompleteHandler: () => void) {
    this._externalDragCompleteHandler = dragCompleteHandler;
  }

  disconnect() {
    this._chart
      .chartElement()
      .removeEventListener("pointerdown", this._onPointerDown);
    this._chart
      .chartElement()
      .removeEventListener("pointerup", this._onPointerDown);
    this._chart.unsubscribeCrosshairMove(this._onPointerMove);
  }

  private _onPointerDown = () => {
    this._chart.subscribeCrosshairMove(this._onPointerMove);
    this._externalDragStartHandler?.();
  };

  private _onPointerUp = () => {
    this._chart.unsubscribeCrosshairMove(this._onPointerMove);
    this._externalDragCompleteHandler?.();
  };

  private _onPointerMove = (param: MouseEventParams<any>) => {
    this._externalDragHandler?.(param);
  };
}
