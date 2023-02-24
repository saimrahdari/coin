import { onValue, ref } from 'firebase/database'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../../Firebase'
import { GlobalContext } from './GlobalContext'

const Airdrops = () => {
  const navigate = useNavigate()
  const { currentUser } = useContext(GlobalContext)

  const [banner, setBanner] = useState([])
  const [dbUser, setDbUser] = useState([])
  const [airdropData, setAirdropData] = useState([])


  useEffect(() => {
    const userRef = ref(db, 'users/');
    onValue(userRef, snapshot => {
      snapshot.forEach(childSnapshot => {
        if (Object.values(childSnapshot.val()).includes(currentUser.uid)) {
          setDbUser(childSnapshot.val())
        }
      })
    });

  }, [currentUser])

  useEffect(() => {
    const AirdropRef = ref(db, '/airdrops');
    onValue(AirdropRef, (snapshot) => {
      let AirdropList = [];
      snapshot.forEach(childSnapshot => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        AirdropList.push({ key: childKey, airdrop: childData });
      });

      AirdropList.sort((a, b) => b.coin.vote - a.coin.vote);

      setAirdropData(AirdropList);
    }, (error) => console.log(error))
  }, [currentUser]);

  const upVote = (e, airdrop) => {
    e.stopPropagation();
    if (currentUser.length <= 0) {
      alert("please login to vote");
    }
    else if (!airdrop.airdrop.voteBy.includes(currentUser.uid)) {
      let airdropvote = airdrop.airdrop.voteBy
      airdropvote.push(currentUser.uid)
      update(ref(db, `/coins/${airdrop.key}`), {
        votes: airdrop.airdrop.votes + 1,
        voteBy: airdropvote
      })
    }
    else {
      alert("Cannot vote");
    }
  }

  return (
    <div className='mt-[120px] items-center flex justify-center w-full flex-col'>
      {
        banner.length > 0 ?

          <div className='bg-secondary text-white px-[8px] border-[3px] border-primary rounded-[5px] flex flex-row w-full items-center gap-x-[140px]'>
            <h1 className=''>Logo</h1>
            <div className=' py-[8px]  flex flex-col justify-center items-center'>
              <img src={banner[0].image} className={"w-full "} alt="" />
            </div>
          </div> :
          <div className='bg-secondary text-white border-[3px] border-primary rounded-[5px] flex flex-row w-full md:w-full lg:w-[50%] items-center gap-x-[140px]'>
            <h1 className=''>Logo</h1>
            <div className=' py-[8px]  flex flex-col justify-center items-center'>
              <h2 className='text-[1.5rem] font-medium'>YOUR BANNER HERE</h2>
              <h2 className='text-white text-[1rem] font-medium'>www.coinvote.cc</h2>
            </div>
          </div>
      }
      <div className='w-full flex mt-[20px] px-[8px] md:w-[80%] flex-col'>
        <h1 className='text-[2.5rem] font-bold text-primary'>Ongoing Airdrops</h1>
        <h1 className='text-[1.5rem] font-medium text-black'>Listed below are all the exclusive crypto airdrops : cryptocurrencies, tokens and other cryptoassets.</h1>
        <table className='w-full border-[5px] border-secondary bg-primary text-center'>
          <thead>
            <tr className='w-full border-b border-b-white h-[30px] text-[10px] text-white'>
              <td className='align-middle table-cell text-[10px] h-[5px] text-white'></td>
              <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Name</td>
              <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Status</td>
              <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Start</td>
              <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>End</td>
              <td className='align-middle table-cell text-[10px] h-[5px] text-white'>Rewards</td>
              <td className='align-middle table-cell text-[10px] h-[5px] text-white'>Votes</td>
            </tr>
          </thead>
          <tbody>
            {
              airdropData.map(airdrop => (

                <tr key={airdrop.key} onClick={() => navigate(`/airdrop/${airdrop.airdrop.name}`, { state: airdrop })} className='border-b border-b-white  hover:bg-secondary h-[70px] cursor-pointer w-full border-spacing-[10px] text-white text-center'>
                  <td className='group align-middle table-cell text-[16px] text-primary'>
                    <div className='ml-[18px] w-[50px] h-[50px] overflow-hidden rounded-[50%]'>
                      <img src={airdrop.airdrop.Logo} alt="" />
                    </div>
                  </td>
                  <td className='group align-middle table-cell text-[16px] text-white'>
                    <p className='text-white font-extrabold'>{airdrop.airdrop.name}<br /> <span className='text-[12px] font-medium'>{airdrop.airdrop.shortDescription}</span></p>
                  </td>
                  <td className='hidden md:table-cell align-middle text-[16px] text-white'>{airdrop.airdrop.status}</td>
                  <td className='hidden md:table-cell align-middle text-[16px] text-white'>{airdrop.airdrop.startDate}</td>
                  <td className='hidden md:table-cell align-middle text-[16px] text-white'>{airdrop.airdrop.endDate}</td>
                  <td className='hidden md:table-cell align-middle text-[16px] text-white'>{airdrop.airdrop.rewards}</td>
                  <td onClick={(e) => upVote(e, airdrop)} className='align-middle text-[16px] text-white'>
                    <button className='hover:bg-redPrimary font-extrabold min-w-[80px] text-center border-[2px] border-redPrimary bg-primary rounded-[7px] p-[10px] text-white' style={{ lineHeight: 1.5 }}>
                      <div className='flex flex-row justify-evenly items-start align-middle'>
                        <svg className='mt-[3px]' width="15" height="16" viewBox="0 0 18 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0L0.339747 15L17.6603 15L9 0ZM10.5 34L10.5 13.5L7.5 13.5L7.5 34L10.5 34Z" fill="currentColor" /></svg>
                        <p className='ml-[2px]'>{airdrop.airdrop.votes}</p>
                      </div>
                    </button>
                  </td>
                </tr>
              ))

            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Airdrops