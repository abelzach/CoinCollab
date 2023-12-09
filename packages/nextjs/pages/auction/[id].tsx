
import img from '../../public/background.jpg';
import Image from 'next/image'
import React, { useEffect, useState } from 'react';
import { EtherInput } from "~~/components/scaffold-eth";
import { useRouter } from 'next/router';
import { useContractRead } from 'wagmi'
import RoscaGroup from '../../abis/RoscaGroup.json';

let stage = 1;
export default function Home() {
  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(24);
  const [seconds, setSeconds] = useState(48);
  const [ethAmount, setEthAmount] = useState("");

  let bidHigh = 345;
  let round = 12;

  const router = useRouter();
  const groupAddressValue = String(router.query.id);
  console.log(groupAddressValue);

  const { data:group, isError, isLoading } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getGroupDetails',
  })
  console.log(group);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update the values
      setSeconds((prevSeconds) => (prevSeconds === 0 ? 59 : prevSeconds - 1));
      setMinutes((prevMinutes) => (seconds === 0 ? prevMinutes - 1 : prevMinutes));
      setHours((prevHours) => (minutes === 0 && seconds === 0 ? prevHours - 1 : prevHours));

      // Ensure values are between 0 and 99
      setSeconds((prevSeconds) => (prevSeconds < 0 ? 59 : prevSeconds));
      setMinutes((prevMinutes) => (prevMinutes < 0 ? 59 : prevMinutes));
      setHours((prevHours) => (prevHours < 0 ? 99 : prevHours));
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [seconds, minutes, hours]);
  return (
    <div 
      style={{
      backgroundImage: `url(${img.src})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      height: '100vh', 
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      }}
    >
      
      <div className='relative z-10 flex-col'>
        {/* <h2 className="mt-10 animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent ml-72 mb-10 text-5xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl ">Welcome to ROSCA DApp</h2> */}
        <center>
            <h2 className=" pt-4 text-4xl font-bold dark:text-white">Time remaining</h2>
            <div className=' mt-4'>
                {
                    stage ?
                        <div className="flex justify-center items-center">
                            <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                    <span style={{ '--value': hours }}>{hours.toString().padStart(2, '0')}</span>:
                                    </span>
                                    hours
                                </div> 
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                    <span style={{ '--value': minutes }}>{minutes.toString().padStart(2, '0')}</span>:
                                    </span>
                                    min
                                </div> 
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                    <span style={{ '--value': seconds }}>{seconds.toString().padStart(2, '0')}</span>   
                                    </span>
                                    sec
                                </div>
                            </div>  
                        </div>
                    :
                    <div className="flex justify-center items-center">
                        <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
                            <div className="flex flex-col">
                                <span className="countdown font-mono text-5xl">
                                <span style={{"--value":0}}></span>
                                </span>
                                hours
                            </div> 
                            <div className="flex flex-col">
                                <span className="countdown font-mono text-5xl">
                                <span style={{"--value":0}}></span>
                                </span>
                                min
                            </div> 
                            <div className="flex flex-col">
                                <span className="countdown font-mono text-5xl">
                                <span style={{"--value":0}}></span>
                                </span>
                                sec
                            </div>
                            </div>
                    </div>
                }
                
                {
                    stage ?
                    <div className="mt-2 badge badge-primary">Remaining time extends with 10min after the last bid</div>
                    :
                    <div className="mt-2 badge badge-primary">Bidding over</div>
                }
                <div className='flex-col'>
                <div className="mt-2 stats  border-gray-100 bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30">
                <div className="stat">
                    <div className="stat-figure text-primary">
                    </div>
                    <div className="stat-value text-primary">Group ID : {group?.id.toString()}</div>
                     <div className="stat-title">Round : {round}</div>
                </div>
            </div>
            </div>

            {
                stage ? 
                    <div className="card w-2/3 mt-4 shadow-xl border-gray-100 bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30 text-neutral-content">
                        <div className="card-body  text-center">
                            <h2 className=" card-title text-white">Bidding Stage <div className="ml-2  badge badge-xs">Reserve not met. May still get sold</div></h2>
                                
                            <p className=" mt-0 text-left text-white font-normal">
                                Current highest Bid : <span className="text-3xl font-extrabold">${bidHigh}</span>
                            </p>

                            <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />

                            <div className="card-actions justify-end">
                            <button className="btn btn-primary">Place Bid</button>
                            </div>
                        </div>
                    </div>
                    
                :
                    <div className="card w-2/3 mt-4 shadow-xl border-gray-100 bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30 text-neutral-content">
                        <div className="card-body  text-center">
                            <div className='flex flex-row  '>
                            <h2 className=" card-title text-white">Reveal Stage</h2>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-2 w-6 h-6 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            </div>
                                <p className="text-white mt-0 text-left  flex-grow font-normal">
                                    Highest Bid : <span className="text-3xl font-extrabold">${bidHigh}</span> 
                                </p>
                            <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />
                            <div className="card-actions justify-end">
                            <button className="btn btn-primary">Verify</button>
                            </div>
                        </div>
                    </div>
            }

            </div>
            <div className='mt-2 flex flex-row items-center justify-center '>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg> 
            <p className='pl-2 text-sm'> <span className="underline">Watch</span> : (14 Watchers)</p>  
            </div>
        </center>
      </div>
    </div>
  )
}
