import {createSuiClient, GasStationClient} from "@shinami/clients/sui";

export const getSuiClient = () => {
    const shinamiKey = import .meta.env.VITE_SHINAMI_NODE_KEY;
    if (!shinamiKey){
        throw new Error("SHINAMI_NODE_KEY is not set");
    }

    return createSuiClient(shinamiKey);
}

export const getGasStationClient = () => {
    const shinamiKey = import .meta.env.VITE_SHINAMI_GAS_KEY;
    if (!shinamiKey){
        throw new Error("SHINAMI_GAS_KEY is not set");
    }
    return new GasStationClient(shinamiKey);
}