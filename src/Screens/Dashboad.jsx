import { onValue, push, ref, set, update } from 'firebase/database'
import React, { useContext, useEffect, useState } from 'react'
import { DateObject } from 'react-multi-date-picker'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../../Firebase'
import { GlobalContext } from './GlobalContext'




const coinType = [
    {
        name: "All",
        image: ""
    },
    {
        name: "BSC",
        image: "https://coinvote.cc/template/images/bsc.png"
    },
    {
        name: "ETH",
        image: "https://coinvote.cc/template/images/ethereum.png"
    },
    {
        name: "TRX",
        image: "https://coinvote.cc/template/images/tron.png"
    },
    {
        name: "KCC",
        image: "https://coinvote.cc/template/images/kcc.png"
    },
    {
        name: "MATRIC",
        image: "https://coinvote.cc/template/images/polygon.png"
    },
    {
        name: "SOL",
        image: "https://coinvote.cc/template/images/solana.png"
    },
    {
        name: "ADA",
        image: "https://coinvote.cc/template/images/ada.png"
    },
    {
        name: "AVAX",
        image: "https://coinvote.cc/template/images/avax.png"
    },
    {
        name: "FTM",
        image: "https://coinvote.cc/template/images/ftm.png"
    },
    {
        name: "ARBITRUM",
        image: "https://coinvote.cc/template/images/arbitrum.png"
    }
];

const Dashboad = () => {
    const navigate = useNavigate()
    const [coins, setCoins] = useState('promoted')
    const [allCoins, setAllCoins] = useState('alltime')
    const [type, setType] = useState(0)
    const [typeName, setTypeName] = useState("All")
    const [coinsData, setCoinsData] = useState([])
    const [filteredCoins, setFilteredCoins] = useState([])
    const [Typefiltered, setTypeFiltered] = useState([])
    const [promotionData, setPromotionData] = useState([])
    const [promotedCoin, setPromotedCoin] = useState([])
    const [dbUser, setDbUser] = useState([])
    const [banner, setBanner] = useState([])
    const [trending, setTrending] = useState([])
    const [recently, setRecently] = useState([])
    const [price, setPrice] = useState([])
    const { currentUser } = useContext(GlobalContext)
    const todayDate = new DateObject()

    const dateDifference = (endDate) => {
        const currentDate = new Date();
        const targetDate = new Date(endDate);
        const timeDiff = currentDate.getTime() - targetDate.getTime();
        const diffMonths = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30.44));
        return diffMonths
    }

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
        const CoinsRef = ref(db, '/coins');
        onValue(CoinsRef, (snapshot) => {
            let coinList = [];
            snapshot.forEach(childSnapshot => {
                const childKey = childSnapshot.key;
                const childData = childSnapshot.val();
                childData.addedDate = JSON.parse(childData.addedDate)
                childData.addedDate = new DateObject(childData.addedDate)
                coinList.push({ key: childKey, coin: childData });
            });
            setCoinsData(coinList);
            setFilteredCoins(coinList)
            setTypeFiltered(coinList)
            const trendingList = coinList.slice().sort(function (a, b) {
                return b.coin.votes - a.coin.votes;
            }).slice(0, 3);
            setTrending(trendingList);


            const priceList = coinList.slice().sort(function (a, b) {
                return b.coin.price - a.coin.price;
            }).slice(0, 3);
            setPrice(priceList);


            const recentlyList = coinList.slice().sort(function (a, b) {
                return b.coin.addedDate - a.coin.addedDate;
            }).slice(0, 3);
            setRecently(recentlyList);


        }, (error) => console.log(error))
    }, [currentUser]);


    useEffect(() => {
        const promotionRef = ref(db, '/promoted');
        onValue(promotionRef, (snapshot) => {
            let promotionList = [];
            let bannerList = [];
            let voteList = [];
            snapshot.forEach(childSnapshot => {
                const childData = childSnapshot.val();
                if (JSON.parse(childData.promoted).length > 0) {
                    promotionList.push(childData);
                }
                if (JSON.parse(childData.banner).length > 0) {
                    bannerList.push({ date: JSON.parse(childData.banner), image: childData.bannerImage, url: childData.bannerURL });

                }
                if (childData.voteImage !== "") {
                    voteList.push(JSON.parse(childData.vote));
                }
            });

            const newArr = promotionList.map((obj) => {
                const newPromoted = JSON.parse(obj.promoted).map((timestamp) => new DateObject(timestamp));
                return { ...obj, promoted: newPromoted };
            });

            const filteredData = newArr.filter(item => {
                let matchFound = false;
                item.promoted.forEach(date => {
                    if (date.day === todayDate.day && date.month.number === todayDate.month.number && date.year === todayDate.year) {
                        matchFound = true;
                    }
                });
                return matchFound;
            });

            setPromotionData(filteredData);

            const updatedBannerList = bannerList.map(item => {
                item.date = item.date.map(date => new DateObject(date));
                return item;
            });
            // let temp2 = voteList.flat();
            // voteList= temp2.map(ban => new DateObject(ban));
            const matchedData = updatedBannerList.filter(item => {
                return item.date.some(date => date.day === todayDate.day && date.month.number === todayDate.month.number && date.year === todayDate.year);
            });
            setBanner(matchedData);
        }, (error) => console.log(error))
    }, [currentUser, coinsData]);

    useEffect(() => {
        if (promotionData.length > 0) {
            const result = coinsData.filter(coin => {
                return promotionData.some(coin2 => {
                    return coin.key === coin2.coin && coin2.promoted.length > 0
                });
            });
            setPromotedCoin(result)
        }
    }, [promotionData, coinsData])



    const IsFav = (coin) => {
        return dbUser.fav && dbUser.fav.includes(coin.key);
    }

    const handleFav = (e, coin) => {

        e.stopPropagation();

        let favs = dbUser.fav
        if (favs.includes(coin.key)) {
            favs = favs.filter(e => e != coin.key)
        } else {
            favs.push(coin.key)
        }
        set(ref(db, `users/${currentUser.uid}/fav`), favs)
    }


    const upVote = (e, coin) => {
        e.stopPropagation();
        if (currentUser.length <= 0) {
            alert("please login to vote");
        }
        else if (!coin.coin.voteBy.includes(currentUser.uid)) {
            let coinvote = coin.coin.voteBy
            coinvote.push(currentUser.uid)
            update(ref(db, `/coins/${coin.key}`), {
                votes: coin.coin.votes + 1,
                voteBy: coinvote
            })
        }
        else {
            alert("Cannot vote");
        }
    }

    const filterCoins = (type1) => {
        filterSymbol(type, typeName)
        if (type1 === 'all') {
            setFilteredCoins(coinsData)
        } else {
            setFilteredCoins(
                coinsData.filter(coin => coin.coin.type === type1)
            );
        }
    }

    useEffect(() => {
        console.log(coinType[0]);
        filterSymbol(type, coinType[0]);
    }, [filteredCoins]);

    const filterSymbol = (index, name) => {
        setType(index)
        setTypeName(name);
        if (name.name === "All") {
            setTypeFiltered(filteredCoins)
        } else {
            setTypeFiltered(
                filteredCoins.filter(coin => coin.coin.chain === name.name)
            );
        }
    }

    return (
        <div className='mt-[120px] items-center flex justify-center w-full flex-col'>
            <div className='w-full px-[8px] md:w-[80%] gap-y-3 flex flex-row justify-between flex-wrap'>
                <div className='w-full md:w-full lg:w-[50%] flex flex-col'>
                    <h1 className='text-[2.5rem] font-bold'>Today's Most Voted</h1>
                    <h1 className='text-[1.5rem] font-medium'>Find the best coins of the last 24 hours</h1>
                </div>
                {
                    banner.length > 0 ?

                        <div className='bg-[#262626] text-primary px-[8px] border-[3px] border-[#211f1f] rounded-[5px] flex flex-row w-full md:w-full lg:w-[50%] items-center gap-x-[140px]'>
                            <h1 className=''>Logo</h1>
                            <div className=' py-[8px]  flex flex-col justify-center items-center'>
                                <img src={banner[0].image} className={"w-full "} alt="" />
                            </div>
                        </div> :
                        <div className='bg-[#262626] text-primary px-[8px] border-[3px] border-[#211f1f] rounded-[5px] flex flex-row w-full md:w-full lg:w-[50%] items-center gap-x-[140px]'>
                            <h1 className=''>Logo</h1>
                            <div className=' py-[8px]  flex flex-col justify-center items-center'>
                                <h2 className='text-[1.5rem] font-medium'>YOUR BANNER HERE</h2>
                                <h2 className='text-white text-[1rem] font-medium'>www.coinvote.cc</h2>
                            </div>
                        </div>
                }
            </div>
            <div className='w-full flex mt-[20px] px-[8px] md:w-[80%] flex-col'>
                <ul className=' overflow-x-auto overflow-y-hidden whitespace-nowrap flex gap-x-2'>
                    <li onClick={() => setCoins("promoted")} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${coins === "promoted" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Promoted Coins
                        </p>
                    </li>
                    <li onClick={() => setCoins("certified")} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${coins === "certified" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Certified Coins
                        </p>
                    </li>
                </ul>
                <table className='w-full border-[5px] border-[#393939] bg-[#262626] text-center'>
                    <thead>
                        <tr className='w-full border-b border-b-[#5c5c5c] h-[30px] text-[10px] text-white'>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'></td>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'></td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Chain</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>24th</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Market Cap</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Since Launch</td>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'>Votes</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Daily Rank</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            promotedCoin.map(coin => (

                                <tr onClick={() => navigate(`/coin/${coin.coin.name}`, { state: coin })} className='border-b border-b-[#5c5c5c]  hover:bg-[#3f3f3f] h-[70px] cursor-pointer w-full border-spacing-[10px] text-white text-center'>
                                    <td onClick={(e) => handleFav(e, coin)} className='group align-middle table-cell text-[16px] text-primary'>
                                        <div className='flex flex-row w-full justify-center items-center'>
                                            <svg className={` ${IsFav(coin) ? "text-red-500" : "text-white"} group-hover:opacity-100 inline opacity-0  mr-[15px]`} width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5738 1.49576C19.8981 -0.784512 15.9186 -0.374356 13.4625 2.15982L12.5006 3.15104L11.5387 2.15982C9.08751 -0.374356 5.10314 -0.784512 2.42736 1.49576C-0.639049 4.11295 -0.800182 8.81022 1.94396 11.6471L11.3922 21.403C12.0026 22.0329 12.9938 22.0329 13.6041 21.403L23.0524 11.6471C25.8014 8.81022 25.6402 4.11295 22.5738 1.49576Z" fill="currentColor" /></svg>
                                            <div className='w-[30px] h-[30px] overflow-hidden rounded-[50%]'>
                                                <img src={coin.coin.coinLogo} alt="" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='group align-middle table-cell text-[16px] text-primary'>
                                        <p className='text-primary font-extrabold'>{coin.coin.name}<br /> <span className='text-[12px] font-medium'>${coin.coin.symbol}</span></p>
                                    </td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{coin.coin.chain}</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{ }</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{coin.coin.cap}</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{`${dateDifference(coin.coin.launchDate)} Months`}</td>
                                    <td onClick={(e) => upVote(e, coin)} className='align-middle text-[16px] text-primary'>
                                        <button className='hover:bg-[#e2c574] font-extrabold min-w-[80px] text-center border-[2px] border-[#e2c574] bg-[#262626] rounded-[7px] p-[10px] text-white' style={{ lineHeight: 1.5 }}>
                                            <div className='flex flex-row justify-evenly items-start align-middle'>
                                                <svg className='mt-[3px]' width="15" height="16" viewBox="0 0 18 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0L0.339747 15L17.6603 15L9 0ZM10.5 34L10.5 13.5L7.5 13.5L7.5 34L10.5 34Z" fill="currentColor" /></svg>
                                                <p className='ml-[2px]'>{coin.coin.votes}</p>
                                            </div>
                                        </button>
                                    </td>
                                    <td className='hidden md:table-cell align-middle text-center text-[16px] text-primary'>{coin.coin.rank}</td>
                                </tr>
                            ))

                        }
                    </tbody>
                </table>
                <div className='w-full justify-center items-center flex my-[12px]'>
                    <Link to={"/advertise"} className="uppercase font-bold rounded-[50px] border-none align-middle text-center text-[15px] bg-[#fff] hover:bg-[#e9cc81] text-[#262626] hover:text-white  py-[6px] px-[12px] block">Advertise With Us</Link>
                </div>
            </div>

            <div className='flex flex-row gap-x-[18px] justify-start px-[8px] mt-[20px] md:w-[80%] w-full flex-wrap gap-y-3'>
                <div className='w-full md:w-[32%] bg-[#302e2a] p-[14px] rounded-[0.375rem] border-[2px] border-[#3e3a30] flex-col gap-y-2'>
                    <div className='w-full flex justify-between items-center flex-row'>
                        <h4 className='text-[18px] my-[10px]]'>🔥 Trending</h4>
                        <div class="group relative flex justify-center">
                            <span class="absolute top-10 scale-0 rounded bg-black p-2 text-xs w-[250px] text-white group-hover:scale-100">The trending section is based on a voting scores</span>
                            <button class="min-w-[20px] h-[20px] text-black rounded-[50%] bg-white">i</button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                        {
                            trending.map(coin => (
                                <div onClick={() => navigate(`/coin/${coin.coin.name}`, { state: coin })} key={coin.key} className='hover:text-[#646464] text-primary flex flex-row w-full cursor-pointer'>
                                    <div className='group w-[30px] h-[30px] overflow-hidden rounded-[50%]'>
                                        <img src={coin.coin.coinLogo} alt="" />
                                    </div>
                                    <div className='flex flex-row gap-x-1 items-center'>
                                        <p className='text-[16px] font-semibold'>{coin.coin.name}</p>
                                        <p className=''>{coin.coin.symbol}</p>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </div>

                <div className='w-full md:w-[32%] bg-[#302e2a] p-[14px] rounded-[0.375rem] border-[2px] border-[#3e3a30] flex-col gap-y-2'>
                    <div className='w-full flex justify-between items-center flex-row'>
                        <h4 className='text-[18px] my-[10px]]'>🌕 Top gainers</h4>
                        <div class="group relative flex justify-center">
                            <span class="absolute top-10 scale-0 rounded bg-black p-2 text-xs w-[250px] text-white group-hover:scale-100">Top ganers are based on the biggest price.</span>
                            <button class="min-w-[20px] h-[20px] text-black rounded-[50%] bg-white">i</button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                        {
                            price.map(coin => (
                                <div onClick={() => navigate(`/coin/${coin.coin.name}`, { state: coin })} key={coin.key} className='hover:text-[#646464] text-primary flex flex-row w-full cursor-pointer'>
                                    <div className='group w-[30px] h-[30px] overflow-hidden rounded-[50%]'>
                                        <img src={coin.coin.coinLogo} alt="" />
                                    </div>
                                    <div className='flex flex-row gap-x-1 items-center'>
                                        <p className='text-[16px] font-semibold'>{coin.coin.name}</p>
                                        <p className=''>{coin.coin.symbol}</p>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </div>
                <div className='w-full md:w-[32%] bg-[#302e2a] p-[14px] rounded-[0.375rem] border-[2px] border-[#3e3a30] flex-col gap-y-2'>
                    <div className='w-full flex justify-between items-center flex-row'>
                        <h4 className='text-[18px] my-[10px]]'>✨ Recently added</h4>
                        <div class="group relative flex justify-center">
                            <span class="absolute top-10 scale-0 rounded bg-black p-2 text-xs w-[250px] text-white group-hover:scale-100">recently added highlights recently listed projects on Coinvote to give everyone a chance to be seen</span>
                            <button class="min-w-[20px] h-[20px] text-black rounded-[50%] bg-white">i</button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                        {
                            recently.map(coin => (
                                <div onClick={() => navigate(`/coin/${coin.coin.name}`, { state: coin })} key={coin.key} className='hover:text-[#646464] text-primary flex flex-row w-full cursor-pointer'>
                                    <div className='group w-[30px] h-[30px] overflow-hidden rounded-[50%]'>
                                        <img src={coin.coin.coinLogo} alt="" />
                                    </div>
                                    <div className='flex flex-row gap-x-1 items-center'>
                                        <p className='text-[16px] font-semibold'>{coin.coin.name}</p>
                                        <p className=''>{coin.coin.symbol}</p>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-x-[18px] justify-start px-[8px] mt-[20px] md:w-[80%] w-full flex-wrap'>
                {coinType.map((coin, index) => (
                    <div onClick={() => filterSymbol(index, coin)} className={`flex flex-row gap-x-3 cursor-pointer mb-[3px] text-white p-[10px] border-[2px] border-primary w-auto   ${type === index ? "bg-primary" : "bg-[#262626]"} `}>
                        <img src={coin.image} alt="" />
                        <p>{coin.name}</p>
                    </div>
                ))}
            </div>




            <div className='w-full flex mt-[20px] px-[8px] md:w-[80%] flex-col'>
                <ul className=' overflow-x-auto overflow-y-hidden whitespace-nowrap flex gap-x-2 flex-wrap'>
                    <li onClick={() => { setAllCoins("alltime"); filterCoins("all") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "alltime" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            ALL Time
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("today"); filterCoins("today") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "today" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Today
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("trending"); filterCoins("trending") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "trending" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Trending
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("presales"); filterCoins("presales") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "presales" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Presales
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("soon"); filterCoins("soon") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "soon" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            soon Launch
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("new"); filterCoins("new") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "new" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            New
                        </p>
                    </li>
                    <li onClick={() => { setAllCoins("blocklist"); filterCoins("blocklist") }} className='mt-[5px] border-b-[4px] border-b-[#211f1f] inline-block mr-[2px] border-[5px] border-t-[#494949] border-l-[#211f1f] border-r-[#3c3c3c]'>
                        <p className={`${allCoins === "blocklist" ? "bg-[#262626] text-white" : "bg-[#303032] text-primary"} text-[18px]  cursor-pointer block px-[20px] py-[10px] rounded-t-[3px]`}>
                            Blocklist
                        </p>
                    </li>
                </ul>
                <table className='w-full border-[5px] border-[#393939] bg-[#262626] text-center'>
                    <thead>
                        <tr className='w-full border-b border-b-[#5c5c5c] h-[30px] text-[10px] text-white'>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'></td>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'></td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Chain</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>24th</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Market Cap</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Since Launch</td>
                            <td className='align-middle table-cell text-[10px] h-[5px] text-white'>Votes</td>
                            <td className='hidden md:table-cell align-middle text-[10px] h-[5px] text-white'>Daily Rank</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Typefiltered.map(coin => (
                                <tr onClick={() => navigate(`/coin/${coin.coin.name}`, { state: coin })} className='border-b border-b-[#5c5c5c]  hover:bg-[#3f3f3f] h-[70px] cursor-pointer w-full border-spacing-[10px] text-white text-center'>
                                    <td onClick={(e) => handleFav(e, coin)} className='group align-middle table-cell text-[16px] text-primary'>
                                        <div className='flex flex-row w-full justify-center items-center'>
                                            <svg className={` ${IsFav(coin) ? "text-red-500" : "text-white"} group-hover:opacity-100 inline opacity-0  mr-[15px]`} width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5738 1.49576C19.8981 -0.784512 15.9186 -0.374356 13.4625 2.15982L12.5006 3.15104L11.5387 2.15982C9.08751 -0.374356 5.10314 -0.784512 2.42736 1.49576C-0.639049 4.11295 -0.800182 8.81022 1.94396 11.6471L11.3922 21.403C12.0026 22.0329 12.9938 22.0329 13.6041 21.403L23.0524 11.6471C25.8014 8.81022 25.6402 4.11295 22.5738 1.49576Z" fill="currentColor" /></svg>
                                            <div className='w-[30px] h-[30px] overflow-hidden rounded-[50%]'>
                                                <img src={coin.coin.coinLogo} alt="" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='group align-middle table-cell text-[16px] text-primary'>
                                        <p className='text-primary font-extrabold'>{coin.coin.name}<br /> <span className='text-[12px] font-medium'>${coin.coin.symbol}</span></p>
                                    </td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{coin.coin.chain}</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{ }</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{coin.coin.cap}</td>
                                    <td className='hidden md:table-cell align-middle text-[16px] text-primary'>{`${dateDifference(coin.coin.launchDate)} Months`}</td>
                                    <td onClick={(e) => upVote(e, coin)} className='align-middle text-[16px] text-primary'>
                                        <button className='hover:bg-[#e2c574] font-extrabold min-w-[80px] text-center border-[2px] border-[#e2c574] bg-[#262626] rounded-[7px] p-[10px] text-white' style={{ lineHeight: 1.5 }}>
                                            <div className='flex flex-row justify-evenly items-start align-middle'>
                                                <svg className='mt-[3px]' width="15" height="16" viewBox="0 0 18 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0L0.339747 15L17.6603 15L9 0ZM10.5 34L10.5 13.5L7.5 13.5L7.5 34L10.5 34Z" fill="currentColor" /></svg>
                                                <p className='ml-[2px]'>{coin.coin.votes}</p>
                                            </div>
                                        </button>
                                    </td>
                                    <td className='hidden md:table-cell align-middle text-center text-[16px] text-primary'>{coin.coin.rank}</td>
                                </tr>
                            ))

                        }
                    </tbody>
                </table>
            </div>

            <div className='flex flex-row justify-center items-center gap-[10px] px-[8px] mt-[20px] md:w-[80%] w-full flex-wrap'>
                <div className='w-full md:w-[45%] justify-center items-center flex flex-col p-[10px] bg-[#262626] rounded-[10px]'>
                    <h1 className='mt-[20px] mb-[10px] text-[30px] font-medium'>List Your Coin</h1>
                    <p>Not listed yet? Apply right now and attract investors!</p>
                    <p>Ask your community to vote and you will grow!</p>
                    <button onClick={() => navigate("/add-coin")} className='border border-primary py-[6px] mt-[12px] px-[12px] bg-[#262626] text-[15px] h-[35px] whitespace-nowrap align-middle rounded-[4px] hover:text-background hover:bg-primary'>
                      Submit Coin
                  </button>
                </div>
                <div className='w-full md:w-[45%] justify-center items-center flex flex-col p-[10px] bg-[#262626] rounded-[10px]'>
                    <h1 className='mt-[20px] mb-[10px] text-[30px] font-medium'>Trending on Socials</h1>
                    <p>Discover now the super active tokens on social networks!</p>
                    <p>You can rely votes on a reliable indicator!</p>
                    <button onClick={() => navigate("/")} className='border border-primary py-[6px] mt-[12px] px-[12px] bg-[#262626] text-[15px] h-[35px] whitespace-nowrap align-middle rounded-[4px] hover:text-background hover:bg-primary'>
                      Submit Coin
                  </button>
                </div>
            </div>

            <div className='flex flex-row justify-center items-center gap-[10px] px-[8px] mt-[20px] md:w-[80%] w-full flex-wrap'>
                <div className='w-full md:w-[45%] justify-center flex flex-col'>
                    <h1 className='mt-[20px] mb-[10px] text-[30px] font-medium'>Find the next moon shot first</h1>
                    <p>You've probably already asked yourself how to be ahead of the others and bet on the winning token. Thanks to coinvote.cc and our daily listing of new tokens, be early and join a project that hasn't been listed on major exchanges like CoinMarketCap, CoinGecko and others!</p>
                    <br />
                    <p>Disclaimer: before investing always do your own research (DYOR)! A token listed on coinvote.cc does NOT mean we guarantee the project reliability, they could be scams. Be careful with your investments.</p>
                </div>
                <div className='w-full md:w-[45%] justify-center text-right items-end flex flex-col'>
                    <h1 className='mt-[20px] mb-[10px] text-[30px] font-medium'>How it works?</h1>
                    <p>Every project can be listed by 
                    <Link className='text-primary' to={"/add-coin"}> Applying Here </Link>
                    . After verification within 24 hours, we validate it or not. If it is accepted, it instantly become visible on the New Coins section. The coin will also be visible on all section and you will be able to vote for it.</p>
                    <br />
                    <p>Ask your community to vote for your project to attract the interest of all our visitors and investors! The more votes you have, the more visibility you get. On average promoted coins have three times more visitors: aim for the top!</p>
                    <br />
                    <p><b>Note on voting:</b> You can vote up to two times per hour, the votes are added to those of the Today and the All Time section.</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboad


// Link to={banner[0].url} className='bg-[#262626] text-primary px-[8px] border-[3px] border-[#211f1f] rounded-[5px] flex flex-row w-full md:w-full lg:w-[50%] items-center gap-x-[140px]'>
//                             <h1 className=''>ads</h1>
//                             <div className=' py-[8px]  flex flex-col justify-center items-center'>
//                                 <img src={banner[0].image} className={"w-full "} alt="" />
//                             </div>
//                         </Link> :