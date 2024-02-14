import { ImgTileResource } from "../ResourceComponent/ImgTileResource";
import { CancellablePromise } from "../Utils/AsyncType";
import { DataType } from "../Utils/DataType";
import { GisLib } from "../Utils/GisLib";
import { log } from "@zos/utils";
const pow2 = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216, 33554432, 67108864, 134217728, 268435456, 536870912, 1013741824, 2147483648, 4294967296];
export class ImgTileLayer {
    constructor({ resourceId, emptyResource, viewableSize = { width: 3, height: 3 }, RendererType, }) {
        this._parent = null;
        this._resourceComponent = null;
        this._centerCoord = null; // WMTS-Z24P
        this._zoom = 3;
        this._tileSize = 256; // TODO
        this._rendererMatrix = null;
        this._resourceId = resourceId;
        this._emptyResource = emptyResource;
        this._RendererType = RendererType;
        this._viewableSize = viewableSize;
        this._loadQuene = Array(this._viewableSize.width * this._viewableSize.height);
        let centerX = ~~(this._viewableSize.width / 2);
        let centerY = ~~(this._viewableSize.height / 2);
        let maxRadius = this._viewableSize.width >= this._viewableSize.height
            ? ~~(this._viewableSize.width / 2) + 1
            : ~~(this._viewableSize.height / 2) + 1;
        let p = 0, colorMap = Array(this._viewableSize.height * this._viewableSize.width).fill(false);
        for (let r = 1; r <= maxRadius; ++r) {
            for (let xi = centerX - r + 1; xi < centerX + r; ++xi)
                for (let yi = centerY - r + 1; yi < centerY + r; ++yi) {
                    if (xi >= 0 &&
                        xi < this._viewableSize.width &&
                        yi >= 0 &&
                        yi < this._viewableSize.height &&
                        !colorMap[yi * this._viewableSize.width + xi]) {
                        this._loadQuene[p++] = [xi, yi, xi - centerX, yi - centerY];
                        colorMap[yi * this._viewableSize.width + xi] = true;
                    }
                }
        }
        let str = "loadQuene=";
        for (let i = 0; i < this._viewableSize.height * this._viewableSize.width; ++i) {
            str += `${JSON.stringify(this._loadQuene[i])} `;
        }
        log.warn(str);
    }
    setParent(parent) {
        this._parent = parent;
        let resource = parent.getResourceComponent(this._resourceId);
        this._zoom = parent._zoom;
        if (resource instanceof ImgTileResource)
            this._resourceComponent = resource;
        else
            throw TypeError("Resource is not instanceof ImgTileResource");
    }
    init() {
        // Init Renderer
        let rendererCount = this._viewableSize.width * this._viewableSize.height, rendererList = Array(rendererCount);
        for (let i = 0; i < rendererCount; ++i) {
            rendererList[i] = new this._RendererType(this, this._tileSize);
        }
        this._rendererMatrix = new DataType.TileReuseMatrix(this._viewableSize.width, this._viewableSize.height, rendererList);
    }
    setZoom(zoom) {
        var _a;
        if (~~zoom != this._zoom) {
            this._zoom = ~~zoom;
            (_a = this._rendererMatrix) === null || _a === void 0 ? void 0 : _a.fillIfReuse(false);
            this._render();
        }
    }
    /**
     * WMTS-Z24P
     * @param x
     * @param y
     */
    setCenterCoord(x, y) {
        var _a;
        this._centerCoord = { x, y };
        let centerTileInfo = GisLib.getExtendedTileIndex256(x, y, this._zoom);
        (_a = this._rendererMatrix) === null || _a === void 0 ? void 0 : _a.setCenter(centerTileInfo.tileX, centerTileInfo.tileY);
        this._render(centerTileInfo);
    }
    _render(centerTileInfo = this._centerCoord != null
        ? GisLib.getExtendedTileIndex256(this._centerCoord.x, this._centerCoord.y, this._zoom)
        : null) {
        var _a, _b, _c, _d, _e;
        if (centerTileInfo === null)
            throw TypeError("centerTileInfo is null");
        let centerTileCoord = {
            x: this._tileSize / 2 - centerTileInfo.pixelX,
            y: this._tileSize / 2 - centerTileInfo.pixelY,
        };
        // for (
        //   let xi = 0, dxi = xi - ~~(this._viewableSize.width / 2);
        //   xi < this._viewableSize.width;
        //   ++xi, dxi = xi - ~~(this._viewableSize.width / 2)
        // )
        //   for (
        //     let yi = 0, dyi = yi - ~~(this._viewableSize.height / 2);
        //     yi < this._viewableSize.width;
        //     ++yi, dyi = yi - ~~(this._viewableSize.height / 2)
        //   )
        let len = this._viewableSize.height * this._viewableSize.width;
        for (let i = 0; i < len; ++i) {
            let [xi, yi, dxi, dyi] = this._loadQuene[i];
            let resource = null;
            if (!((_a = this._rendererMatrix) === null || _a === void 0 ? void 0 : _a.getIfReuse(xi, yi))) {
                resource =
                    (_c = (_b = this._resourceComponent) === null || _b === void 0 ? void 0 : _b.getResource((centerTileInfo.tileX + dxi), centerTileInfo.tileY + dyi, this._zoom)) !== null && _c !== void 0 ? _c : null;
                (_d = this._rendererMatrix) === null || _d === void 0 ? void 0 : _d.dealed(xi, yi);
            }
            let emptyRes = resource instanceof CancellablePromise
                ? this._emptyResource instanceof Function // TODO when ResourceType is Function, may disturb
                    ? this._emptyResource({
                        tileX: centerTileInfo.tileX + dxi,
                        tileY: centerTileInfo.tileY + dyi,
                        zoom: centerTileInfo.zoom,
                    })
                    : this._emptyResource
                : undefined;
            (_e = this._rendererMatrix) === null || _e === void 0 ? void 0 : _e.get(xi, yi).setTile({
                x: centerTileCoord.x + dxi * this._tileSize,
                y: centerTileCoord.y + dyi * this._tileSize,
            }, 0, // TODO
            resource, emptyRes);
        }
    }
}
export class ImgTileRenderer {
    constructor(parent, tileSize) {
        this._parent = parent;
        this._tileSize = tileSize;
    }
}
export class WidgetImgTileRenderer extends ImgTileRenderer {
    constructor(parent, tileSize) {
        super(parent, tileSize);
        this._centerCoord = null;
        this._rotation = 0;
        this._unresolvedPromise = null;
        this._widget = this.createWidget();
    }
    setTile(centerCoord, rotation, resource, emptyResource) {
        if (!this._centerCoord ||
            centerCoord.x != this._centerCoord.x ||
            centerCoord.y != this._centerCoord.y) {
            this._centerCoord = centerCoord;
            this._widget.setCenterCoord(this._centerCoord);
        }
        if (this._rotation != rotation) {
            this._rotation = rotation;
            this._widget.setRotation(rotation);
        }
        if (resource !== null) {
            if (this._unresolvedPromise) {
                this._unresolvedPromise.cancel(); // TODO test
                this._unresolvedPromise = null;
            }
            if (resource instanceof CancellablePromise) {
                this._unresolvedPromise = resource;
                resource
                    .then((resource) => {
                    this._widget.setResource(resource);
                })
                    .finally(() => {
                    this._unresolvedPromise = null;
                });
                if (emptyResource === undefined) {
                    throw TypeError("When resource is a promise, emptyResource shouldn't be undefined");
                }
                this._widget.setResource(emptyResource);
            }
            else {
                this._widget.setResource(resource);
            }
        }
    }
}
