
import img from '../../public/background.jpg';
import Image from 'next/image'
import React, { useEffect, useState } from 'react';
import { EtherInput } from "~~/components/scaffold-eth";
import { useRouter } from 'next/router';
import { useContractRead } from 'wagmi'
import RoscaGroup from '../../abis/RoscaGroup.json';
import { createClient } from '@supabase/supabase-js'
import { useAccount, useNetwork } from 'wagmi'
import { buildPoseidonOpt as buildPoseidon } from 'circomlibjs';

let stage = 1;
export default function Home() {

    const supabaseUrl = 'https://fymjgxjoigmiobfvqumu.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bWpneGpvaWdtaW9iZnZxdW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIwNjY5NzksImV4cCI6MjAxNzY0Mjk3OX0.Ey1LevWVMi4Pn9lPLYfsouQZkeuFNHtJDrZvrZ7zzDA'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { address, isConnecting, isDisconnected } = useAccount()
    const { chain, chains } = useNetwork()
    console.log("Chain",chain.id)

  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(24);
  const [seconds, setSeconds] = useState(48);
  const [ethAmount, setEthAmount] = useState("");
  const [ethAmount1, setEthAmount1] = useState("");
    let hash = "";
    const testSupabaseConnection = async () => {
    const poseidon = await buildPoseidon();
        hash = poseidon.F.toString(poseidon([
        ethAmount1
        ]));

        // console.log("Hash",hash);
    }
    testSupabaseConnection();
  const router = useRouter();
  const groupAddressValue = String(router.query.id);
  console.log(groupAddressValue);

  const { data:group, isError, isLoading } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getGroupDetails',
  })
//   console.log("here",group.id);
    // console.log("Here",round);
    
  async function handleBidClick(){
        const { data, error } = await supabase
        .from('bids')
        .insert([
            { chain: chain.id, group: parseInt(group?.id), round: parseInt(round) , member: address, bid_hash: hash },
        ])
  }
  async function handleRevealClick(){
        const { data, error } = await supabase
        .from('bids')
        .update([
            { chain: chain.id, group: parseInt(group?.id), round: parseInt(round) , member: address, bid_hash: hash, bid: ethAmount },
        ])
        .eq('group',  parseInt(group?.id))
        .eq('chain',chain.id)
        .eq('round', parseInt(round))
        .eq('member', address)
  }

  let maxDiscount = (parseInt(group?.amount.toString()) / 10**18) * (parseInt(group?.members.toString())) * .75
  console.log("max",maxDiscount);

  const { data:roundStage, Error, Loading } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getCurrentRoundStage',
  })
  console.log("Round stage",roundStage);
  if(roundStage === 1)
    stage = 1;

  const { data:round, ErrorRound, LoadingROund } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getCurrentRound',
  })
  console.log("Round", round);

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
                     <div className="stat-title">Round : {parseInt(round)}</div>
                </div>
            </div>
            </div>

            {
                stage === 0 ? 
                    <div className="card w-2/3 mt-4 shadow-xl border-gray-100 bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30 text-neutral-content">
                        <div className="card-body  text-center">
                            <h2 className=" card-title text-white">Bidding Stage <div className="ml-2 bg-black badge badge-xs">Reserve not met. May still get sold</div></h2>
                                
                            <p className=" mt-0 text-left text-white font-normal">
                                Maximum discount : <span className="text-3xl font-extrabold">${maxDiscount}</span>
                            </p>

                            <EtherInput value={ethAmount1} onChange={amount => setEthAmount1(amount)} />

                            <div className="card-actions justify-end">
                            {/* <button className="btn btn-primary">Place Bid</button> */}
                            <a onClick={handleBidClick} className="relative inline-flex items-center justify-start inline-block px-5 py-3 overflow-hidden font-bold rounded-full group">
                            <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
                            <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-white opacity-100 group-hover:-translate-x-8"></span>
                            <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-gray-900">Place Bid</span>
                            <span className="absolute inset-0 border-2 border-white rounded-full"></span>
                            </a>
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
                            <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />
                            <div className="card-actions justify-end">
                            {/* <button className="btn btn-primary">Verify</button> */}
                            <a onClick={handleRevealClick} className="relative inline-flex items-center justify-start inline-block px-5 py-3 overflow-hidden font-bold rounded-full group">
                            <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
                            <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-white opacity-100 group-hover:-translate-x-8"></span>
                            <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-gray-900">Submit</span>
                            <span className="absolute inset-0 border-2 border-white rounded-full"></span>
                            </a>
                            </div>
                        </div>
                    </div>
            }

            </div>
            <div className='mt-2 flex flex-row items-center justify-center '>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg> 
            <p className='pl-2 text-sm'> <span className="underline">Watch</span> : ({group?.members.toString()} Watchers)</p>  
            </div>
        </center>
      </div>
    </div>
  )
}
