import { ref, set, update } from 'firebase/database';
import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { db } from '../../Firebase';
import { GlobalContext } from './GlobalContext';
import Facebook from '../assets/facebook.png'
import Twitter from '../assets/twitter.png'
import Telegram from '../assets/telegram.png'
import Youtube from '../assets/youtube.png'
import Reddit from '../assets/reddit.png'
import Discord from '../assets/discord.png'

const AirdropDetails = () => {
  const navigate = useNavigate()
  const { state } = useLocation();
  const [dbUser, setDbUser] = useState([])
  const { currentUser } = useContext(GlobalContext)

  const upVote = () => {
    if (currentUser == undefined) {
      alert("No user please login");
    }
    else if (!state.airdrop.voteBy.includes(currentUser.uid)) {

      update(ref(db, `/airdrops/${state.key}`), {
        votes: state.airdrop.votes + 1,
        voteBy: [state.airdrop.voteBy]
      })

      let valueBy = state.airdrop.voteBy
      valueBy.push(currentUser.uid)
      set(ref(db, `airdrops/${state.key}/voteBy`), valueBy)
    }
    else {
      alert("Cannot vote");
    }
  }
  return (
    <div className='mt-[120px] items-center flex justify-center w-full flex-col'>

      <div className='w-full flex items-center justify-center'>
        <Link to={'/advertise'} className='bg-primary text-white px-[8px] border-[3px] border-secondary rounded-[5px] flex flex-row w-full md:w-full lg:w-[40%] items-center gap-x-[140px]'>
          <h1 className=''>Logo</h1>
          <div className=' py-[8px]  flex flex-col justify-center items-center'>
            <h2 className='text-[1.5rem] font-medium'>YOUR BANNER HERE</h2>
            <h2 className='text-white text-[1rem] font-medium'>www.cionvote.cc</h2>
          </div>
        </Link>
      </div>

      <div className='md:w-[80%] w-full my-[20px] rounded-[12px] pt-[20px] pb-[30px] px-[5px] bg-primary border-[5px] border-secondary '>
        <div onClick={() => navigate("/")} className='inline-flex cursor-pointer flex-row items-center gap-x-[8px] text-white p-[20px] hover:text-hover'>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4965 18.1877L10.5055 19.1787C10.0859 19.5983 9.40743 19.5983 8.9923 19.1787L0.314697 10.5055C-0.104899 10.0859 -0.104899 9.40743 0.314697 8.9923L8.9923 0.314697C9.4119 -0.104899 10.0904 -0.104899 10.5055 0.314697L11.4965 1.30566C11.9205 1.72972 11.9116 2.4216 11.4786 2.83674L6.09977 7.96117H18.9287C19.5224 7.96117 20 8.43879 20 9.03247V10.4609C20 11.0546 19.5224 11.5322 18.9287 11.5322H6.09977L11.4786 16.6566C11.9161 17.0718 11.925 17.7636 11.4965 18.1877Z" fill="currentColor" /></svg>
          <p>Go back</p>
        </div>

        <div className='w-full flex flex-row flex-wrap gap-x-1 justify-between px-[10px]'>

          {/* LEFT SIDE */}
          <div className='w-full md:w-[72%] bg-secondary rounded-[15px] p-[15px] '>
            <div className='flex flex-row'>
              <img src={state.airdrop.Logo} alt="Logo" className='rounded-[50%] max-w-[100px] align-middle w-[100px] h-[100px]' />
              <h1 className='text-white ml-[12px] break-all mt-[20px] mb-[10px] text-[2.5rem] font-bold'>
                {state.airdrop.name}
              </h1>
            </div>
            <hr className='border-[2px] border-primatext-primary my-[20px]' />
            <p className=''>{state.airdrop.description}</p>
            <hr className='border-[2px] border-primatext-primary my-[20px]' />
            <div className='flex justify-center items-center'>
              <button onClick={() => navigate(airdrop.airdrop.website)} className=' font-medium ml-[5px] text-secondary text-[2.5rem] py-[20px] px-[15px] rounded-[8px]' style={{ lineHeight: '20px', animation: 'shadow-pulse 3s infinite', background: "linear-gradient(180deg, white 0, white" }}>
                CLAIM REWARD
              </button>
            </div>
          </div>

          {/* right side */}
          <div className='w-full md:w-[25%] flex flex-col'>
            <div className='flex flex-col w-full gap-0'>
              <div onClick={upVote} className="m-0 min-h-[65px] font-bold min-w-[80px] text-center inline-block w-full text-white hover:text-primary border-[2px] border-white hover:bg-white cursor-pointer align-middle whitespace-nowrap p-[10px]">
                Vote <br />
                <span>{state.airdrop.votes}</span>
              </div>
            </div>

            <div className=' bg-secondary mt-[12px] py-[12px] w-full border-y-[3px] border-white flex flex-col'>
              <div className='flex flex-col mb-[5px] items-center'>
                <p className='text-[15px]'>Start Date</p>
                <p className='text-[15px] font-bold'>{state.airdrop.startDate}</p>
              </div>
              <div className='flex flex-col mb-[5px] items-center'>
                <p className='text-[15px]'>End Date</p>
                <p className='text-[15px] font-bold'>{state.airdrop.endDate}</p>
              </div>
              <div className='flex flex-col mb-[5px] items-center'>
                <p className='text-[15px]'>Rewards</p>
                <p className='text-[15px] font-bold'>{state.airdrop.rewards}</p>
              </div>
            </div>

            <div className='flex flex-col items-center border border-white py-[5px] px-[8px] font-bold bg-secondary text-white rounded-[5px] text-[13px] mt-[20px]'>
              <p className='text-[14px] my-[14px] '>Requirements</p>
            <hr className='w-full border-[1px] border-white text-white mb-[5px]' />
              <div className='flex flex-row w-full gap-x-2 justify-center'>
                <img className={`${state.airdrop.isFacebook ? "block" : "hidden"} w-[12%]`} src={Facebook} alt="" />
                <img className={`${state.airdrop.isTwitter ? "block" : "hidden"} w-[12%]`} src={Twitter} alt="" />
                <img className={`${state.airdrop.isTelegram ? "block" : "hidden"} w-[12%]`} src={Telegram} alt="" />
                <img className={`${state.airdrop.isReddit ? "block" : "hidden"} w-[12%]`} src={Reddit} alt="" />
                <img className={`${state.airdrop.isDiscord ? "block" : "hidden"} w-[12%]`} src={Discord} alt="" />
                <img className={`${state.airdrop.isYoutube ? "block" : "hidden"} w-[12%]`} src={Youtube} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AirdropDetails