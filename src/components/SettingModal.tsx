import { Modal } from "@mui/material";
import * as React from "react"
import CloseIcon from '@mui/icons-material/Close';
import { Game_Global_Vars } from "../utils";
export default function SettingModal({ open, setOpen, bet6: { bet6, setBet6 } }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, bet6: { bet6: string[], setBet6: React.Dispatch<React.SetStateAction<string[]>> } }) {
    React.useEffect(() => {
        localStorage.setItem('bet6', JSON.stringify(bet6))
    }, [bet6])
    const [localBet6, setLocalBet6] = React.useState<string[]>(bet6)
    const handleClose = () => setOpen(false)
    React.useEffect(() => {
        if (open) {
            setLocalBet6(bet6)
        }
    }, [open])
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className="w-full h-full max-h-screen min-h-screen bg-[#212121]">
                <button onClick={handleClose} className="w-10 h-10 fixed top-10 right-10 cursor-pointer bg-[#333] rounded-full text-white"><CloseIcon /></button>

                <div className="flex flex-col gap-4 justify-center items-center font-salsa text-white h-full min-h-screen">
                    <h1 className="text-2xl">Settings</h1>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 w-[360px] justify-center items-center">
                        {bet6.map((_, i) =>
                            <ChipItem key={i} id={i} bet6={{ bet6: localBet6, setBet6: setLocalBet6 }} />)}
                        <button onClick={handleClose} className="w-full px-4 bg-[#787882] rounded-md text-[24px] transition-all ease-in-out hover:bg-[#787882]/80">Cancel</button>
                        <button onClick={() => {
                            setBet6(localBet6)
                            handleClose()

                        }} className="w-full px-4 bg-[#FFAE01] rounded-md text-black text-[24px] transition-all ease-in-out hover:bg-[#FFAE01]/80">Save</button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
const ChipItem = ({ id, bet6: { bet6, setBet6 } }: { id: number, bet6: { bet6: string[], setBet6: React.Dispatch<React.SetStateAction<string[]>> } }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!/^\d+$/.test(e.target.value)) return
        console.log(e.target.value, bet6)
        setBet6(prev => {
            const new_var = [...prev]
            const value = e.target.value || "1"
            const fil_value = Math.min(Game_Global_Vars.stake.max, Math.max(Game_Global_Vars.stake.min, parseInt(value))).toString()
            new_var[id] = fil_value
            return new_var
        })
    }
    return (
        <div className="flex flex-col gap-[1px] rounded-lg px-2 w-fit py-[2px] border-2 border-white text-center bg-black">
            <h1>Chip Amount</h1>
            <input onChange={handleChange} type="string" value={bet6[id]} className="text-lg bg-transparent w-full text-center focus-within:outline-none" />
        </div>
    )
}