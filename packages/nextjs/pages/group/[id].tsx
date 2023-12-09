
import img from '../../public/background.jpg';
import Image from 'next/image'
import avatar from '../../public/avatar.png';
import { useRouter } from 'next/router';
import {  useAnonAadhaar } from "anon-aadhaar-react";
import { useEffect } from "react";
import { useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import React from 'react';
import RoscaGroup from '../../abis/RoscaGroup.json';

export default function Home() {
  let distributionAmount = 5;

  const router = useRouter();
  
  const handleButtonClick = (groupAddress: any) => {
    router.push(`/auction/${groupAddress}`);
  };

  const groupAddressValue = String(router.query.id);

  const { data: group, isError, isLoading } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getGroupDetails',
  });

  const { data: roundStage, isError: isError1, isLoading: isLoading1 } = useContractRead({
      address: groupAddressValue,
      abi: RoscaGroup.abi,
      functionName: 'getCurrentRoundStage',
  });

  const { writeApprove, isLoading: isLoading2, isMining } = useScaffoldContractWrite({
    contractName: "Stablecoin",
    functionName: "approve",
    args: [groupAddressValue, BigInt(1000*10**18)],
  });

  const { config } = usePrepareContractWrite({
    address: groupAddressValue,
    abi: RoscaGroup.abi,
    functionName: 'contribute',
  });
  const { data, isLoading: isLoading3, isSuccess, writeContribute } = useContractWrite(config);

  const [anonAadhaar] = useAnonAadhaar();

  useEffect(() => {
    console.log("Anon Aadhaar status: ", anonAadhaar.status);
  }, [anonAadhaar, router.isReady]);

  return (
    <div 
      style={{
      backgroundImage: `url(${img.src})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      }}
      className='bg-cover bg-scroll'
    >
      
      <div className='relative z-10 flex-col'>
        {/* <h2 className="mt-10 animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent ml-72 mb-10 text-5xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl ">Welcome to ROSCA DApp</h2> */}
        <center>
            <h2 className="pt-4 text-4xl justify-center items-center font-bold dark:text-white">Group : {group?.id.toString()}</h2> 
            
            
        <div>
            <section >
            <div className="py-2 px-12 mx-auto max-w-screen-xl">
                <div className="border-gray-100 bg-gray-400 shadow-xl backdrop-filter backdrop-blur-sm bg-opacity-30 rounded-lg p-4 md:p-8 mb-8">
                        
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    <h1 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-bold mb-2">SIP Amount: <span className='font-extrabold'>${parseInt(group?.amount.toString()) / 10**18}</span></h1>
                    <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-6">Pooling takes place 1st of every month</p>
                    <div className="flex justify-center items-center">
                    <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-bold mb-2">Members : <span className='font-extrabold'>{group?.currentMembers.toString()}</span></h1>
                  {
                    group?.currentMembers.toString() > 3 ?
                    <div className="avatar-group -space-x-6 ml-6 ">
                    <div className="avatar">
                        <div className="w-12">
                        <Image src={avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="avatar">
                        <div className="w-12">
                        <Image src={avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="avatar">
                        <div className="w-12">
                        <Image src={avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="avatar placeholder">
                        <div className="w-12 bg-neutral text-neutral-content">
                        <span>+{members -3 }</span>
                        </div>
                    </div>
                    </div>
                    :
                    <></>
                  } 
                    </div>
                    
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {
                    roundStage === 1 ? 
                    <div className="border-gray-100 bg-gray-400 backdrop-filter shadow-xl backdrop-blur-sm bg-opacity-30 rounded-lg p-2 md:p-12">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M3.22 3.22a.75.75 0 011.06 0l3.97 3.97V4.5a.75.75 0 011.5 0V9a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h2.69L3.22 4.28a.75.75 0 010-1.06zm17.56 0a.75.75 0 010 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0zM3.75 15a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.97 3.97a.75.75 0 01-1.06-1.06l3.97-3.97H4.5a.75.75 0 01-.75-.75zm10.5 0a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-2.69l3.97 3.97a.75.75 0 11-1.06 1.06l-3.97-3.97v2.69a.75.75 0 01-1.5 0V15z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Collection stage</h2>
                        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-4">Monthly contribution : ${parseInt(group?.amount.toString()) / 10**18}</p>
                            {/* <button className="btn btn-neutral sm:btn-sm md:btn-md lg:btn-lg">Pay ${parseInt(group?.amount.toString()) / 10**18}</button> */}
                        <a href="#_" className="relative inline-flex items-center justify-start inline-block px-5 py-3 overflow-hidden font-bold rounded-full group">
                        <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
                        <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-white opacity-100 group-hover:-translate-x-8"></span>
                        <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-gray-900" onClick={() => writeContribute()}>Pay ${parseInt(group?.amount.toString()) / 10**18}</span>
                        <span className="absolute inset-0 border-2 border-white rounded-full"></span>
                        </a>
                    </div>
                    : roundStage === 2 ?
                    <div className="border-gray-100 shadow-xl bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30 rounded-lg p-8 md:p-12">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.873 8.703a4.126 4.126 0 017.746 0 .75.75 0 01-.351.92 7.47 7.47 0 01-3.522.877 7.47 7.47 0 01-3.522-.877.75.75 0 01-.351-.92zM15 8.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15zM14.25 12a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Bidding stage</h2>
                        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-4">Participate in bidding</p>
                        {
                          anonAadhaar?.status === "logged-in" ?
                            <div className="flex mt-2 justify-center ">
                              <button onClick={() => handleButtonClick(groupAddressValue)} className=" btn btn-neutral ">Participate in bidding</button>
                          </div>
                          :
                            <></>
                        }
                    </div>
                    :
                      <div className="border-gray-100 shadow-xl bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-30 rounded-lg p-8 md:p-12">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>

                        <h2 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Distribution stage</h2>
                        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-4">Distribution amount : ${distributionAmount} per member</p>
                        {/* <button className="btn btn-neutral sm:btn-sm md:btn-md lg:btn-lg">Claim ${distributionAmount}</button> */}
                        <a href="#_" className="relative inline-flex items-center justify-start inline-block px-5 py-3 overflow-hidden font-bold rounded-full group">
                        <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
                        <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-white opacity-100 group-hover:-translate-x-8"></span>
                        <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-gray-900">Claim ${distributionAmount}</span>
                        <span className="absolute inset-0 border-2 border-white rounded-full"></span>
                        </a>
                    </div>
                  }
                  <div className="border-gray-100 bg-gray-400 backdrop-filter shadow-xl backdrop-blur-sm bg-opacity-30 rounded-lg p-2 md:p-12">
                      {/* <p>Auction history table</p> */}
                      <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Chain</th>
                            <th>Group</th>
                            <th>Round</th>  
                            <th>Winner</th>
                            <th>Bid</th>
                          </tr>
                        </thead>
                        <tbody>

                          <tr>
                            <th>1</th>
                            <td>Goerli</td>
                            <td>Gang</td>
                            <th>8</th>
                            <td>Jake</td>
                            <td>$450</td>
                          </tr>
                          
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </div>
        </section>

    </div>    

      </center>
      </div>
    </div>
  )
}
