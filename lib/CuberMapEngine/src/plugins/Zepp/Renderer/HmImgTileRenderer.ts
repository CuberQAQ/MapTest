import { log, px } from "@zos/utils";
import {
  IWidget,
  ImgTileLayer,
  WidgetImgTileRenderer,
} from "../../../core/LayerComponent/ImgTileLayer";
import { Coordinate } from "../../../core/MapEngine";
import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";

export type ImgPathLike = string;

export class HmImgTileWidget implements IWidget<ImgPathLike> {
  static deviceInfo = getDeviceInfo();
  static originPoint = {
    x: this.deviceInfo.width / 2,
    y: this.deviceInfo.height / 2,
  };
  _hmWidget: any;
  _tileSize: number = 256; //TODO
  constructor() {
    this._hmWidget = this._hmWidget = hmUI.createWidget(hmUI.widget.IMG, {
      x: px(0),
      y: px(0),
      src: "map/emptyTile.png",
    });
  }
  setResource(resource: string): void {
    // log.warn("setResource="+resource);
    setTimeout(() => this._hmWidget.setProperty(hmUI.prop.SRC, resource),2);
  }
  setRotation(rotation: number): void {
    // log.warn("setRotation="+rotation);
    // TODO
  }
  setCenterCoord(centerCoord: Coordinate): void {
    let prop = {
      x: HmImgTileWidget.originPoint.x + centerCoord.x - this._tileSize / 2,
      y: HmImgTileWidget.originPoint.y + centerCoord.y - this._tileSize / 2,
    };
    this._hmWidget.setProperty(hmUI.prop.MORE, prop);
  }
}

export class HmImgTileRenderer extends WidgetImgTileRenderer<ImgPathLike> {
  createWidget(): IWidget<string> {
    return new HmImgTileWidget();
  }
}
