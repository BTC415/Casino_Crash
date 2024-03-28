import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getHistoryItemColor } from "../../utils";
import { betBoardAllItemType, betBoardMyItemType, betBoardTopItemType } from "../../@types";
import axios from "axios";

const BetBoardItem = ({ username, betAmount, crashedAt, cashout }: { username: string, betAmount: number, crashedAt?: number, cashout?: number }) => {

    return (
        <div className={`flex ${crashedAt ? "bg-[#123405] border border-[#427f00]" : "bg-[#141516]"}  rounded-md px-1 items-center cursor-pointer`}>
            <div className='flex items-center w-full gap-1'>
                <img alt="avatar" width={30} src="/aviator/avatar.png" />
                <span>{username}</span>
            </div>
            <div className='flex gap-4 items-center w-full font-bold'>
                <span>{betAmount.toFixed(2)}</span>
                {crashedAt &&
                    <span className="px-2 py-[1px] bg-black/50 rounded-full" style={{ color: getHistoryItemColor(`${crashedAt}x`) }}>{crashedAt}x</span>
                }
            </div>
            <div className='w-full font-bold text-right'>{cashout?.toFixed(2)}</div>
        </div>
    )
}
const BetBoardTopItem = ({ data }: { data: betBoardTopItemType }) => {
    return (
        <div className="flex flex-col w-full rounded-sm">
            <div className="flex w-full items-center bg-[#101112]">
                <div className='flex flex-col items-center gap-1 pl-4'>
                    <img alt="avatar" width={30} src="/aviator/avatar.png" />
                    <span>{data.username}</span>
                </div>
                <div className="flex w-full gap-2 py-4">
                    <div className="flex flex-col items-end w-full gap-2">
                        <p>Bet:</p>
                        <p>Cashed out:</p>
                        <p>Win</p>
                    </div>
                    <div className="flex flex-col items-start w-full font-semibold text-white gap-2">
                        <p>{data.bet}</p>
                        <p className="px-2 rounded-full bg-black text-purple-600 font-bold">{data.cashout}x</p>
                        <p>{data.win}</p>
                    </div>
                </div>
            </div>
            <div className="flex w-full justify-between bg-black p-1">
                <div className="flex gap-2">
                    <p>{data.date}</p>
                    <p>Round: <strong className="text-white">{data.roundId}x</strong></p>
                </div>
            </div>
        </div>
    )
}
const BetBoardTopSection = ({ filter }: { filter: "yearly" | "monthly" | "today" }) => {
    const [items, setItems] = useState<betBoardTopItemType[]>([])
    useEffect(() => {
        (async () => {
            const { data: { status, data } }: { data: { status: boolean, data: betBoardTopItemType[] } } = await axios.post('/api/games/crash/play/top-identifier', {
                timeFilter: filter
            })
            if (status) {
                setItems(data.map(elem => {
                    const new_val = { ...elem }
                    const date = new Date(elem.date);
                    new_val.date = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    return new_val
                }))
            }
        })()
    }, [])
    return (
        <>
            {
                items.map((item, i) => <BetBoardTopItem key={i} data={item} />)

            }
        </>
    )
}
const Switcher = ({ type, setType, titles }: { type: number, setType: Dispatch<SetStateAction<number>>, titles: string[] }) => {
    return (
        <div className='flex w-full rounded-full bg-[#141516]'>
            <div onClick={() => setType(0)} className='w-full text-center rounded-full p-1 cursor-pointer relative'>
                <div className='w-full h-full rounded-full bg-[#2c2d30] p-1 top-0 left-0 absolute transition-all ease-in-out duration-500' style={{ transform: `translate(${type * 100}%,0)` }} />
                <span className="relative z-20">{titles[0]}</span>
            </div>
            <div onClick={() => setType(1)} className='w-full text-center rounded-full p-1 cursor-pointer relative z-20'>{titles[1]}</div>
            <div onClick={() => setType(2)} className='w-full text-center rounded-full p-1 cursor-pointer relative z-20'>{titles[2]}</div>
        </div>
    )
}
const BetBoard = ({ data: { betBoardAllItem, betBoardMyItem } }: { data: { betBoardAllItem: betBoardAllItemType[], betBoardMyItem: betBoardMyItemType[] } }) => {
    const [betType, setBetType] = useState(0)
    const [durationType, setDurationType] = useState(0)
    return (
        <div className='flex flex-col p-2 gap-[2px] h-full overflow-auto'>
            <div className='flex flex-col gap-2 p-2 w-full rounded-md text-white text-[12px]'>
                <Switcher type={betType} setType={setBetType} titles={["All Bets", "My Bets", "Top"]} />
                <div className='flex justify-between items-center' style={{ display: betType === 0 ? "block" : "none" }}>
                    <div className='text-[12px]'>
                        <p>All Bets</p>
                        <p>{betBoardAllItem.length}</p>
                    </div>

                </div>
            </div>
            <div className='flex flex-col gap-[2px] p-1 w-full bg-[#1b1c1d] rounded-md text-[#bbbfc5] text-[12px] overflow-auto'>
                {betType < 2 && <div className='flex p-2'>
                    <div className='w-full'>{betType === 0 ? "User" : "Date"}</div>
                    <div className='w-full'>Bet X</div>
                    <div className='w-full text-right'>Cash out</div>
                </div>}
                {betType === 2 && <Switcher type={durationType} setType={setDurationType} titles={["Day", "Month", "Year"]} />}
                <div className='flex flex-col gap-[2px] w-full bg-[#1b1c1d] rounded-md text-[#bbbfc5] text-[12px] overflow-auto'>
                    {betType === 0 && betBoardAllItem.map(({ gameCrashId, username, betAmount, crashedAt, cashout }, i) =>
                        <BetBoardItem key={i} username={username} betAmount={betAmount} crashedAt={crashedAt} cashout={cashout} />)}
                    {betType === 1 && betBoardMyItem.map(({ gameCrashId, date, betAmount, crashedAt, cashout }, i) =>
                        <BetBoardItem key={i} username={date} betAmount={betAmount} crashedAt={crashedAt} cashout={cashout} />)}
                    {betType === 2 && <>
                        {durationType === 0 && <BetBoardTopSection filter="today" />}
                        {durationType === 1 && <BetBoardTopSection filter="monthly" />}
                        {durationType === 2 && <BetBoardTopSection filter="yearly" />}
                    </>}

                </div>
            </div>
        </div>
    )
}
export default BetBoard;