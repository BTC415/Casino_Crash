import { ChangeEvent, useEffect, useRef, useState } from 'react'
import BetAutoSwitch from './BetAutoSwitch'
// import { useSnackbar } from 'notistack';
import { betAutoStateType, betBoardAllItemType, betBoardMyItemType, betPlaceStatusType, cashingStatusType, dimensionType } from '../../@types'
import PIXIComponent from '../pixicomp'
import { useAviator } from '../../store/aviator'
import axios, { AxiosError } from 'axios'
import { Game_Global_Vars, doDelay, getHistoryItemColor, initBet6, playSound, setStateTemplate, showToast, webpORpng } from '../../utils'
import SnackBar from '../SnackBar'
import SwitchButton from '../SwitchButton'
import AutoBetModal from '../AutoBetModal'
import BetBoard from './BetBoard'
import CustomSnackBar from '../CustomSnackBar';
const GameBoard = ({ bet6 }: { bet6: string[] }) => {
    const { aviatorState, setAviatorState } = useAviator()
    const [autoPlayingIndex, setAutoPlayingIndex] = useState(0)
    const [snackState, setSnackState] = useState({
        open: false,
        msg: ""
    });
    const [modalAutoPlayOpen, modalAutoPlaySetOpen] = useState(false);
    const [rotate, setRotate] = useState(0)



    const [trigParachute, setTrigParachute] = useState({ uniqId: 0, isMe: true })

    const [crashHistory, setCrashHistory] = useState<string[]>([])
    const [crashAnim, setCrashAnim] = useState<boolean>(false)
    const [crashColor, setCrashColor] = useState<string[]>([])
    const [pixiDimension, setPixiDimension] = useState<dimensionType>({ width: 0, height: 400 })
    const pixi_ref = useRef<HTMLDivElement>(null)
    const footer_ref = useRef<HTMLDivElement>(null)

    const [betButtonCount, setBetButtonCount] = useState(2)
    const [curPayout, setCurPayout] = useState(0)

    const [pendingBet, setPendingBet] = useState<boolean[]>([false, false])
    const [allowedBet, setAllowedBet] = useState(false)
    const [betAutoState, setBetAutoState] = useState<betAutoStateType[]>(["bet", "bet"])
    const [betValue, setBetValue] = useState<string[]>([initBet6[0], initBet6[0]])
    const [cashedWin, setCashedWin] = useState<number[]>([0, 0])
    const [enabledAutoCashOut, setEnabledAutoCashOut] = useState<boolean[]>([false, false])
    const [autoCashVal, setAutoCashVal] = useState<string[]>(["1.45", "1.45"])
    const [betPlaceStatus, setBetPlaceStatus] = useState<betPlaceStatusType[]>(["none", "none"])
    const [cashingStatus, setCashingStatus] = useState<cashingStatusType[]>(["none", "none"])
    const [betBoardAllItem, setBetBoardAllItem] = useState<betBoardAllItemType[]>([])
    const [betBoardMyItem, setBetBoardMyItem] = useState<betBoardMyItemType[]>([])


    const [cashes, setCashes] = useState<{ payout: number, win: number }[]>([])
    // const { enqueueSnackbar } = useSnackbar();
    const _setBetValue = (val: string | ((prev: string) => string), i: number) => {
        if (typeof val === "string") {
            Game_Global_Vars.betValue[i] = val
            setBetValue(prev => {
                const new_val = [...prev]
                new_val[i] = val
                return new_val
            })
        } else {
            setBetValue(prev => {
                const new_val = [...prev]
                new_val[i] = val(prev[i])
                Game_Global_Vars.betValue = new_val
                return new_val
            })
        }
    }
    const _setBetPlaceStatus = (val: betPlaceStatusType | betPlaceStatusType[], i: number) => {
        // setBetPlaceStatus(prev => {
        //     const new_val = [...prev]
        //     new_val[i] = val
        //     return new_val
        // })
        if (typeof val === "object") {
            Game_Global_Vars.betPlaceStatus = val
            setBetPlaceStatus(val)
        } else {
            Game_Global_Vars.betPlaceStatus[i] = val
            setBetPlaceStatus(setStateTemplate(val, i))
        }
    }
    const _setCashingStatus = (val: cashingStatusType, i: number) => {
        Game_Global_Vars.cashingStatus[i] = val
        setCashingStatus(setStateTemplate(val, i))
    }
    const _setPendingBet = (val: boolean | boolean[], i: number) => {
        if (typeof val === "boolean") {
            setPendingBet(setStateTemplate(val, i))
        } else {
            setPendingBet(val)
        }
    }
    const _setEnabledAutoCashOut = (val: boolean, i: number) => {
        setEnabledAutoCashOut(setStateTemplate(val, i))
    }
    const _setAutoCashVal = (val: string, i: number) => {
        setAutoCashVal(setStateTemplate(val, i))
    }
    const _setCashedWin = (val: number, i: number) => {
        setCashedWin(setStateTemplate(val, i))
    }

    const cancelAutoPlay = (i: number) => {
        setAviatorState(prev => {
            const v = prev.RemainedAutoPlayCount
            v[i] = 0
            return { ...prev, RemainedAutoPlayCount: v }
        })
    }
    const handleBetValueChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
        if (e.target.value.endsWith('.')) {
            _setBetValue(e.target.value, i)
        } else {
            _setBetValue(Math.max(10, (Math.round(parseFloat(e.target.value) * 100) / 100)).toString(), i)
        }
    }
    const modifyBetValue = (amount: number, i: number) => {
        _setBetValue(prev => {
            const new_val = parseInt(prev)
            return `${Math.max(new_val + amount, 10)}`
        }, i)
    }

    const doBet = async (i: number) => {
        if (!Game_Global_Vars.allowedBet) return
        _setBetPlaceStatus("placing", i)
        Game_Global_Vars.cashStarted[i] = false
        _setCashingStatus("none", i)
        if ((Game_Global_Vars.betPlaceStatus[0] === "placing" && i === 1) ||
            (Game_Global_Vars.betPlaceStatus[1] === "placing" && i === 0)) {
            await doDelay(1000)
        }
        const status = await placeBet(i)
        // setAviatorState(prev => ({ ...prev, balance: prev.balance - parseFloat(betValue) }))
        _setBetPlaceStatus(status ? "success" : "none", i)
    }
    const handleBet = async (i: number) => {
        if (Game_Global_Vars.allowedBet) {
            await doBet(i)
        } else {
            _setPendingBet(true, i); Game_Global_Vars.pendingBet[i] = true
        }

    }
    const cancelBet = async (i: number) => {
        if (Game_Global_Vars.pendingBet[i]) {
            _setPendingBet(false, i); Game_Global_Vars.pendingBet[i] = false
        } else {
            const { data: { status, balance, message } }: { data: { status: boolean, balance: number, message: string } } = await axios.post('/api/games/crash/play/cancel-bet', {
                gameID: Game_Global_Vars.id[i]
            })
            if (status) {
                _setBetPlaceStatus("none", i)
                setAviatorState(prev => ({ ...prev, balance }))
            } else {
                showToast(message)
            }
        }
        if (aviatorState.RemainedAutoPlayCount[i] > 0) {
            cancelAutoPlay(i)
        }
    }

    useEffect(() => {
        setCrashColor(crashHistory.map(item => getHistoryItemColor(item)))
    }, [crashHistory])
    const handleCashOut = async (i: number, auto?: boolean) => {
        if (Game_Global_Vars.cashStarted[i]) return
        Game_Global_Vars.cashStarted[i] = true
        _setCashingStatus("caching", i)
        await aviatorState.socket?.emit(auto ? "auto-cashout" : "cashout", `crash-round-${Game_Global_Vars.id[i]}`);
    }
    const handleResize = () => {
        const width = Math.min(aviatorState.dimension.width, pixi_ref.current?.clientWidth || 0)
        const height = Math.max(150, window.innerHeight - (footer_ref.current?.clientHeight || 0) - 150 - (width > 1392 ? 0 : 10))
        setPixiDimension({ width, height })
        setAviatorState(prev => {
            const new_width = prev.dimension.width;
            const new_height = new_width * height / width
            return {
                ...prev,
                dimension: {
                    width: new_width,
                    height: new_height
                }
            }
        })
    }
    useEffect(() => {
        if (crashHistory.length === 0) {
            axios.post('/api/crash/play/recent-rec').then((data) => {
                setCrashHistory(data.data.data.map((v: any) => `${parseFloat(v.max_payout).toFixed(2)}x`))
            }).catch(e=>console.error(e))
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        setInterval(() => setRotate(prev => prev + 10), 100)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    const placeBet: (i: number) => Promise<boolean> = async (i: number) => {
        try {
            const {
                data: {
                    game,
                    message,
                    status
                }
            }: {
                data: {
                    game?: {
                        id: number,
                        pf_game: { hash: string },
                        account: { balance: number }
                    },
                    message?: string,
                    status: boolean
                }
            } =
                await axios.post('/api/games/crash/play/bet-place', {
                    hash: Game_Global_Vars.hash,
                    bet: parseFloat(Game_Global_Vars.betValue[i]),
                    auto_cashout: Game_Global_Vars.enabledAutoCashOut[i] ? parseFloat(Game_Global_Vars.autoCashVal[i]) : undefined
                })
            if (status) {
                Game_Global_Vars.id[i] = game?.id || 0
                Game_Global_Vars.hash = game?.pf_game.hash || ""
                setAviatorState(prev => ({ ...prev, balance: game?.account.balance || 0 }))
                if ((aviatorState.autoPlayParams[i].stopIfarr[0] > 0 && (game?.account.balance || 0) < aviatorState.autoPlayParams[i].stopIfarr[0]) ||
                    (aviatorState.autoPlayParams[i].stopIfarr[1] > 0 && (game?.account.balance || 0) > aviatorState.autoPlayParams[i].stopIfarr[1])) {
                    setAviatorState(prev => {
                        const v = prev.RemainedAutoPlayCount
                        v[i] = 0
                        return { ...prev, RemainedAutoPlayCount: v }
                    })
                }
            } else {
                showToast(message || "Oops! Please try again.")
            }
            return status
        } catch (e: any) {
            // setAviatorState(prev => ({ ...prev, auth: false }))
            console.log(e)
            showToast(((e as AxiosError)?.response?.data as any)?.message || "Oops! Please try again.")
        }

        return false
    }
    useEffect(() => {
        if (aviatorState.RemainedAutoPlayCount[0] > 0) {
            handleBet(0)
        }
    }, [aviatorState.RemainedAutoPlayCount[0]])
    useEffect(() => {
        if (aviatorState.RemainedAutoPlayCount[1] > 0) {
            handleBet(1)
        }
    }, [aviatorState.RemainedAutoPlayCount[1]])
    useEffect(() => {
        const socket = aviatorState.socket
        if (!socket) return
        function sendHeartbeat() {
            try {
                socket?.emit("heartbeat", { "message": "heartbeat" })
            } catch (ex) {
                console.log(ex);
            }
            setTimeout(function () { sendHeartbeat(); }, 10000);
        }
        sendHeartbeat()
        try {

            // await socket.emit("join", `crash-round-${Game_Global_Vars.id}`);

            socket.on("message", async ({ message, update }: { message: string, update: number }) => {
                try {
                    if (message === "GAME_START") {
                        setAllowedBet(false); Game_Global_Vars.allowedBet = false
                        _setPendingBet([false, false], 0); Game_Global_Vars.pendingBet = [false, false]
                        setAviatorState(prev => ({ ...prev, game_anim_status: "ANIM_STARTED" }))
                        playSound("take")
                    } else if (message === "GAME_STOP") {
                        setTrigParachute({ uniqId: 0, isMe: true })
                        setCrashHistory(prev => ([`${Game_Global_Vars.curPayout}x`, ...prev]))
                        setCrashAnim(true); setTimeout(() => {
                            setCrashAnim(false)
                        }, 1000);

                        setAviatorState(prev => ({ ...prev, game_anim_status: "ANIM_CRASHED" }))
                        _setBetPlaceStatus(["none", "none"], 0)
                        playSound("flew")
                        // socket.removeAllListeners("message")
                        setTimeout(() => {
                            setAviatorState(prev => ({ ...prev, game_anim_status: "WAITING" }))
                        }, 3000);
                        setTimeout(() => {
                            if (Game_Global_Vars.id[0] > 0) {
                                axios.post(`/api/games/crash/${Game_Global_Vars.id[0]}/complete`)
                            }
                            if (Game_Global_Vars.id[1] > 0) {
                                axios.post(`/api/games/crash/${Game_Global_Vars.id[1]}/complete`)
                            }
                        }, 1000);
                        setAviatorState(prev => {
                            const new_auto_count = prev.RemainedAutoPlayCount
                            if (new_auto_count[0] > 0) {
                                if (!Game_Global_Vars.pendingBet[0]) {
                                    new_auto_count[0]--
                                }
                            }
                            if (new_auto_count[1] > 0) {
                                if (!Game_Global_Vars.pendingBet[1]) {
                                    new_auto_count[1]--
                                }
                            }
                            return { ...prev, RemainedAutoPlayCount: new_auto_count }
                        })
                    } else if (message === "GAME_ALLOW_BET") {
                        setTimeout(async () => {
                            Game_Global_Vars.id = [0, 0]
                            setBetBoardAllItem([])
                            setAllowedBet(true); Game_Global_Vars.allowedBet = true
                            if (Game_Global_Vars.pendingBet[0]) {
                                await doBet(0)
                            }
                            if (Game_Global_Vars.pendingBet[1]) {
                                await doBet(1)
                            }
                            _setPendingBet([false, false], 0); Game_Global_Vars.pendingBet = [false, false]
                        }, 2000);
                    } else if (message === "PAYOUT_STATUS_UPDATE") {
                        if (Game_Global_Vars.enabledAutoCashOut[0] && update >= parseFloat(Game_Global_Vars.autoCashVal[0])) {
                            await handleCashOut(0, true)
                        }
                        if (Game_Global_Vars.enabledAutoCashOut[1] && update >= parseFloat(Game_Global_Vars.autoCashVal[1])) {
                            await handleCashOut(1, true)
                        }
                        setCurPayout(update)
                        Game_Global_Vars.curPayout = update
                    } else if (message?.startsWith("INVALID_CASHOUT")) {
                        const roundId = parseInt(message.substring("INVALID_CASHOUT".length + 1))
                        _setCashingStatus("failed", Game_Global_Vars.id.indexOf(roundId))
                    } else if (message?.startsWith("CASHOUT") || message?.startsWith("AUTO_CASHOUT")) {
                        const roundId = parseInt(message.substring((message?.startsWith("CASHOUT") ? "CASHOUT" : "AUTO_CASHOUT").length + 1))
                        const roundIdIndex = Game_Global_Vars.id.indexOf(roundId)
                        if ((Game_Global_Vars.cashingStatus[0] === "caching" && roundIdIndex === 1) ||
                            (Game_Global_Vars.cashingStatus[1] === "caching" && roundIdIndex === 0)) {
                            await doDelay(1000)
                        }
                        const { data: { win } }: { data: { win: number } } = await axios.post(`/api/games/crash/${Game_Global_Vars.id[roundIdIndex]}/cash-out`)
                        if (win) {
                            setAviatorState(prev => {
                                const new_auto = prev.RemainedAutoPlayCount
                                if ((aviatorState.autoPlayParams[roundIdIndex].stopIfarr[2] > 0 && win > aviatorState.autoPlayParams[roundIdIndex].stopIfarr[2])) {
                                    new_auto[roundIdIndex] = 0
                                }
                                return {
                                    ...prev,
                                    balance: prev.balance + win,
                                    RemainedAutoPlayCount: new_auto
                                }
                            })
                            _setCashedWin(win, roundIdIndex)
                            // setSnackState({ open: true, msg: `Cashed out ${win} successfully.` })//!TODO
                            // enqueueSnackbar(`Cashed out ${win} successfully.`, {
                            //     variant: 'success' as VariantType,
                            //     anchorOrigin: {
                            //         vertical: "top",
                            //         horizontal: "center"
                            //     },

                            // });
                            // showToast(`Cashed out ${win} successfully.`, "info")
                            playSound("win")
                        }
                        _setCashingStatus("success", roundIdIndex)
                        _setBetPlaceStatus("none", roundIdIndex)
                        setAviatorState(prev => {
                            const new_auto_count = prev.RemainedAutoPlayCount
                            new_auto_count[roundIdIndex] = new_auto_count[roundIdIndex] > 0 ? new_auto_count[roundIdIndex] - 1 : 0
                            return { ...prev, RemainedAutoPlayCount: new_auto_count }
                        })
                    }

                } catch (e: any) {
                    // setAviatorState(prev => ({ ...prev, auth: false }))
                    console.log(e)
                    showToast(((e as AxiosError)?.response?.data as any)?.message || "Oops! Please try again.")
                }

            })
            socket.on("INCOMING_BET", async ({ username, betAmount, gameCrashId, gameId }: { username: string, betAmount: number, gameCrashId: number, gameId: number }) => {
                setBetBoardAllItem(prev => ([{ username, betAmount, gameCrashId }, ...prev]))
                setTimeout(() => {
                    if (Game_Global_Vars.id[0] === gameId || Game_Global_Vars.id[1] === gameId) {
                        setBetBoardMyItem(prev => ([{ date: (new Date()).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), betAmount, gameCrashId: gameCrashId }, ...prev]))
                    }
                }, 500);
            })
            socket.on("INCOMING_CANCEL_BET", async ({ username, betAmount, gameCrashId, gameId }: { username: string, betAmount: number, gameCrashId: number, gameId: number }) => {
                setBetBoardAllItem(prev => prev.filter(item => item.gameCrashId !== gameCrashId))
                if (Game_Global_Vars.id[0] === gameId || Game_Global_Vars.id[1] === gameId) {
                    setBetBoardMyItem(prev => prev.filter(item => item.gameCrashId !== gameCrashId))
                    const gameIdIndex = Game_Global_Vars.id.indexOf(gameId)
                    Game_Global_Vars.id[gameIdIndex] = 0
                }
            })
            socket.on("INCOMING_CASH_OUT", async ({ username, betAmount, gameCrashId, gameId, crashed_at: crashedAt, cashout }: { username: string, betAmount: number, gameCrashId: number, gameId: number, crashed_at: number, cashout: number }) => {
                setBetBoardAllItem(prev => prev.map(item => {
                    if (item.gameCrashId === gameCrashId)
                        return { username, betAmount, gameCrashId, crashedAt, cashout }
                    else return item
                }))
                if (Game_Global_Vars.id[0] === gameId || Game_Global_Vars.id[1] === gameId) {
                    setCashes(prev => ([...prev, { payout: crashedAt, win: cashout }]))
                    setBetBoardMyItem(prev => prev.map(item => {
                        if (item.gameCrashId === gameCrashId)
                            return { date: item.date, betAmount, gameCrashId, crashedAt, cashout }
                        else return item
                    }))
                    setTrigParachute(v => ({ uniqId: v.uniqId + 1, isMe: true }))
                } else {
                    setTrigParachute(v => ({ uniqId: v.uniqId + 1, isMe: false }))
                }
            })
        } catch (e: any) {
            // setAviatorState(prev => ({ ...prev, auth: false }))
            console.log(e)
            showToast(((e as AxiosError)?.response?.data as any)?.message || "Oops! Please try again.")
        }
    }, [])


    return (
        // style={{background:"radial-gradient(circle, rgba(86, 0, 152, 1) 0%, rgba(41, 0, 73, 1)"}}
        <div className='flex overflow-auto' style={{ height: "calc(100vh - 50px)" }}>
            {/* <div className=' bg-[#1C1C1C] text-white relative'>
                <TopLogoBar loaded={t} setSettingModalOpen={setSettingModalOpen} setHistoryModalOpen={setHistoryModalOpen} setRuleModalOpen={setRuleModalOpen} />
            </div> */}
            <CustomSnackBar cashes={cashes} setCashes={setCashes} />
            <div className="w-[460px] hidden lg:block h-full">
                <BetBoard data={{ betBoardAllItem, betBoardMyItem }} />
            </div>
            <div className="flex flex-col gap-2 w-full bg-black p-2 text-white overflow-auto pb-0">

                <div className='flex justify-between items-center'>
                    <div className='score-bomb flex gap-x-2 w-full flex-wrap pr-4 h-[26px] overflow-y-hidden'>
                        {
                            crashHistory.map((item, i) =>
                                <span key={i} style={{ color: crashColor[i] }} className={`${i === 0 && crashAnim ? "animate-pinRight" : ""} block px-3 py-1 rounded-full bg-gray-900 font-bold text-[11px] 3xl:text-[15px]`}>{item}</span>)
                        }
                    </div>
                </div>
                <div className={`flex justify-center w-full relative`} style={{ height: pixiDimension.height }} ref={pixi_ref}>
                    <div className='flex flex-col gap-10 absolute top-0 justify-center items-center'
                        style={{
                            height: pixiDimension.height,
                            display: aviatorState.game_anim_status !== "ANIM_STARTED" ? "flex" : "none",
                            gap: pixiDimension.height < 200 ? 2 : 40
                        }}>
                        <div style={{ display: aviatorState.game_anim_status === "WAITING" ? "block" : "none", width: Math.min(pixiDimension.width, pixiDimension.height) / 4 }}>
                            <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/propeller.${webpORpng}`} style={{ rotate: `${rotate}deg` }} alt="propeller" />
                        </div>
                        <div className='flex flex-col justify-center items-center px-4 py-2 lg:px-8 lg:py-2 bg-black/70 border-dashed border border-[#E59407] rounded-lg'>
                            <p className='text-[#E59407] uppercase font-bold text-[21px] lg:text-[30px]'>
                                {
                                    aviatorState.game_anim_status === "ANIM_CRASHED" ?
                                        "Flew away" :
                                        "PLACE YOUR BET"
                                }
                            </p>
                            {
                                aviatorState.game_anim_status === "ANIM_CRASHED" &&
                                <p className='text-white font-bold text-[42px] leading-[42px] lg:text-[100px] lg:leading-[100px]'>{curPayout}x</p>
                            }
                        </div>
                    </div>
                    <PIXIComponent pixiDimension={pixiDimension} curPayout={curPayout} trigParachute={trigParachute} />
                </div>
                <div className="flex flex-col w-full" ref={footer_ref}>
                    {/* <div className='flex justify-center gap-3 w-full'>
                        <GameSettingButton onClick={() => setRuleModalOpen(true)} href='#svg-info' title='Game Rules' />
                        <GameSettingButton onClick={() => setSettingModalOpen(true)} href='#svg-setting' title='Game Settings' />
                        <GameSettingButton onClick={() => setHistoryModalOpen(true)} href='#svg-wallet' title={`${aviatorState.balance.toLocaleString('en-US', { style: 'currency', currency: 'INR' }).substring(1)}`} />
                    </div> */}
                    <div className={`grid grid-cols-1 gap-2 relative ${betButtonCount === 1 ? "" : "lg:grid-cols-2"}`}>
                        <button
                            onClick={() => {
                                setBetButtonCount(prev => (prev === 1 ? 2 : 1))
                                setTimeout(handleResize, 500);
                            }}
                            disabled={betPlaceStatus[1] === "success" || pendingBet[1]}
                            className={`absolute right-1 top-1 rounded-full bg-black w-6 h-6 pb-[2px] flex justify-center items-center text-lg cursor-pointer disabled:opacity-30`}>
                            {betButtonCount === 1 ?
                                <span>+</span> :
                                <span className='text-xs'>&#8212;</span>}
                        </button>
                        {
                            [0, 1].map((item, i) =>
                                <div key={i} className={`flex flex-col justify-start items-center gap-1 lg:gap-4 w-full rounded-lg bg-gradient-to-b from-[#1C1C1C] to-black p-4 pb-0 ${betPlaceStatus[i] === "success" || pendingBet[i] ?
                                    allowedBet || pendingBet[i] ? "border border-red-700" : "border border-orange-500" : ""} ${i === 1 && betButtonCount === 1 ? "hidden" : ""}`}>

                                    <BetAutoSwitch disabled={aviatorState.RemainedAutoPlayCount[i] > 0} betAuto={{
                                        betAutoState: betAutoState[i], setBetAutoState: (val: betAutoStateType) => setBetAutoState(prev => {
                                            const new_state = [...prev]
                                            new_state[i] = val
                                            return new_state
                                        })
                                    }} />
                                    <div className='flex gap-2'>
                                        <div className='flex flex-col w-[100px] lg:w-[130px] 3xl:w-[260px] h-full'>
                                            <div className='flex justify-between items-center text-[10px] 3xl:text-xl w-full h-[27px] 3xl:h-[54px] bg-black rounded-full px-2' style={{ fontFamily: 'Roboto' }}>
                                                <button disabled={betPlaceStatus[i] === "success" || pendingBet[i]} onClick={() => modifyBetValue(-10, i)} className='flex justify-center items-center w-[16px] h-[16px] 3xl:w-[36px] 3xl:h-[36px]  text-white rounded-full border-2 border-white'>
                                                    <div className='w-2/3 h-1/6 bg-white' />
                                                </button>
                                                <input disabled={betPlaceStatus[i] === "success" || pendingBet[i]} onChange={(e) => handleBetValueChange(e, i)} value={betValue[i]} type="string" className='w-[30px] lg:w-[70px] 3xl:w-[150px] bg-black text-center text-[13px] 3xl:text-[26px]' />
                                                <button disabled={betPlaceStatus[i] === "success" || pendingBet[i]} onClick={() => modifyBetValue(10, i)} className='flex relative justify-center items-center w-[16px] h-[16px] 3xl:w-[36px] 3xl:h-[36px] text-white rounded-full border-2 border-white'>
                                                    <div className='w-2/3 h-1/6 bg-white' />
                                                    <div className='absolute top-[2px] h-2/3 w-1/6 bg-white' />
                                                </button>
                                            </div>
                                            <div className='flex flex-wrap justify-between gap-1 w-full h-[40px] 3xl:h-[78px]'>
                                                {
                                                    bet6.map((item, j) =>
                                                        <button disabled={betPlaceStatus[i] === "success" || pendingBet[i]} key={j} onClick={() => _setBetValue(`${item}`, i)} className='flex justify-center items-center bg-[#171717] rounded-lg gap-[2px] w-[28px] lg:w-[40px] h-[17px] 3xl:w-20 3xl:h-9 text-[13px] 3xl:text-[26px]'>
                                                            {item}
                                                        </button>
                                                    )
                                                }

                                            </div>
                                        </div>
                                        {
                                            betPlaceStatus[i] === "success" || pendingBet[i] ?
                                                allowedBet || pendingBet[i] ?
                                                    <div className='flex flex-col justify-center items-center text-xs w-[100px] lg:w-[160px] 3xl:w-[395px]'>
                                                        {pendingBet[i] && <p className='uppercase w-full text-center'>Waiting for next round</p>}
                                                        <button onClick={() => cancelBet(i)} className={`flex flex-col w-full ${pendingBet[i] ? "h-[42px]" : "h-[72px]"} 3xl:h-[142px] rounded-[14px] 3xl:rounded-[30px] bg-red-700 border border-red-400  justify-center items-center font-bold hover:opacity-80`}>Cancel</button>
                                                    </div> :
                                                    <button onClick={() => handleCashOut(i, false)} className='flex flex-col w-[100px] lg:w-[160px] h-[72px] 3xl:w-[395px] 3xl:h-[142px] rounded-[14px] 3xl:rounded-[30px] bg-gradient-to-b from-[#E59407] to-[#412900]  justify-center items-center font-bold border border-[#FFB432]/50 hover:opacity-80'>
                                                        <h4 className='text-[16px] 3xl:text-[42px] leading-[20px] 3xl:leading-[42px] uppercase'>
                                                            {cashingStatus[i] === "none" ?
                                                                "Cash Out" :
                                                                cashingStatus[i] === "caching" ?
                                                                    "Cashing Out..." :
                                                                    cashingStatus[i] === "success" ?
                                                                        `Cashed ${cashedWin[i]}` : "Failed"}
                                                        </h4>
                                                        {
                                                            cashingStatus[i] === "none" && <h4 className='text-[20px]'>
                                                                {(curPayout * parseFloat(betValue[i])).toFixed(2)}
                                                            </h4>
                                                        }
                                                    </button> :
                                                < button onClick={() => handleBet(i)} disabled={betPlaceStatus[i] !== "none"} className={`disabled:opacity-30 flex flex-col min-w-[120px] lg:min-w-[160px] h-[72px] 3xl:w-[395px] 3xl:h-[142px] rounded-[14px] 3xl:rounded-[30px] bg-gradient-to-b from-[#E59407] to-[#412900]  justify-center items-center font-bold border border-[#FFB432]/50 hover:opacity-80`}>
                                                    <h4 className='text-[16px] 3xl:text-[42px] leading-[20px] 3xl:leading-[42px] uppercase'>Bet</h4>
                                                    <h4 className='text-[20px]'>
                                                        {betValue[i]}
                                                    </h4>
                                                </button>
                                        }
                                    </div>
                                    {betAutoState[i] === "auto" ?
                                        <div className='flex justify-between gap-2 items-center min-w-[300px]'>
                                            <button
                                                // disabled={
                                                //     aviatorState.RemainedAutoPlayCount === -1 &&
                                                //     (aviatorState.game_anim_status !== "WAITING" || betPlaceStatus !== "none")
                                                // }
                                                onClick={() => {
                                                    if (aviatorState.RemainedAutoPlayCount[i] < 1) {
                                                        modalAutoPlaySetOpen(true)
                                                        setAutoPlayingIndex(i)
                                                    } else {
                                                        cancelAutoPlay(i)
                                                        _setEnabledAutoCashOut(false, i); Game_Global_Vars.enabledAutoCashOut[i] = false
                                                    }
                                                }} className={`flex w-[72px] lg:w-[96px] h-[24px] 3xl:w-[212px] 3xl:h-[48px] rounded-full ${aviatorState.RemainedAutoPlayCount[i] > 0 ? "bg-red-700" : "bg-gradient-to-b from-[#07BDE5] to-[#07BDE588]"}   justify-center items-center font-bold border border-[#9FEEFF] text-[10px] lg:text-[12px] uppercase`}>
                                                {
                                                    aviatorState.RemainedAutoPlayCount[i] > 0 ?
                                                        `Stop (${aviatorState.RemainedAutoPlayCount[i]})` :
                                                        "AutoPlay"
                                                }
                                            </button>
                                            <div className='flex gap-1 items-center'>
                                                <span className='text-[#939393] min-w-[20px] text-[12px] lg:text-sm text-center'>Auto Cash Out</span>
                                                <SwitchButton
                                                    disabled={betPlaceStatus[i] === "success" || pendingBet[i]}
                                                    checked={enabledAutoCashOut[i]} onChange={(_, checked) => {
                                                        _setEnabledAutoCashOut(checked, i); Game_Global_Vars.enabledAutoCashOut[i] = checked
                                                    }} />
                                                <div className='flex gap-1 px-3 py-[2px] rounded-full bg-[#1F1F1F]'>
                                                    <input disabled={!enabledAutoCashOut} readOnly={betPlaceStatus[i] === "success" || pendingBet[i]} type="text" value={autoCashVal[i]}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^\d.]/g, '').trim() || '1'
                                                            _setAutoCashVal(val, i); Game_Global_Vars.autoCashVal[i] = val
                                                        }}
                                                        size={1} className='bg-transparent w-12 outline-none disabled:text-[#888] text-center' />
                                                    <span className={`inline-block ${enabledAutoCashOut ? "text-white" : "text-[#888]"}`}>x</span>
                                                </div>
                                            </div>
                                        </div> :
                                        <div className='' style={{ width: 10, height: 0 }} />
                                    }

                                </div>)
                        }
                    </div>
                    <SnackBar snackState={snackState} setSnackState={setSnackState} />
                    <AutoBetModal modalOpen={modalAutoPlayOpen} modalSetOpen={modalAutoPlaySetOpen} autoPlayingIndex={autoPlayingIndex} />
                </div>
                <div className="w-full lg:hidden h-full">
                    <BetBoard data={{ betBoardAllItem, betBoardMyItem }} />
                </div>

            </div >
        </div >
    )
}
export default GameBoard;