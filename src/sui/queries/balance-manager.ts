"use server"
import { BalanceManagerModel } from "../models/openplay-core";
import { getSuiClient } from "../sui-client";

export const fetchBalanceManager = async (balanceManagerId: string): Promise<BalanceManagerModel | undefined> => {
    const client = getSuiClient();

    try {
        const response = await client.getObject({
            id: balanceManagerId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as BalanceManagerModel;
        }
    } catch (error) {
        console.error("Error fetching balance manager", error);
    }
    return undefined;
}
