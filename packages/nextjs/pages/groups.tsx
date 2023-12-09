
import img from '../public/background.jpg';
import Image from 'next/image'
import avatar from '../public/avatar.png';
import { useRouter } from 'next/router';
import React from 'react';
import { useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import RoscaGroup from '../abis/RoscaGroup.json';
import { useContractWrite } from 'wagmi'

export default function Home() {

  const { data: groupsData } = useScaffoldContractRead({
    contractName: "RoscaManager",
    functionName: "getOpenGroups",
  });
  console.log(groupsData);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    abi: RoscaGroup.abi,
    functionName: 'joinGroup',
  })

  console.log('isSuccess: ',isSuccess);


  const [rangeValue, setRangeValue] = React.useState(50);

  const handleRangeChange = (event) => {
    const newValue = event.target.value;
    setRangeValue(newValue);
    console.log('Range value:', rangeValue*10);
  };


  const router = useRouter();

  const handleButtonClick = () => {
    router.push(`/group`);
  };

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
        <h2 className="ml-72 pt-4 text-4xl font-bold dark:text-white">Open Groups</h2>
        <center>
          
        <input
          type="range"
          className="transparent h-1.5 w-3/5  cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
          id="customRange1"
          value={rangeValue}
          onChange={handleRangeChange}
        />
        <div className=' mt-4'>
          {groupsData?.map((group, index) => (
            <React.Fragment key={index}>
          { parseInt(group.amount.toString()) / 10**18 < rangeValue*10 && (
        <div key={index} tabIndex={0} className=" shadow-xl collapse collapse-open border border-gray-100 bg-gray-400 backdrop-filter backdrop-blur-sm bg-opacity-20 w-3/5 mb-4">
          <input type="checkbox" /> 
            <div className="collapse-title text-xl font-medium">
              Group {group.id.toString()}
            </div>
            <div className="collapse-content"> 
              <div className='flex'>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="stat-title">Amount</div>
                    <div className="stat-value">${parseInt(group.amount.toString()) / 10**18}</div>
                    <div className="stat-desc"> 1st of every month</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    </div>
                    <div className="stat-title">Duration</div>
                    <div className="stat-value">{group.members.toString()} months</div>
                    {/* <div className="stat-desc">↗︎ 400 </div> */}
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    </div>
                    <div className="stat-title">Members</div>
                    <div className="stat-value">{group.currentMembers.toString()}</div>
                    {/* <div className="stat-desc">↘︎ 90 (14%)</div> */}
                  </div>
                </div>
                {
                  group.currentMembers.toString() > 3 ?

                <div className="flex justify-between items-end">
                  <div className="absolute top-8 right-8">
                   <div className="avatar-group -space-x-6 rtl:space-x-reverse">
                  <div className="avatar">
                    <div className="w-12 ">
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
                      <span>+{parseInt(group.currentMembers.toString()) -3 }</span>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
                  :
                  <></>
                }
                <div className="flex justify-between items-end">
                  
                <button onClick={() =>
          write({address: group.groupAddress})
        } className=" absolute bottom-4 right-8 p-4 btn btn-neutral ">Join</button>
                </div>
              </div>
            </div>
          </div>
         )}
         </React.Fragment>
        ))}
        </div>
      </center>
      </div>
    </div>
  )
}
