import { Types } from "phaser";
import { INIT_DATA_READY_EVENT } from "./constants";
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";
import { INIT_REQUEST, INIT_RESPONSE, isMessage } from "./openplay-connect/messages";
import { GameUIScene } from "./scenes/game-ui-scene";

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
                setupFullscreenHighDPIScaling(game);
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

// window.addEventListener('resize', () => {
//     const canvas = document.querySelector('canvas');
//     const dpi = window.devicePixelRatio || 1;
//     console.log("dpi", dpi);
//     if (canvas) {
//         // Update canvas CSS size
//         canvas.style.width = `${displayWidth}px`;
//         canvas.style.height = `${displayHeight}px`;

//         // Center the canvas if needed
//         canvas.style.marginLeft = `${Math.floor((parentWidth - displayWidth) / 2)}px`;
//         canvas.style.marginTop = `${Math.floor((parentHeight - displayHeight) / 2)}px`;
//     }
// });


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

// Custom fullscreen high DPI scaling implementation with TypeScript
const setupFullscreenHighDPIScaling = (game: Phaser.Game): (() => void) => {
    // Get the initial device pixel ratio
    // let currentDPR: number = window.devicePixelRatio || 1;

    // Reference to the canvas element
    const canvas: HTMLCanvasElement = game.canvas;

    // Get the parent element - in your case it's #game-container
    const parent: HTMLElement = document.getElementById('game-container') as HTMLElement;

    // Function to update canvas dimensions to fill the screen
    const updateCanvasSize = (): void => {
        // Make parent fill the viewport
        parent.style.width = '100vw';
        parent.style.height = '100vh';
        parent.style.margin = '0';
        parent.style.padding = '0';
        parent.style.overflow = 'hidden';

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
                (game.renderer as any).resize(canvas.width, canvas.height);
            }

            // Update the game's internal size tracking
            (game.config.width as any) = scaledWidth;
            (game.config.height as any) = scaledHeight;

            // Force the scale manager to recognize the new size
            (game.scale as any).resize(scaledWidth, scaledHeight);
        }

        // // Update all active cameras to match the new size
        // game.scene.scenes.forEach((scene: Phaser.Scene) => {
        //     if (scene.cameras && scene.cameras.main) {
        //         // Update camera bounds to match new screen size
        //         scene.cameras.main.setSize(screenWidth, screenHeight);

        //         // Apply DPI scaling to maintain sharpness
        //         if (dpr !== currentDPR) {
        //             // Apply scale factor based on DPI change
        //             scene.cameras.main.setZoom(scene.cameras.main.zoom * (dpr / currentDPR));
        //         }
        //     }
        // });

        // Store the current DPR
        // currentDPR = dpr;
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