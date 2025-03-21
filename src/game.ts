import { Game, Types } from "phaser";
import { HEIGHT, WIDTH } from "./constants";
import { Boot } from "./scenes/boot-scene";
import { Main } from "./scenes/main-scene";
import { Preloader } from "./scenes/pre-loader-scene";

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

export default new Game(config);
