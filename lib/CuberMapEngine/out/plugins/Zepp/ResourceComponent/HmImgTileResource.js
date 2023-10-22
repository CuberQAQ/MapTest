import { TransferFile } from "@cuberqaq/transfer-file";
import "../../../core/Utils/es6-promise";
export class HmSingleLoader {
    constructor() {
        this._transferFile = new TransferFile();
        this._inbox = this._transferFile.getInbox();
    }
    static getFileName(tileX, tileY, zoom) {
        return tileX + "," + tileY + "," + zoom + ".png";
    }
    isLoaded(tileX, tileY, zoom) {
        // return !!hmFS.statAssetsSync({
        //   path: path.join("map/", HmSingleLoader.getFileName(tileX, tileY, zoom)),
        // });
        return true;
    }
    load(tileX, tileY, zoom) {
        return new ES6Promise((resolve, reject) => {
            resolve("map/emptyTile.png");
        });
    }
    getLoaded(tileX, tileY, zoom) {
        return "map/emptyTile.png";
    }
}
