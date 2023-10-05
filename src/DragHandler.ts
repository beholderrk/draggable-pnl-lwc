import { IChartApiBase } from "lightweight-charts";

export class DragHandler {
  private _chart: IChartApiBase<any>;
  private _externalDragHandler?: () => void;
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

  onDrag(dragHandler: () => void) {
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
    this._chart
      .chartElement()
      .removeEventListener("pointermove", this._onPointerMove);
  }

  private _onPointerDown = (ev: PointerEvent) => {
    this._chart
      .chartElement()
      .addEventListener("pointermove", this._onPointerMove);
    this._externalDragStartHandler?.();
  };

  private _onPointerUp = (ev: PointerEvent) => {
    this._chart
      .chartElement()
      .removeEventListener("pointermove", this._onPointerMove);
    this._externalDragCompleteHandler();
  };

  private _onPointerMove = (ev: PointerEvent) => {
    this._externalDragHandler?.();
  };
}
