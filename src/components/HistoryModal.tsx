import * as React from 'react';
import axios from 'axios';
import '../../src/betstyle.css';
import { Modal } from '@mui/material';
import { getUTCTimefromUTCTime, webpORpng } from '../utils';

const HistoryModal = ({ loaded, open, setOpen }: { loaded: boolean, open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [page, setPage] = React.useState(1);
    const [date, setDate] = React.useState<Date | null>(null)
    const [filterProfit, setFilterProfit] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(5)
    const [count, setCount] = React.useState(0)
    const [items, setItems] = React.useState<any[]>([])
    const [PL, setPL] = React.useState(0)
    const [loading, setLoading] = React.useState(true)

    const [data, setData] = React.useState<any>(null)
    const [showDetail, setShowDetail] = React.useState(false)
    const makeDetailData = async (id: number) => {
        setLoading(true)
        await axios.get(`/api/history/games/${id}/details`).then(({ data: { game } }) => {
            setData(game)
        })
        setLoading(false)
    }

    const upper_ref = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        if (!loaded) return
        if (!open) return
        fetchData()
    }, [date, filterProfit, rowsPerPage, page, loaded, open])
    React.useEffect(() => { setPage(1) }, [date, filterProfit])
    // React.useEffect(() => {
    //     setTimeout(() => window.scrollTo(0, 0), 1000)
    // })
    const handleNext = () => {
        setPage(prev => Math.min(prev + 1, Math.ceil(count / rowsPerPage)))
    }
    const handlePrev = () => {
        setPage(prev => Math.max(prev - 1, 1))
    }
    const fetchData = async () => {
        setLoading(true)
        const pro_arr = ["all", "win", "loss"]
        let api_url = `/api/history/user?page=${page}&items_per_page=${rowsPerPage}&sort_by=created_at&sort_direction=desc&win=${pro_arr[filterProfit]}`
        if (date) {
            const formattedDate = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
            api_url += `&date[]=${formattedDate}&date[]=${formattedDate}`
        }
        const { data: { count, items, betPL } }: { data: { count: number, items: any[], betPL: number } } = await axios.get(api_url)
        setCount(count)
        setPL(betPL)
        setItems(items)
        setLoading(false)
    }
    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ bgcolor: "black" }}
        >
            <>
                {showDetail &&
                    <div className='bet-history-detail-modal user-history fixed w-full h-full bg-black z-20 text-white flex flex-col overflow-auto pb-12' style={{ width: "100%", fontFamily: "Salsa" }}>
                        <div className="user-data m-auto">
                            <div className="data-header">
                                <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/back.${webpORpng}`} alt="back" className='float-left cursor-pointer align-middle mx-4' onClick={() => setShowDetail(false)} />
                                Game {data?.id}
                            </div>
                            <div className="data-body relative">
                                <div className={`${loading ? "flex" : "hidden"} justify-center items-center absolute top-0 w-full h-full z-10 bg-black/50`}>
                                    <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}general/loading.gif`} alt="loading..." width={120} height={120} />
                                </div>
                                <div className="table-responsive">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>Round Id</td>
                                                <td>{data?.id}</td>
                                            </tr>
                                            <tr>
                                                <td>Game	</td>
                                                <td>{(data?.title as string)?.toLowerCase() === "crash" ? "Crash" : data?.gameable.slot_type}</td>
                                            </tr>
                                            {
                                                (data?.title as string)?.toLowerCase() === "crash" ?
                                                    <>
                                                        <tr>
                                                            <td>Bet	</td>
                                                            <td>{data?.bet}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Win</td>
                                                            <td>{data?.win}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Profit</td>
                                                            <td>{data?.profit}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Cashout</td>
                                                            <td>{data?.gameable.cashout}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Crashed at</td>
                                                            <td>{data?.gameable.max_payout}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Played</td>
                                                            <td>{data?.created_at}</td>
                                                        </tr>
                                                    </> :
                                                    <>
                                                        <tr>
                                                            <td>Lines	</td>
                                                            <td>{data?.gameable.lines}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Win</td>
                                                            <td>{data?.win}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Created at</td>
                                                            <td>{getUTCTimefromUTCTime(data?.created_at as string).toLocaleString("sv-SE", {
                                                                year: "numeric",
                                                                month: "2-digit",
                                                                day: "2-digit",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Updated at</td>
                                                            <td>{data?.updated_at}</td>
                                                        </tr>
                                                    </>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <div className="user-history overflow-y-auto" style={{ fontFamily: "Salsa" }}>
                    <div className="user-filter" ref={upper_ref}>
                        <div className="input-group">
                            <label className=' ' htmlFor="">Select a date to filter</label>
                            {/* hidden sm:block */}
                            <input onChange={(e) => {
                                const strDate = e.target.value
                                if (strDate.trim() === "") {
                                    setDate(null)
                                } else {
                                    setDate(new Date(e.target.value))
                                }

                            }} type="date" />
                        </div>
                        <div className="input-group">
                            <label className='' htmlFor="">Select Status</label>
                            <select onChange={(e) => setFilterProfit(parseInt(e.target.value))} name="" id="">
                                <option value="0">All</option>
                                <option value="1">Won</option>
                                <option value="-1">Loss</option>
                            </select>
                        </div>
                        <div className="input-group flex-row w-full justify-end">
                            <h3 className='w-full text-right'><span className='hidden sm:inline'>Total P/L:</span> <span style={{ color: PL < 0 ? "#f44336" : "#4caf50" }}>{PL.toFixed(2)}</span></h3>
                        </div>
                    </div>
                    <div className="user-data">
                        <div className="data-header text-center">

                            <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}${webpORpng}/back.${webpORpng}`} alt="back" className='float-left cursor-pointer align-middle ml-4' onClick={() => setOpen(false)} />  My games
                        </div>
                        <div className="data-body relative">
                            <div className={`${loading ? "flex" : "hidden"} justify-center items-center absolute top-0 w-full h-full z-10 bg-black/50`}>
                                <img src={`${process.env.REACT_APP_ASSETS_IMAGE_URL}general/loading.gif`} alt="loading..." width={120} height={120} />
                            </div>
                            <div className="table-responsive overflow-auto" style={{ maxHeight: Math.max(window.innerHeight - (upper_ref.current?.clientHeight || 120) - 200, 100) }}>
                                <table>
                                    <thead className='sticky -top-1 bg-black'>
                                        <tr>
                                            <th>Round Id</th>
                                            <th>Game</th>
                                            <th>Bet</th>
                                            <th>Win</th>
                                            <th>Profit</th>
                                            <th>Bet Time</th>
                                            <th> </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            items.map((row, i) =>
                                                <tr key={i}>
                                                    <td>{row.id}</td>
                                                    <td> {row.description} </td>
                                                    <td>{row.bet.toFixed(2)}	</td>
                                                    <td>{row.win.toFixed(2)}</td>
                                                    <td>{row.profit.toFixed(2)}</td>
                                                    <td>{
                                                        getUTCTimefromUTCTime(row.created_at as string).toLocaleString("sv-SE", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })//.replace(",", "")
                                                    }</td>
                                                    <td><button className='cursor-pointer' onClick={() => {
                                                        makeDetailData(row.id)
                                                        setShowDetail(true)
                                                    }}>View Detail</button></td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination-row">
                                <div className="result-text">
                                    <h4>Rows per page</h4>
                                    <select name="" id="" style={{ padding: 0 }} onChange={(e) => setRowsPerPage(parseInt(e.target.value))}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                    </select>
                                </div>
                                <div className="pagination-text">
                                    <h4> {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, count)} of {count}</h4>
                                    <div>
                                        <i onClick={handlePrev} className={`fa-solid fa-chevron-left ${page > 1 ? "active" : ""}`}></i>
                                        <i onClick={handleNext} className={`fa-solid fa-chevron-right ${page < Math.ceil(count / rowsPerPage) ? "active" : ""}`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </Modal >
    )
}
export default HistoryModal;


