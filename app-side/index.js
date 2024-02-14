// import { transferFile, _parseHmPath } from "@cuberqaq/transfer-file-side";
// globalThis.transferFile = transferFile
// import * as cbFS from "@cuberqaq/fs-side";
// import { network } from "@cuberqaq/network-side";
// import { image as image2 } from "@cuberqaq/image-side";
import { BaseSideService } from "@zeppos/zml/base-side";
function getFileName(tileX, tileY, zoom) {
  return "tile" + tileX + "x" + tileY + "y" + zoom + "z.png";
}
var inbox, outbox;
AppSideService(
  BaseSideService({
    onRequest(req, res) {
      console.warn("666");
      if (req.method === "AsukaMap.GetImgTile") {
        let loadInfo = JSON.parse(req.params.info);
        let loadFileName = getFileName(
          loadInfo.tileX,
          loadInfo.tileY,
          loadInfo.zoom
        );
        console.warn("Pending to download Tile:", loadInfo);
        if (false) {
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
            outbox.enqueueFile("assets://map/" + loadFileName).on(
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
        } else {
          let downloadVecTask = network.downloader.downloadFile({
            url: `http://a897331063.eicp.net:14514/imgtile?zoom=${loadInfo.zoom}&tileX=${loadInfo.tileX}&tileY=${loadInfo.tileY}`,
            filePath: "assets://map/" + loadFileName,
          });
          res(null, "okkkkkk");
          downloadVecTask.onSuccess = async (event) => {
            console.warn("Download success!", event);
            // outbox.fenqueueFile("assets://map/" + loadFileName);
            // .on(
            //     "change",
            //     /**
            //      *
            //      * @param {import("@cuberqaq/transfer-file-side").ChangeEvent} event
            //      */
            //     (event) => {
            //       if (event.data.readyState === "transferring") {
            //         cbFS.rmSync({
            //           path: "assets://map/" + "vec" + loadFileName,
            //         });
            //         cbFS.rmSync({
            //           path: "assets://map/" + "cva" + loadFileName,
            //         });
            //         cbFS.rmSync({
            //           path: "assets://map/" + loadFileName,
            //         });
            //       }
            //     }
            //   );

            await image.convert({
              filePath: "assets://map/" + loadFileName,
              targetFilePath: "assets://map/" + loadFileName,
            });
            console.warn("convert success!");
            outbox.enqueueFile("assets://map/" + loadFileName);
            // .on(
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
      res("awa error");
    },
    onCall() {},
    onInit() {
      console.warn("app side service invoke onInit");
      let downloadVecTask = network.downloader.downloadFile({
        url: `http://a897331063.eicp.net:14514/imgtile?zoom=${10}&tileX=${114}&tileY=${514}`,
        filePath: "assets://map/" + "test.png",
      });
      downloadVecTask.onSuccess = async (event) => {
        console.warn("test:Download success!", event);
      };
      downloadVecTask.onFail = async (res) => {
        console.error("test:Download Failed!", res);
      };
      inbox = transferFile.getInbox();
      outbox = transferFile.getOutbox();
      // cbFS._mkdir("/assets/map");
      // inbox.on("FILE", () => {
      //   let fileObj = inbox.getNextFile();
      //   // let buf = new ArrayBuffer(fileObj.fileSize);
      //   // // console.warn(
      //   // //   "Receive file",
      //   // //   fileObj,
      //   // //   cbFS.readSync({
      //   // //     fd: cbFS.openSync({ path: _parseHmPath(fileObj.filePath).path }),
      //   // //     buffer: buf,
      //   // //   }),
      //   // //   buf,
      //   // //   cbFS.readFileSync({ path: "maploader", options: { encoding: "utf8" } })
      //   // // );

      // });
    },
    onRun() {
      console.warn("app side service invoke onRun");
    },
    onDestroy() {
      console.warn("app side service invoke onDestroy");
    },
  })
);
