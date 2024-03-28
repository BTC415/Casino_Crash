const GameSettingButton = ({ href, title, onClick }: { href: string, title: string, onClick?: () => void }) => {
    return (
        <button onClick={onClick} className='flex gap-[2px] md:gap-2 justify-center items-center px-2 py-[2px] md:p-2 rounded-[4px] md:rounded-lg border border-gray-700 text-[12px] md:text-[18px] 3xl:text-[28px]'>
            <svg className=" overflow-visible md:scale-[1.2]" width={20} height={20}><use href={href} /></svg>
            {title}
        </button>
    )
}
export default GameSettingButton;