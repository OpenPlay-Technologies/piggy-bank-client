import { Types } from "phaser";
import { INIT_DATA_READY_EVENT } from "./constants";
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";
import { INIT_REQUEST, INIT_RESPONSE, isMessage } from "./openplay-connect/messages";
import { GameUIScene } from "./scenes/game-ui-scene";
// import { ZoomTestScene } from "./scenes/zoom-test";

const getGameConfig = (): Types.Core.GameConfig => {
    // const dpr = window.devicePixelRatio;
    const config: Types.Core.GameConfig = {
        type: Phaser.AUTO,
        // width: WIDTH,
        // height: HEIGHT,
        parent: 'game-container',
        backgroundColor: '#111111',
        scale: {
            mode: Phaser.Scale.NONE,
        },
        scene: [
            Boot,
            Preloader,
            Main,
            GameUIScene,
            // ZoomTestScene,
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
        render: {
            antialias: true,
            pixelArt: false,  // Set to true only if using pixel art
            roundPixels: false,  // Can cause its own issues with non-pixel art
            powerPreference: 'high-performance'
        }
    };

    return config;
}

// Create the game instance
let game: Phaser.Game | null = null;

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
                setupFullscreenHighDPIScaling(game);
                const context = game.canvas.getContext('2d');
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

// Custom fullscreen high DPI scaling implementation with TypeScript
const setupFullscreenHighDPIScaling = (game: Phaser.Game): (() => void) => {
    // Get the initial device pixel ratio
    // let currentDPR: number = window.devicePixelRatio || 1;

    // Reference to the canvas element
    const canvas: HTMLCanvasElement = game.canvas;

    // Function to update canvas dimensions to fill the screen
    const updateCanvasSize = (): void => {

        // Get the available screen dimensions
        const screenWidth: number = window.innerWidth;
        const screenHeight: number = window.innerHeight;

        // Get current device pixel ratio
        const dpr: number = window.devicePixelRatio || 1;

        const scaledWidth = Math.ceil(screenWidth * dpr);
        const scaledHeight = Math.ceil(screenHeight * dpr);

        // Set CSS size to fill the screen
        canvas.style.width = `${screenWidth}px`;
        canvas.style.height = `${screenHeight}px`;
        canvas.style.margin = '0';
        canvas.style.padding = '0';

        // Update internal canvas size for high DPI
        canvas.width = Math.ceil(screenWidth * dpr);
        canvas.height = Math.ceil(screenHeight * dpr);

        // Update game config dimensions
        if (game.scale) {
            // Force the game renderer to resize
            if (game.renderer) {
                (game.renderer).resize(canvas.width, canvas.height);
            }

            // // Update the game's internal size tracking
            // (game.config.width) = scaledWidth;
            // (game.config.height) = scaledHeight;

            // Force the scale manager to recognize the new size
            (game.scale).resize(scaledWidth, scaledHeight);
        }
    };

    // Apply initial sizing
    updateCanvasSize();

    // Event listeners for responsive scaling
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);

    // Return a function to remove event listeners when needed
    return (): void => {
        window.removeEventListener('resize', updateCanvasSize);
        window.removeEventListener('orientationchange', updateCanvasSize);
    };
};