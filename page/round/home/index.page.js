import * as hmUI from "@zos/ui";
import { log as Logger, log } from "@zos/utils";
import { DEVICE_HEIGHT, DEVICE_WIDTH, TEXT_STYLE } from "./index.style";
import { onGesture, GESTURE_UP } from "@zos/interaction";
import {
  ImgTileLayer,
  MapEngine,
  SingleLoaderITResource,
  ZPlugin,
  GisLib,
} from "@cuberqaq/cubermapengine";
import { setScrollLock } from "@zos/page";
import { BasePage } from "@zeppos/zml/base-page";
const logger = Logger.getLogger("helloworld");
Page(
  BasePage({
    getImgTile(info) {
      console.log("getImgTile...",info);
      return this.request({
        method: "AsukaMap.GetImgTile",
        params: { info: JSON.stringify(info) },
      });
    },
    onRequest() {},
    onCall() {},
    build() {
      logger.debug("page build invoked");
      // hmUI.createWidget(hmUI.widget.TEXT, {
      //   ...TEXT_STYLE,
      // });
      this.request({
        method: "AsukaMap.GetImgTile",
        params: { info1: "awa" },
      }).then(()=>{
        console.log("awa okk")
      }).catch((e)=>{
        console.log("awa err", e)

      })
      setScrollLock({ lock: true });

      onGesture({
        callback: (event) => {
          return true;
        },
      });
      // let transferFile = new TransferFile();
      // hmFS.writeFileSync({
      //   path: "maploader",
      //   data: JSON.stringify({ tileX: 3, tileY: 4, zoom: 3 }),
      //   options: { encoding: "utf8" },
      // });

      // transferFile
      //   .getOutbox()
      //   .enqueueFile("data://maploader")
      //   .on(
      //     "change",
      //     /**
      //      * @param {import("@cuberqaq/transfer-file").ChangeEvent} event
      //      */
      //     (event) => {
      //       if (event.data.readyState == "transferred") {
      //         log.warn("trans success!");
      //       } else if (event.data.readyState == "error") {
      //         log.warn("trans success!");
      //       }
      //     }
      //   );
      // let inbox = transferFile.getInbox();
      // inbox.on("FILE", () => {
      //   let fileObj = inbox.getNextFile();
      //   log.warn("receive new file:" + fileObj.filePath);
      //   let img = hmUI.createWidget(hmUI.widget.IMG, {
      //     x: 0,
      //     y: 0,
      //     src: "map/" + fileObj.fileName
      //   })
      // });
      // let centerCoord = GisLib.EarthCoord2WMTSZ24P(113.223999,23.076208)
      let centerCoord = { x: 2147483648, y: 2147483648 }; //GisLib.EarthCoord2WMTSZ24P(GisLib.DMS2D(false,116,23,17),GisLib.DMS2D(false,39,54,27))
      let mapEngine = new MapEngine({
        layers: [
          new ImgTileLayer({
            resourceId: "img_layer",
            emptyResource: "map/emptyTile.png",
            viewableSize: { width: 3, height: 3 },
            RendererType: ZPlugin.HmImgTileRenderer,
          }),
        ],
        resouces: {
          img_layer: new SingleLoaderITResource(
            new ZPlugin.HmTestSingleLoader((info) => this.getImgTile(info))
          ),
        },
        center: {
          x: centerCoord.x,
          y: centerCoord.y,
        },
        zoom: 8,
      });
      log.warn("mapEngine created!!,center=", centerCoord);
      mapEngine.init();
      mapEngine.setZoom(8);
      mapEngine.setCenterCoord(centerCoord.x, centerCoord.y);
      log.warn("MapEngine All done...");
      let touchLayer = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(0),
        y: px(0),
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        text: " ",
      });
      let zoomUpButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(170),
        y: px(15),
        w: px(60),
        h: px(60),
        radius: px(30),
        normal_color: 0x333333,
        press_color: 0x555555,
        text: "+",
        text_size: px(36),
        click_func: () => {
          mapEngine.setZoom(mapEngine._zoom + 1);
        },
      });
      let zoomDownButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(250),
        y: px(15),
        w: px(60),
        h: px(60),
        radius: px(30),
        normal_color: 0x333333,
        press_color: 0x555555,
        text: "-",
        text_size: px(50),
        click_func: () => {
          mapEngine.setZoom(mapEngine._zoom - 1);
        },
      });
      let clicked = {
        x: 0,
        y: 0,
      };
      touchLayer.addEventListener(hmUI.event.CLICK_DOWN, (event) => {
        clicked.x = event.x;
        clicked.y = event.y;
      });
      touchLayer.addEventListener(hmUI.event.MOVE, (event) => {
        mapEngine.setCenterCoord(
          mapEngine._centerCoord.x -
            ((event.x - clicked.x) << (24 - mapEngine._zoom)),
          mapEngine._centerCoord.y -
            ((event.y - clicked.y) << (24 - mapEngine._zoom))
        );
        clicked.x = event.x;
        clicked.y = event.y;
      });
    },
    onInit() {
      logger.debug("page onInit invoked");
    },

    onDestroy() {
      logger.debug("page onDestroy invoked");
    },
  })
);
