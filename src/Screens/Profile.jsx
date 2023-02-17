import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlobalContext } from './GlobalContext'

const Profile = () => {
    const [image, setImage] = useState('https://firebasestorage.googleapis.com/v0/b/coin-ab637.appspot.com/o/profiles%2Fprofile.jpg?alt=media&token=d1c9cf40-4e39-429c-b610-595fd066ff01')
    const {currentUser } = useContext(GlobalContext)

    useEffect(() => {
        if (currentUser != undefined) {
            setImage(currentUser.photoURL)
        }
    }, [currentUser])

    return (
        <div className='mt-[120px] items-center flex justify-center w-full flex-col'>
            <div className='bg-white h-[110px] justify-center px-[12px] max-h-[180px] flex mt-[20px] mx-[50px] md:w-[60%] w-[90%] flex-col'>
                <div className='w-[100px]  h-[100px] overflow-hidden rounded-[50%]'>
                    <img src={image} className={`w-full`} alt="" />
                </div>
            </div>
            <div className='w-full flex mt-[20px] px-[8px] md:w-[80%] flex-col'>
                <ul className=' overflow-x-auto overflow-y-hidden whitespace-nowrap flex gap-x-2'>
                    <li className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={` bg-[#303032] text-primary text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            My Coins
                        </p>
                    </li>
                </ul>
                <div className='w-full border-[5px] border-[#393939] bg-[#262626] text-center'>
                    <div className='w-full table table-fixed border-spacing-[10px] h-[5px] text-[10px] text-white'>
                        <div className='align-middle table-cell text-[10px] h-[5px] text-white'></div>
                        <div className='align-middle table-cell text-[10px] h-[5px] text-white'></div>
                        <div className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Chain</div>
                        <div className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>24th</div>
                        <div className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Market Cap</div>
                        <div className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Since Launch</div>
                        <div className='align-middle table-cell text-[10px] h-[5px] text-white'>Votes</div>
                        <div className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Daily Rank</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile