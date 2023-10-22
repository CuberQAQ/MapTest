import {
  ChangeEvent,
  Inbox,
  Outbox,
  TransferFile,
} from "@cuberqaq/transfer-file";
import { ISingleLoader } from "../../../core/ResourceComponent/SingleLoaderITResource";
import { ImgPathLike } from "../Renderer/HmImgTileRenderer";
import path from "@cuberqaq/path-polyfill";
import * as hmFS from "@zos/fs";
import { log } from "@zos/utils";
import "../../../core/Utils/es6-promise";
import { Defer } from "../../../core/Utils/AsyncType";
import { Coordinate } from "../../../core/MapEngine";
declare const ES6Promise: PromiseConstructor;

export class HmTestSingleLoader implements ISingleLoader<ImgPathLike> {
  _transferFile: TransferFile;
  _inbox: Inbox;
  _outbox: Outbox;
  _defer: Defer<{
    resource: ImgPathLike;
    tileX: number;
    tileY: number;
    zoom: number; 
  }> | null = null;
  _loadingFileName: string | null = null;
  _loadingTile: { tileX: number; tileY: number; zoom: number } | null = null;
  constructor() {
    this._transferFile = new TransferFile();
    this._inbox = this._transferFile.getInbox();
    this._outbox = this._transferFile.getOutbox();
    this._inbox.on("FILE", () => {
      let fileObj = this._inbox.getNextFile();
      if (fileObj.fileName === this._loadingFileName)
        this._defer?.resolve?.({
          resource: this.getLoaded(
            this._loadingTile!.tileX,
            this._loadingTile!.tileY,
            this._loadingTile!.zoom
          ),
          tileX: this._loadingTile!.tileX,
          tileY: this._loadingTile!.tileY,
          zoom: this._loadingTile!.zoom,
        });
        this._defer = null;
    });
  }
  static getFileName(tileX: number, tileY: number, zoom: number) {
    return "tile" + tileX + "x" + tileY + "y" + zoom + "z.png";
  } 
  isLoaded(tileX: number, tileY: number, zoom: number): boolean {
    return !!hmFS.statAssetsSync({
      path: path.join(
        "map/",
        HmTestSingleLoader.getFileName(tileX, tileY, zoom)
      ),
    });
  }
  load(
    tileX: number,
    tileY: number,
    zoom: number
  ): Promise<{
    resource: string;
    tileX: number;
    tileY: number;
    zoom: number;
  }> {
    // log.warn("hm load tile:" + tileX + "," + tileY + "," + zoom);
    hmFS.writeFileSync({
      path: "maploader",
      data: JSON.stringify({ tileX, tileY, zoom }),
      options: { encoding: "utf8" },
    });
    this._loadingTile = { tileX, tileY, zoom };
    this._loadingFileName = HmTestSingleLoader.getFileName(tileX, tileY, zoom);
    // log.warn("hm load file step1")
    let task = this._outbox.enqueneFile("data://maploader");
    // log.warn("hm load file step2")
    this._defer = new Defer();
    task.on("change", (event: ChangeEvent) => {
      if (event.data.readyState === "error") {
        log.error(
          "Error when get " + HmTestSingleLoader.getFileName(tileX, tileY, zoom)
        );
        this._defer?.reject?.("unknown reason");
      }
    });
    return this._defer.promise;
  }
  getLoaded(tileX: number, tileY: number, zoom: number): string {
    return path.join(
      "map/",
      HmTestSingleLoader.getFileName(tileX, tileY, zoom)
    );
  }
}
