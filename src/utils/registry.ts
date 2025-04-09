import { Difficulty } from "../components/enums";
import { CONTEXT_MAP_DATA, DIFFICULTY_DATA, GAME_MAP_DATA } from "../constants";
import { GameModel, PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";


export function getCurrentDifficulty(registry: Phaser.Data.DataManager): Difficulty | undefined {
    const difficulty = registry.get(DIFFICULTY_DATA);
    if (difficulty) {
        return difficulty as Difficulty;
    }
    return undefined;
}

export function getContextForDifficulty(registry: Phaser.Data.DataManager, difficulty: Difficulty): PiggyBankContextModel | undefined {
    const contextMap: Record<Difficulty, PiggyBankContextModel | undefined> = registry.get(CONTEXT_MAP_DATA);
    if (contextMap) {
        return contextMap[difficulty];
    }
    return undefined;
}

export function getGameDataForDifficulty(registry: Phaser.Data.DataManager, difficulty: Difficulty): GameModel | undefined {
    const gameDataMap = registry.get(GAME_MAP_DATA);
    if (gameDataMap) {
        return gameDataMap[difficulty];
    }
    return undefined;
}

export function getContextMap(registry: Phaser.Data.DataManager): Record<Difficulty, PiggyBankContextModel | undefined> {
    const contextMap = registry.get(CONTEXT_MAP_DATA);
    if (contextMap) {
        return contextMap as Record<Difficulty, PiggyBankContextModel | undefined>;
    }
    return {
        [Difficulty.EASY]: undefined,
        [Difficulty.MEDIUM]: undefined,
        [Difficulty.HARD]: undefined
    };
}

export function getCurrentGameData(registry: Phaser.Data.DataManager): GameModel | undefined {
    const currentDifficulty = getCurrentDifficulty(registry);
    if (!currentDifficulty) {
        return undefined;
    }
    return getGameDataForDifficulty(registry, currentDifficulty);

}