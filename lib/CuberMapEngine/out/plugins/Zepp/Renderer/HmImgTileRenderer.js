var _a;
import { px } from "@zos/utils";
import { WidgetImgTileRenderer, } from "../../../core/LayerComponent/ImgTileLayer";
import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
export class HmImgTileWidget {
    constructor() {
        this._tileSize = 256; //TODO
        this._hmWidget = this._hmWidget = hmUI.createWidget(hmUI.widget.IMG, {
            x: px(0),
            y: px(0),
            src: "map/emptyTile.png",
        });
    }
    setResource(resource) {
        // log.warn("setResource="+resource);
        setTimeout(() => this._hmWidget.setProperty(hmUI.prop.SRC, resource), 2);
    }
    setRotation(rotation) {
        // log.warn("setRotation="+rotation);
        // TODO
    }
    setCenterCoord(centerCoord) {
        let prop = {
            x: _a.originPoint.x + centerCoord.x - this._tileSize / 2,
            y: _a.originPoint.y + centerCoord.y - this._tileSize / 2,
        };
        this._hmWidget.setProperty(hmUI.prop.MORE, prop);
    }
}
_a = HmImgTileWidget;
HmImgTileWidget.deviceInfo = getDeviceInfo();
HmImgTileWidget.originPoint = {
    x: _a.deviceInfo.width / 2,
    y: _a.deviceInfo.height / 2,
};
export class HmImgTileRenderer extends WidgetImgTileRenderer {
    createWidget() {
        return new HmImgTileWidget();
    }
}
