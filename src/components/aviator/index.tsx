import React, { useState } from 'react'
import GameBoard from "./GameBoard"
import axios, { AxiosError } from 'axios'
import io from 'socket.io-client'
import { useAviator } from '../../store/aviator'
import AccessDenied from '../AccessDenied'
import { Assets } from 'pixi.js'
import { urls } from '../../utils/urls'
import Splash from '../pixicomp/Splash'
import { Game_Global_Vars, initBet6, loadSound } from '../../utils'
import TopLogoBar from '../TopLogoBar'
import RuleModal from '../RuleDialog'
import SettingModal from '../SettingModal'
import HistoryModal from '../HistoryModal'

const Aviator = () => {

    const { aviatorState, setAviatorState } = useAviator()
    const [loaded, setLoaded] = useState(false)
    const [openGame, setOpenGame] = useState(false)

    const [bet6, setBet6] = useState<string[]>(initBet6)
    const [ruleModalOpen, setRuleModalOpen] = useState(false)
    const [settingModalOpen, setSettingModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    React.useEffect(() => {
        Game_Global_Vars.betValue = [bet6[0], bet6[0]]
    }, [bet6])
    React.useEffect(() => {
        Assets.load(urls).then(() => {
            (async () => {
                const urlParams = new URLSearchParams(window.location.search);
                const token: string = urlParams.get('token') || "";
                if (!token) {
                    setAviatorState(prev => ({ ...prev, auth: false }))
                    return
                }
                delete axios.defaults.headers.common['Accept']
                axios.defaults.headers.common['token'] = token;
                axios.defaults.baseURL = process.env.REACT_APP_API_URL || "https://apiuat.bollygaming.games"
                axios.defaults.timeout = 20000
                try {
                    await axios.post('/api/config').then((response) => {
                        localStorage.setItem('bet6', JSON.stringify(response.data.data.config.chips.slice(0, 6).map((item: number) => (`${item}`))))
                        Game_Global_Vars.stake = {
                            max: response.data.data.maxStake,
                            min: response.data.data.minStake
                        }
                        setAviatorState(prev => ({
                            ...prev,
                            balance: response.data.data.user.account.balance,
                        }))
                    })

                    const { data: { hash } }: { data: { hash: string } } = await axios.post('/api/user/games/create', {
                        game_package_id: "crash",
                        client_seed: Math.ceil(Math.random() * 99999999)
                    })
                    Game_Global_Vars.hash = hash
                    const socket = io(process.env.REACT_APP_SOCKET_URL || "https://aviatoruat.bollygaming.games:3001", {
                        // auth: callback => callback({ token }),
                        auth: { token },
                        transports: ["websocket"]
                    });
                    setAviatorState(prev => ({ ...prev, socket, token }))
                    socket.on('connect', () => {
                        console.log('Connected to the server!');
                    });

                    socket.on('disconnect', () => {
                        console.log('Disconnected from the server!');
                    });
                    setLoaded(true)
                } catch (e) {
                    if ((e as AxiosError)?.response?.status === 503) {
                        document.body.innerHTML = ((e as AxiosError)?.response?.data) as string
                        document.body.style.cssText = "color:white"
                    }
                    setAviatorState(prev => ({ ...prev, auth: false }))
                }


            })()

            loadSound()
        });










        return () => {
            aviatorState.socket?.removeAllListeners()
            aviatorState.socket?.disconnect();
        }
    }, [])

    return (
        <>
            <TopLogoBar loaded={loaded} setSettingModalOpen={setSettingModalOpen} setHistoryModalOpen={setHistoryModalOpen} setRuleModalOpen={setRuleModalOpen} />
            {
                aviatorState.auth ?
                    (openGame && loaded ?
                        <GameBoard bet6={bet6} />
                        :
                        <Splash loaded={loaded} setOpenGame={setOpenGame} />)
                    :
                    <AccessDenied />
            }
            <RuleModal open={ruleModalOpen} setOpen={setRuleModalOpen} />
            <SettingModal open={settingModalOpen} setOpen={setSettingModalOpen} bet6={{ bet6, setBet6 }} />
            <HistoryModal loaded={loaded} open={historyModalOpen} setOpen={setHistoryModalOpen} />
        </>
    )
}
export default Aviator