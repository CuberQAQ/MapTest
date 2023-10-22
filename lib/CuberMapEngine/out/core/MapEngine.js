export class MapEngine {
  constructor({ layers, resouces, center, zoom = 3 }) {
    this._layerList = [...layers];
    this._resourceMap = Object.assign({}, resouces);
    this._layerList.forEach((layer) => layer.setParent(this));
    this._centerCoord = Object.assign({}, center);
    this._zoom = zoom;
  }
  init() {
    for (let layer of this._layerList) {
      layer.init();
      this.setCenterCoord(this._centerCoord.x, this._centerCoord.y);
    }
  }
  getResourceComponent(id) {
    return this._resourceMap[id];
  }
  setCenterCoord(x, y) {
    this._centerCoord = { x, y };
    if (y < 0) y = 0;
    if (y > 4_294_967_296) y = 4_294_967_296
    for (let layer of this._layerList) {
      layer.setCenterCoord(x, y);
    }
  }
  setZoom(zoom) {
    this._zoom = zoom;
    for (let layer of this._layerList) {
      layer.setZoom(zoom);
    }
  }
  setRotation(degree) {
    // this._zoom = zoom
    // for (let layer of this._layerList) {
    //   layer.se(zoom);
    // }
  }
}
