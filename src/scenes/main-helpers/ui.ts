import { GameUI } from "../../components/game-ui";
import { WIDTH, HEIGHT } from "../../constants";
import { Main } from "../main-scene";


export default function setupUi(scene: Main) {
    scene.gameUI = new GameUI(scene, WIDTH / 2, HEIGHT);
    scene.scene.add('GameUI', scene.gameUI, true);
}