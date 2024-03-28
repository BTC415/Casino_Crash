import React, { Dispatch, SetStateAction } from 'react'
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { openFullscreen, testMobile, webpORpng } from '../../utils';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: "#393939",
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: "#E59407",
    },
}));

const Splash = ({ loaded, setOpenGame }: { loaded: boolean, setOpenGame: Dispatch<SetStateAction<boolean>> }) => {

    return (
        <div className='flex flex-col gap-10 w-full items-center text-white justify-center' style={{ height: "calc(100vh - 50px)" }}>
            <div className='flex flex-col gap-4 items-center justify-center'>
                <svg width={243} height={105} className='-rotate-[25deg]'><use href="#svg-plane" /></svg>

                <img alt="aviator" src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/aviator-text.${webpORpng}`} className='w-[200px]' />

            </div>
            {loaded ?
                < button onClick={() => {
                    setOpenGame(true)
                    if (!testMobile().iPhone)
                        openFullscreen()
                }} className='px-8 py-2 text-lg rounded-full border border-[#fff] bg-gradient-to-b from-[#E59407] to-[#412900] uppercase font-bold'>Start</button> :
                <div className='w-60 py-4'>
                    <BorderLinearProgress />
                </div>}
        </div >
    )
}
export default Splash;