import { Game, Types } from "phaser";
import { HEIGHT, WIDTH } from "./constants";
import { getOrCreateKeypair } from "./utils/keypair"; // Import keypair functions
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";

// Generate or retrieve the keypair
const keypair = getOrCreateKeypair();
console.log("Loaded Keypair:", keypair.toSuiAddress());

// Get the network
console.log(import.meta.env.VITE_NETWORK)

// Listen for messages from the host
window.addEventListener('message', (event) => {

    // For testing, immediately send an acknowledgement back
    if (event.data.type === 'INIT') {
        console.log('Game received:', event.data);

        event.source?.postMessage(
            { type: 'ACK', payload: 'Hello from Game' },
        );
    }

    // Here you can implement your protocol for sending transaction bytes, etc.
});

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game-container',
    backgroundColor: '#028af8',
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
            debug: true
        },
    },
};

export default new Game(config);
