import { Socket } from "socket.io-client"

export type aviatorStateType = {
    token: string,
    socket: Socket | null,
    game_anim_status: gameAnimStatusType,
    dimension: dimensionType,
    auth: boolean,
    balance: number,
    autoPlayParams: {
        nOfRounds: number,
        stopIfarr: number[],
    }[],
    RemainedAutoPlayCount: number[],
}
export type betAutoStateType = "bet" | "auto"
export type dimensionType = {
    width: number,
    height: number
}
export type snackStateType = {
    open: boolean,
    msg: string
}

export type gameAnimStatusType = "ANIM_STARTED" | "ANIM_CRASHED" | "WAITING"
export type game_global_vars_type = {
    curPayout: number,
    allowedBet: boolean,
    id: number[],
    hash: string,
    betValue: string[],
    betPlaceStatus: betPlaceStatusType[],
    cashingStatus: cashingStatusType[]
    cashStarted: boolean[],
    pendingBet: boolean[],
    autoCashVal: string[],
    enabledAutoCashOut: boolean[],
    stake: {
        max: number,
        min: number
    }
}
export type betBoardAllItemType = {
    gameCrashId: number,
    username: string,
    betAmount: number,
    crashedAt?: number,
    cashout?: number,
}
export type betBoardMyItemType = {
    gameCrashId: number,
    date: string,
    betAmount: number,
    crashedAt?: number,
    cashout?: number,
}
export type betBoardTopItemType = {
    username: string,
    bet: string,
    win: string,
    cashout: string,
    roundId: number,
    date: string
}
export type betPlaceStatusType = "none" | "placing" | "success" | "failed"
export type cashingStatusType = "none" | "caching" | "success" | "failed"