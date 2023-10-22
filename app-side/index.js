import { transferFile, _parseHmPath } from "@cuberqaq/transfer-file-side";
import * as cbFS from "@cuberqaq/fs-side";
import { network } from "@cuberqaq/network-side";
import { image } from "@cuberqaq/image-side";
function getFileName(tileX, tileY, zoom) {
  return "tile" + tileX + "x" + tileY + "y" + zoom + "z.png";
}
AppSideService({
  onInit() {
    console.log("app side service invoke onInit");
    let inbox = transferFile.getInbox();
    let outbox = transferFile.getOutbox();
    cbFS._mkdir("/assets/map");
    inbox.on("FILE", () => {
      let fileObj = inbox.getNextFile();
      // let buf = new ArrayBuffer(fileObj.fileSize);
      // // console.warn(
      // //   "Receive file",
      // //   fileObj,
      // //   cbFS.readSync({
      // //     fd: cbFS.openSync({ path: _parseHmPath(fileObj.filePath).path }),
      // //     buffer: buf,
      // //   }),
      // //   buf,
      // //   cbFS.readFileSync({ path: "maploader", options: { encoding: "utf8" } })
      // // );

      if (fileObj.filePath === "data://maploader") {
        let loadInfo = JSON.parse(
          cbFS.readFileSync({
            path: _parseHmPath(fileObj.filePath).path,
            options: { encoding: "utf8" },
          })
        );
        let loadFileName = getFileName(
          loadInfo.tileX,
          loadInfo.tileY,
          loadInfo.zoom
        );
        console.warn("Pending to download Tile:", loadInfo);
        if(false){
          let downloadTask = network.downloader.downloadFile({
            url: `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${loadInfo.zoom}&TILEROW=${loadInfo.tileY}&TILECOL=${loadInfo.tileX}&tk=7a4866131a483b65961af674d665908d`,
            filePath: "assets://map/" + loadFileName,
          });
          downloadTask.onSuccess = async (event) => {
            console.warn("Download tile success!", event);
            await image.convert({
              filePath: "assets://map/" + loadFileName,
              targetFilePath: "assets://map/" + loadFileName,
            });
            console.warn("convert success!");
            outbox.enqueneFile("assets://map/" + loadFileName).on(
              "change",
              /**
               *
               * @param {import("@cuberqaq/transfer-file-side").ChangeEvent} event
               */
              (event) => {
                if (event.data.readyState === "transferring") {
                  cbFS.rmSync({
                    path: "assets://map/" + xian,
                  });
                }
              }
            );
          };
          downloadTask.onFail = (event) => {
            console.error("Download Failed!", event);
          };
        }
        else {
          let downloadVecTask = network.downloader.downloadFile({
            url: `http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${loadInfo.zoom}&TILEROW=${loadInfo.tileY}&TILECOL=${loadInfo.tileX}&tk=7a4866131a483b65961af674d665908d`,
            filePath: "assets://map/" + "vec" + loadFileName,
          });
          downloadVecTask.onSuccess = async (event) => {
            console.warn("Download Vec Tile success!", event);
            let downloadCvaTask = network.downloader.downloadFile({
              url: `http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${loadInfo.zoom}&TILEROW=${loadInfo.tileY}&TILECOL=${loadInfo.tileX}&tk=7a4866131a483b65961af674d665908d`,
              filePath: "assets://map/" + "cva" + loadFileName,
            });
            downloadCvaTask.onSuccess = async (event) => {
              console.warn("Download Cva Tile success!", event);
              await image._composite({
                filePath: "assets://map/" + "vec" + loadFileName,
                srcFilePath: "assets://map/" + "cva" + loadFileName,
                targetFilePath: "assets://map/" + loadFileName,
              });
              console.warn("composite success!");
              outbox.enqueneFile("assets://map/" + loadFileName).on(
                "change",
                /**
                 *
                 * @param {import("@cuberqaq/transfer-file-side").ChangeEvent} event
                 */
                (event) => {
                  if (event.data.readyState === "transferring") {
                    cbFS.rmSync({
                      path: "assets://map/" + "vec" + loadFileName,
                    }); 
                    cbFS.rmSync({
                      path: "assets://map/" + "cva" + loadFileName,
                    }); 
                    cbFS.rmSync({
                      path: "assets://map/" + loadFileName,
                    }); 
                  }
                }
              );
            };
            downloadCvaTask.onFail = (event) => {
              console.error("Download Failed!", event);
            };

            // await image.convert({
            //   filePath: "assets://map/" + loadFileName,
            //   targetFilePath: "assets://map/" + loadFileName,
            // });
            // console.warn("convert success!");
            // outbox.enqueneFile("assets://map/" + loadFileName).on(
            //   "change",
            //   /**
            //    *
            //    * @param {import("@cuberqaq/transfer-file-side").ChangeEvent} event
            //    */
            //   (event) => {
            //     if (event.data.readyState === "transferring") {
            //       cbFS.rmSync({
            //         path: "assets://map/" + xian,
            //       }); 
            //     }
            //   }
            // );
          };
          downloadVecTask.onFail = (event) => {
            console.error("Download Failed!", event);
          };
        } 
      }
    });
  },
  onRun() {
    console.log("app side service invoke onRun");
  },
  onDestroy() {
    console.log("app side service invoke onDestroy");
  },
});
