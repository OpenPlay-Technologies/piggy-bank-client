import { Types } from "phaser";
import { HEIGHT, INIT_DATA_READY_EVENT, WIDTH } from "./constants";
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";
import { INIT_REQUEST, INIT_RESPONSE, isMessage } from "./openplay-connect/messages";
import { GameUIScene } from "./scenes/game-ui-scene";

const getGameConfig = (): Types.Core.GameConfig => {
    // const dpr = window.devicePixelRatio;
    const config: Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        parent: 'game-container',
        backgroundColor: '#111111',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [
            Boot,
            Preloader,
            Main,
            GameUIScene
        ],
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    x: 0,
                    y: 0
                },
                debug: false
            },
        },
        // antialias: true,
        // roundPixels: true,
        // mipmapFilter: "LINEAR_MIPMAP_LINEAR",
        // autoMobilePipeline: true,
    };

    return config;
}

// Create the game instance
var game: Phaser.Game | null = null;

// Listen for the init message
window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    if (!isMessage(data)) {
        return;
    }

    switch (data.type) {
        case INIT_REQUEST:
            if (game) {
                console.log("Init data already received");
                const responseData = {
                    type: INIT_RESPONSE,
                    isSuccessful: false,
                    errorMsg: "Init data already received",
                };
                window.parent.postMessage(responseData, '*');
                return;
            }
            else {
                console.log("Received init data:", data);
                const initData = {
                    balanceManagerId: data.balanceManagerId,
                    houseId: data.houseId,
                    playCapId: data.playCapId,
                    referralId: data.referralId,
                };
                game = new OpenPlayGame(getGameConfig(), initData);
                let context = game.canvas.getContext('2d');
                if (context) {
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                }
                game.events.emit(INIT_DATA_READY_EVENT);
                const responseData = {
                    type: INIT_RESPONSE,
                    isSuccessful: true,
                };
                window.parent.postMessage(responseData, '*');
                return;
            }
            break;
        default:
            // This case should never happen due to our type guard.
            break;
    }
});

// Remove this !! This is for testing purposes only
const initData = {
    type: INIT_REQUEST,
    balanceManagerId: import.meta.env.VITE_BALANCE_MANAGER_ID as string,
    houseId: import.meta.env.VITE_HOUSE_ID as string,
    playCapId: import.meta.env.VITE_PLAY_CAP_ID as string,
};

console.log("Sending init data:", initData);
window.postMessage(initData, '*');


interface InitData {
    balanceManagerId: string;
    houseId: string;
    playCapId: string;
    referralId?: string;
};

export class OpenPlayGame extends Phaser.Game {

    public initData: InitData | undefined;

    constructor(config: Phaser.Types.Core.GameConfig, initData: InitData) {
        super(config);
        this.initData = initData;
    }
}

// export default new OpenPlayGame(config);
