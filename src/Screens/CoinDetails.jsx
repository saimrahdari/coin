import axios from 'axios';
import { onValue, ref, set, update } from 'firebase/database';
import React, { useContext, useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { db } from '../../Firebase';
import { GlobalContext } from './GlobalContext';

const CoinDetails = () => {
    const navigate = useNavigate()
    const { state } = useLocation();
    const [fav, setFav] = useState(false)
    const [coinsData, setCoinsData] = useState([])
    const [dbUser, setDbUser] = useState([])
    const { currentUser } = useContext(GlobalContext)
    const [showModal, setShowModal] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [recaptchaKey, setRecaptchaKey] = useState(Date.now());
    const captchaRef = useRef(null)
    const [hourError, setHourError] = useState(false);



    useEffect(() => {
        const userRef = ref(db, 'users/');
        onValue(userRef, snapshot => {
            snapshot.forEach(childSnapshot => {
                if (Object.values(childSnapshot.val()).includes(currentUser.uid)) {
                    setDbUser(childSnapshot.val());
                }
            });
        });
    }, []);


    const IsFav = () => {
        return dbUser.fav && dbUser.fav.includes(state.key);
    };

    const handleFav = () => {
        let favs = dbUser.fav
        if (favs.includes(state.key)) {
            favs = favs.filter(e => e != state.key)
        } else {
            favs.push(state.key)
        }
        set(ref(db, `users/${currentUser.uid}/fav`), favs)
    }

    const upVote = () => {
        setRecaptchaKey(Date.now());
        setShowModal(true)
    }

    const handleModalClose = () => {
        setShowModal(false);
        setRecaptchaToken(null);
        // Reset the reCAPTCHA widget
        setRecaptchaKey(Date.now());
    }

    const handleVote = async () => {
        const token = captchaRef.current.getValue();

        if (token) {
            let valid_token = await verifyToken(token);
            const res = await axios.get('https://geolocation-db.com/json/')
            console.log(res.data.IPv4);
            try {
                const response = await axios.get(`https://coinvote-api.herokuapp.com/verifyIp/${res.data.IPv4}`);
                console.log(response.data.success);
                if (valid_token.success && response.data.success) {
                    update(ref(db, `/coins/${clickedCoin.key}`), {
                        votes: clickedCoin.coin.votes + 1,
                    })
                    setShowModal(false)
                }else{
                    setHourError(true)
                }
              } catch (error) {
                console.log(error);
              }
          
        }
    }

    useEffect(() => {
        // Reset the reCAPTCHA widget when the component first loads
        if (captchaRef.current) {
            setRecaptchaKey(Date.now());
        }
    }, [showModal]);

    const verifyToken = async (token) => {
        try {
            let response = await axios.post(`https://coinvote-api.herokuapp.com/verify-token`, {

                secret: import.meta.env.VITE_REACT_APP_SECRET_KEY,
                token
            });
            return response.data;
        } catch (error) {
            console.log("error ", error);
        }
        setRecaptchaKey(Date.now());
    }

    return (
        <div className='mt-[120px] items-center flex justify-center w-full flex-col'>
            <div className='w-full flex items-center justify-center'>
                <Link to={'/advertise'} className='bg-primary text-white px-[8px] border-[3px] border-secondary rounded-[5px] flex flex-row w-full md:w-full lg:w-[40%] items-center gap-x-[140px]'>
                    <h1 className=''>Logo</h1>
                    <div className=' py-[8px]  flex flex-col justify-center items-center'>
                        <h2 className='text-[1.5rem] font-medium'>YOUR BANNER HERE</h2>
                        <h2 className='text-white text-[1rem] font-medium'>votenow-crypto.com</h2>
                    </div>
                </Link>
            </div>

            <div className='md:w-[80%] w-full my-[20px] rounded-[12px] pt-[20px] pb-[30px] px-[5px] bg-primary border-[5px] border-secondary '>
                <div onClick={() => navigate("/")} className='inline-flex cursor-pointer flex-row items-center gap-x-[8px] text-white p-[20px] hover:text-hover'>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4965 18.1877L10.5055 19.1787C10.0859 19.5983 9.40743 19.5983 8.9923 19.1787L0.314697 10.5055C-0.104899 10.0859 -0.104899 9.40743 0.314697 8.9923L8.9923 0.314697C9.4119 -0.104899 10.0904 -0.104899 10.5055 0.314697L11.4965 1.30566C11.9205 1.72972 11.9116 2.4216 11.4786 2.83674L6.09977 7.96117H18.9287C19.5224 7.96117 20 8.43879 20 9.03247V10.4609C20 11.0546 19.5224 11.5322 18.9287 11.5322H6.09977L11.4786 16.6566C11.9161 17.0718 11.925 17.7636 11.4965 18.1877Z" fill="currentColor" /></svg>
                    <p>Go back</p>
                </div>

                <div className='w-full flex flex-row flex-wrap gap-x-1 justify-between px-[10px]'>

                    {/* left side */}
                    <div className='w-full md:w-[72%] bg-secondary rounded-[15px] p-[15px] '>
                        <div className='flex flex-row'>
                            <img src={state.coin.coinLogo} alt="Logo" className='rounded-[50%] max-w-[100px] align-middle w-[100px] h-[100px]' />
                            <h1 className='text-white ml-[12px] break-all mt-[20px] mb-[10px] text-[2.5rem] font-bold'>
                                {state.coin.name}
                                <b className='ml-[8px] bg-white inline-block min-w-[10px] py-[3px] px-[7px] text-[15px] font-bold text-primary text-center align-baseline rounded-[4px]'>
                                    {state.coin.symbol}
                                </b>
                            </h1>
                        </div>

                        {/* socials */}
                        <div className='flex flex-wrap flex-row gap-x-1 gap-y-5 mt-[20px]'>
                            <div className={` ${state.coin.website !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.website}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Website
                                </Link>
                            </div>
                            <div className={` ${state.coin.telegram !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.telegram}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Telegram
                                </Link>
                            </div>
                            <div className={`${state.coin.twitter !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.twitter}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Twitter
                                </Link>
                            </div>
                            <div className={`${state.coin.insta !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.insta}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Instagram
                                </Link>
                            </div>
                            <div className={`${state.coin.youtube !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.youtube}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Youtube
                                </Link>
                            </div>
                            <div className={`${state.coin.discord !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.discord}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Discord
                                </Link>
                            </div>
                            <div className={`${state.coin.reddit !== "" ? "block" : "hidden"} text-[16px] text-center p-[5px]`}>
                                <Link to={`${state.coin.reddit}`} className='font-bold min-w-[80px] text-center text-white bg-prima hover:text-primary hover:bg-white border-[2px] border-white rounded-[7px] p-[10px] whitespace-nowrap cursor-pointer'>
                                    Reddit
                                </Link>
                            </div>
                        </div>

                        <hr className='border-[2px] border-primatext-primary my-[20px]' />
                        <p className=''>{state.coin.description}</p>
                    </div>

                    {/* right side */}
                    <div className='w-full md:w-[25%] flex flex-col'>
                        <div className='flex flex-col w-full gap-0'>
                            <Link to={"/"} className="m-0 min-h-[65px] font-bold min-w-[80px] text-center inline-block w-full text-white hover:text-primary border-[2px] border-white hover:bg-white cursor-pointer align-middle whitespace-nowrap p-[10px]">
                                Trending Vote <br />
                                <span>0</span>
                            </Link>
                            <div onClick={upVote} className="m-0 min-h-[65px] font-bold min-w-[80px] text-center inline-block w-full text-white hover:text-primary border-[2px] border-white hover:bg-white cursor-pointer align-middle whitespace-nowrap p-[10px]">
                                Vote <br />
                                <span>{state.coin.votes}</span>
                            </div>
                            <div onClick={handleFav} className={` ${IsFav() ? "text-red-500" : "text-white"}  m-0 min-h-[50px] font-bold min-w-[80px] text-center flex justify-center items-center w-ful border-[2px] border-white hover:bg-primary cursor-pointer align-middle whitespace-nowrap p-[10px] `}>
                                <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5738 1.49576C19.8981 -0.784512 15.9186 -0.374356 13.4625 2.15982L12.5006 3.15104L11.5387 2.15982C9.08751 -0.374356 5.10314 -0.784512 2.42736 1.49576C-0.639049 4.11295 -0.800182 8.81022 1.94396 11.6471L11.3922 21.403C12.0026 22.0329 12.9938 22.0329 13.6041 21.403L23.0524 11.6471C25.8014 8.81022 25.6402 4.11295 22.5738 1.49576Z" fill="currentColor" /></svg>
                            </div>
                        </div>

                        <div className=' bg-secondary mt-[12px] py-[12px] w-full border-y-[2px] border-primary flex flex-col'>
                            <div className='flex flex-col mb-[5px] items-center'>
                                <p className='text-[15px] font-bold'>Price</p>
                                <p className='text-[15px] '>{state.coin.price}</p>
                            </div>
                            <div className='flex flex-col mb-[5px] items-center'>
                                <p className='text-[15px] font-bold'>Market Cap</p>
                                <p className='text-[15px] '>{state.coin.cap}</p>
                            </div>
                            <div className='flex flex-col mb-[5px] items-center'>
                                <p className='text-[15px] font-bold'>24th</p>
                                <p className='text-[15px] '>-</p>
                            </div>
                            <div className='flex flex-col mb-[5px] items-center'>
                                <p className='text-[15px] font-bold'>Launch Date</p>
                                <p className='text-[15px] '>{state.coin.launchDate}</p>
                            </div>
                            <div className='flex flex-col mb-[5px] items-center'>
                                <p className='text-[15px] font-bold'>Coin Owner</p>
                                <Link to={`/profile/${state.coin.owner}`} className='text-[15px] text-white border-b border-white hover:text-hover hover:border-hover '>{state.coin.owner}</Link>
                            </div>
                        </div>

                        <div className='flex flex-col items-center border border-primary py-[5px] px-[1px] font-bold bg-primatext-primary rounded-[5px] text-[13px] mt-[20px]'>
                            <p className='text-[14px] my-[14px] '>Contact Support</p>
                            <Link to={''} className="text-white border border-white py-[8px] px-[16px] hover:bg-white hover:text-primary mt-[8px]">Via Email</Link>
                            <Link to={''} className="text-white border border-white py-[8px] px-[4px] hover:bg-white hover:text-primary mt-[8px]">Via Telegram</Link>
                        </div>

                        <img className='max-w-full h-auto mx-auto block mt-[10px] rounded-[20px] align-middle' src={state.coin.cover} alt="" />
                    </div>
                </div>
            </div>

            {showModal ? (
                <>
                    <div
                        className="z-[30000000] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 outline-none focus:outline-none"
                    >
                        <div className="bg-primary text-white relative my-6 mx-auto w-[50%]">
                            {/*content*/}
                            <div className={` border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none`}>
                                {/*header*/}
                                <div className={`${hourError ? "block" : "hidden"} w-full bg-green-300 my-[8px] py-[20px] px-[8px]`}>
                                    <p>Thank you for voting! +2 votes :) come back in an hour</p>
                                </div> 
                                <div className="flex  items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className=" text-2xl font-semibold text-center">
                                        {state.coin.name}
                                    </h3>
                                    <button
                                        className="text-primary p-1 ml-auto bg-transparent border-0 text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={handleModalClose}
                                    >
                                        <span className="bg-transparent text-white h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            X
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex w-full flex-col">
                                    <p className='mb-[40px]'>Total Votes: {state.coin.votes}</p>

                                    <ReCAPTCHA className='self-center' sitekey={import.meta.env.VITE_REACT_APP_SITE_KEY} ref={captchaRef} key={recaptchaKey} onChange={setRecaptchaToken} />
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-center p-6 border-t border-solid border-slate-200 rounded-b">
                                    <button onClick={handleVote} className='border border-white py-[6px] px-[50px] bg-primary text-[15px] h-[35px] whitespace-nowrap align-middle rounded-[4px] hover:text-primary hover:bg-white'>
                                        Vote
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </div>
    )
}

export default CoinDetails