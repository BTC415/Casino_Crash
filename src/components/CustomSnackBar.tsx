import { Dispatch, SetStateAction, useEffect, useState } from "react"

const CustomSnackBarItem = ({ crash, index, rising }: { crash: { payout: number, win: number }, index: number, rising: number }) => {
    const [val, setVal] = useState(0)
    useEffect(() => {
        setTimeout(() => setVal(100), 100)
    }, [rising])
    return (
        <div className='absolute top-0 flex items-center bg-[#123405] w-[300px] h-[56px] m-1 rounded-full border border-[#427f00] pl-2 pr-2 py-[5px] transition-all ease-in-out duration-150 font-roboto' style={{ left: "calc(50% - 300px / 2)", translate: `0 ${60 * (index - rising)}px`, opacity: val / 100 }}>
            <div className='flex flex-col justify-center items-center w-[150px]'>
                <span className='text-[#9ea0a3] text-[12px] leading-[16px]'>You have cashed out!</span>
                <span className='text-white text-[20px] leading-[20px]'>{crash.payout.toFixed(2)}x</span>
            </div>
            <div className='flex flex-col relative overflow-hidden justify-center items-center w-[120px] h-full rounded-full bg-[#4eaf11] text-white font-bold text-[20px] leading-[20px]' style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
                <svg className="absolute top-2 left-0 opacity-80" width={31} height={31}><use href="#svg-star-back" /></svg>
                <svg className="absolute top-2 right-0 opacity-80 -scale-x-100" width={31} height={31}><use href="#svg-star-back" /></svg>
                <span className='text-[14px]'>Win</span>
                <span>{crash.win.toFixed(2)}</span>
            </div>
            <span className='text-[#d2d2d2] pl-2 font-bold font-roboto cursor-pointer text-[24px] opacity-50' style={{ textShadow: "0 1px 0 #97a4ae" }}>×</span>
        </div>
    )
}
const CustomSnackBar = ({ cashes, setCashes }: { cashes: { payout: number, win: number }[], setCashes: Dispatch<SetStateAction<{ payout: number, win: number }[]>> }) => {
    const [rising, setRising] = useState(0)
    useEffect(() => {
        if (cashes.length > 0) {
            setTimeout(() => setRising(cashes.length), 3000)
        } else {
            setRising(0)
        }
    }, [cashes])
    return (
        <div className='absolute left-0 top-0 w-full h-0 overflow-visible z-50'>
            {cashes.map((item, i) => <CustomSnackBarItem key={i} crash={item} index={i} rising={rising} />)}
        </div>
    )
}
export default CustomSnackBar