import { Types } from "phaser";
import { HEIGHT, INIT_DATA_READY_EVENT, WIDTH } from "./constants";
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";
import { INIT_REQUEST, INIT_RESPONSE, isMessage } from "./openplay-connect/messages";

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game-container',
    backgroundColor: '#111111',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        Main
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
};

interface InitData {
    balanceManagerId: string;
    houseId: string;
    playCapId: string;
    referralId?: string;
};

export class OpenPlayGame extends Phaser.Game {

    public initData: InitData | undefined;

    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
        // Listen for the init message
        window.parent.addEventListener('message', (event: MessageEvent) => {
            const data = event.data;
            if (!isMessage(data)) {
                return;
            }

            switch (data.type) {
                case INIT_REQUEST:
                    if (this.initData) {
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
                        this.initData = {
                            balanceManagerId: data.balanceManagerId,
                            houseId: data.houseId,
                            playCapId: data.playCapId,
                            referralId: data.referralId,
                        };
                        this.events.emit(INIT_DATA_READY_EVENT);
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
    }
}

export default new OpenPlayGame(config);
