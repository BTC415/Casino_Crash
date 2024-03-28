import * as React from "react"
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { webpORpng } from "../utils";
const PicItem = ({ src, title, msg }: { src: string, title: string, msg: string }) => {
    return (
        <div className="flex flex-col gap-4">
            <img src={src} alt="description" style={{ width: 252, height: 145 }} className="rounded-xl overflow-hidden border border-[#444]" />
            <div className="flex gap-2">
                <svg width={40} height={40}><use href="#svg-bet" /></svg>
                <p className="w-[200px]">
                    <strong className="uppercase text-[#E59407]">{title} </strong>
                    <span> {msg} </span>
                </p>
            </div>
        </div>
    )
}
export default function RuleModal({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const handleClose = () => setOpen(false)
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className="w-full h-full overflow-y-auto max-h-screen min-h-screen pt-10 pb-20 bg-[#212121] text-white p-2">
                <button onClick={handleClose} className="w-10 h-10 fixed top-4 right-10 cursor-pointer bg-[#333] rounded-full text-white"><CloseIcon /></button>
                <div className="w-full flex flex-col justify-center items-center gap-4 max-w-[800px] mx-auto">
                    <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/aviator-text.${webpORpng}`} className="w-[200px]" alt="aviator" />
                    <svg width={243} height={105} className='-rotate-[15deg] mt-10'><use href="#svg-plane" /></svg>

                    <div className="flex flex-wrap justify-center gap-4">
                        <PicItem src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/info-1.${webpORpng}`} title="bet" msg="before take-off" />
                        <PicItem src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/info-2.${webpORpng}`} title="watch" msg="as your Lucky Plane takes off and your winnings increase. " />
                        <PicItem src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/info-3.${webpORpng}`} title="cash out" msg="before the plane disappears and wins X times more!" />
                    </div>
                    <div className="w-full flex flex-col gap-4 px-8">
                        <p>Aviator represents a cutting-edge iGaming experience where the potential for substantial winnings is just seconds away! It operates on a Random Number Generator (RNG) system, offering a genuine assurance of fairness in the realm of gambling.</p>
                        <p>Playing Aviator is a breeze, following a simple 1-2-3 process:</p>
                        <p>However, it's crucial to note that failing to Cash Out before the Lucky Plane departs results in the loss of your bet. Aviator is a game that encapsulates pure thrill — a combination of risk and reward squarely in your hands!</p>
                        <p className="text-2xl">Here are more details:</p>
                        <ul>
                            <li> The win multiplier initiates at 1x and steadily increases as the Lucky Plane takes flight.</li>
                            <li> Your winnings are determined by the multiplier at the moment you Cash Out, multiplied by your initial bet.</li>
                        </ul>
                        <p className="text-2xl">Game Functions:</p>
                        <p className="text-xl">Bet & Cash Out</p>

                        <ul>
                            <li> Choose an amount and click the "Bet" button to place your bet.</li>
                            <li> Utilize the "Cash Out" button to collect your winnings. The win amount is your bet multiplied by the Cash Out multiplier.</li>
                            <li> If you neglect to Cash Out before the plane departs, your bet is forfeited.</li>
                        </ul>

                        <p className="text-xl">Auto Play & Auto Cash Out</p>
                        <ul>
                            <li> Activate Auto Play by selecting the "Auto" tab on the Bet Panel and pressing the "Auto Play" button.</li>
                            <li> The Auto Play Panel includes options like "Stop if cash decreases by," which halts Auto Play if the balance falls by the chosen amount.</li>
                            <li> Another option in the Auto Play Panel is "Stop if cash increases by," which ends Auto Play if the balance rises by the selected amount.</li>
                            <li> Auto Cash Out, accessible from the "Auto" tab on the Bet panel, automatically cash out your bet once it reaches the specified multiplier.</li>
                        </ul>

                    </div>
                </div>
            </div>
        </Modal>
    )
} 