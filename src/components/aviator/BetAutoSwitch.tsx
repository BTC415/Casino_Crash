import { betAutoStateType } from "../../@types"

const BetAutoButton = ({ disabled, title, onClick }: { disabled: boolean, title: string, onClick: () => void }) => {
    return (
        <button disabled={disabled} onClick={onClick} className='flex justify-center items-center w-[48px] lg:w-[70px] h-[18px] lg:h-[26px] rounded-full text-[12px] lg:text-lg uppercase font-bold z-10 disabled:opacity-80 disabled:cursor-not-allowed'>
            {title}
        </button>
    )
}

const BetAutoSwitch = ({ disabled, betAuto: { betAutoState, setBetAutoState } }: { disabled: boolean, betAuto: { betAutoState: betAutoStateType, setBetAutoState: (val: betAutoStateType) => void } }) => {
    const handleBetClick = () => {
        setBetAutoState("bet")
    }
    const handleAutoClick = () => {
        setBetAutoState("auto")
    }
    return (
        <div className='flex gap-1 rounded-full relative bg-black p-1'>
            <div className={`absolute top-1 w-[48px] lg:w-[70px] h-[18px] lg:h-[26px] rounded-full bg-gradient-to-b from-[#3E3E3E] to-[#3E3E3E] transition-all ease-in-out ${betAutoState === "bet" ? "" : "translate-x-[52px] lg:translate-x-[74px]"} `}></div>
            <BetAutoButton disabled={disabled} onClick={handleBetClick} title='Bet' />
            <BetAutoButton disabled={disabled} onClick={handleAutoClick} title='Auto' />
        </div>
    )
}
export default BetAutoSwitch