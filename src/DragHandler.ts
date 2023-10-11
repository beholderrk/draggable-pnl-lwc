import { IChartApiBase } from "lightweight-charts";


type IPointerPositionHandler = (param: { x: number; y: number }) => void;

export class DragHandler {
  private _chart: IChartApiBase<any>;
  private _externalDragHandler?: IPointerPositionHandler;
  private _externalDragStartHandler?: IPointerPositionHandler;
  private _externalDragCompleteHandler?: () => void;
  private _externalDragCancelHandler?: () => void;

  constructor(chart: IChartApiBase<any>) {
    this._chart = chart;
    this._chart
      .chartElement()
      .addEventListener("pointerdown", this._onPointerDown);
    this._chart.chartElement().addEventListener("pointerup", this._onPointerUp);
    this._chart.chartElement().addEventListener("pointercancel", this._onPointerCancel);
  }


  onDragStart(dragStartHandler: IPointerPositionHandler) {
    this._externalDragStartHandler = dragStartHandler;
  }

  onDrag(dragHandler: IPointerPositionHandler) {
    this._externalDragHandler = dragHandler;
  }

  onDragComplete(dragCompleteHandler: () => void) {
    this._externalDragCompleteHandler = dragCompleteHandler;
  }

  onDragCancel(dragCancelHandler: () => void) {
    this._externalDragCancelHandler = dragCancelHandler;
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
    this._externalDragStartHandler?.(this._getEventRelativePosition(ev));
  };

  private _onPointerUp = () => {
    this._chart
      .chartElement()
      .removeEventListener("pointermove", this._onPointerMove);
    this._externalDragCompleteHandler?.();
  };

  private _onPointerMove = (ev: PointerEvent) => {
    this._externalDragHandler?.(this._getEventRelativePosition(ev));
  };

  private _onPointerCancel = () => {
    this._externalDragCancelHandler?.();
  }

  private _getEventRelativePosition(ev: PointerEvent) {
    const element = this._chart.chartElement();
    const chartContainerBox = element.getBoundingClientRect();
    const priceScaleWidth = this._chart.priceScale("left").width();
    // const timeScaleHeight = this._chart.timeScale().height();
    const x = ev.clientX - chartContainerBox.x - priceScaleWidth;
    const y = ev.clientY - chartContainerBox.y;
    return {
      x,
      y
    }
  }
}
