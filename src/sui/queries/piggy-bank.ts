"use server"
import { Difficulty } from "../../components/enums";
import { GameModel, PiggyBankContextModel } from "../models/openplay-piggy-bank";
import { DynamicObjectValue } from "../models/shared-models";
import { getSuiClient } from "../sui-client";


export const fetchGame = async (gameId: string): Promise<GameModel | undefined> => {
    const client = getSuiClient();
    const response = await client.getObject({
        id: gameId,
        options: {
            showContent: true
        }
    });
    if (response.data?.content?.dataType === "moveObject") {
        return response.data.content.fields as unknown as GameModel;
    }
    return undefined;
}

export const fetchGames = async (): Promise<Record<Difficulty, GameModel | undefined>> => {

    const gameIds: Record<Difficulty, string> = {
        [Difficulty.EASY]: import.meta.env.VITE_EASY_GAME_ID,
        [Difficulty.MEDIUM]: import.meta.env.VITE_MEDIUM_GAME_ID,
        [Difficulty.HARD]: import.meta.env.VITE_HARD_GAME_ID
    };

    const result: Record<Difficulty, GameModel | undefined> = {
        [Difficulty.EASY]: undefined,
        [Difficulty.MEDIUM]: undefined,
        [Difficulty.HARD]: undefined
    };

    for (const difficulty of Object.values(Difficulty)) {
        const gameId = gameIds[difficulty];
        const game = await fetchGame(gameId);
        if (game) {
            result[difficulty] = game;
        }
    }
    return result;
}

export const fetchContext = async (contextTableId: string, balanceManagerId: string): Promise<PiggyBankContextModel | undefined> => {
    const client = getSuiClient();
    // console.log(contextTableId);
    const response = await client.getDynamicFieldObject({
        parentId: contextTableId,
        name: {
            type: "0x2::object::ID",
            value: balanceManagerId
        }
    });

    if (response.data?.content?.dataType == "moveObject") {
        const value = response.data.content.fields as unknown as DynamicObjectValue<PiggyBankContextModel>;
        return value.value.fields;
    }

    return undefined;
};