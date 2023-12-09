import img from '../public/background.jpg';
import Polygon from '../public/polygon.png';
import Image from 'next/image'
import Base from '../public/base.png'
import Arbitrum from '../public/Arbitrum.png'
import { LogInWithAnonAadhaar, useAnonAadhaar, AnonAadhaarProof } from "anon-aadhaar-react";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [anonAadhaar] = useAnonAadhaar();

  useEffect(() => {
    console.log("Anon Aadhaar status: ", anonAadhaar.status);
  }, [anonAadhaar]);
  
  const router = useRouter();

  const handleProofClick = () => {
    router.push('/proof');
  };
  return (
      <div 
        style={{
        backgroundImage: `url(${img.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        height: '100vh'
        }}
      >
      <div className="flex">
        <div className="w-2/3">
          <div className='flex-col'>
              <div>
              <h1 className="ml-10 pt-28 animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-5xl font-black">Nurture financial growth with our ROSCA circle</h1>
              <p className='ml-10 pt-3 text-xl'>Empowering communities, one revolution at a time – join our Rotating Savings and Credit Association (ROSCO) to unlock financial solidarity and propel collective prosperity into the future  </p>
              </div>
              <div className='flex pt-7 ml-10'>
                <LogInWithAnonAadhaar />
                {
                  anonAadhaar?.status === "logged-out" || anonAadhaar?.status === "logging-in" ?
                  <></>
                  :
                  <div className='absolute top-4 right-4'>
                    <button className="btn glass" onClick={handleProofClick}>Show proof</button>
                  </div>
                }
                {
                  anonAadhaar?.status === "logged-out" || anonAadhaar?.status === "logging-in" ?
                  <></>
                  :
                  <a href="/groups" className="ml-5 text-xl rounded-full relative inline-flex items-center justify-center inline-block p-4 px-10 py-0 overflow-hidden font-medium text-indigo-600 rounded-lg shadow-2xl group">
                  <span className="absolute top-0 left-0 w-40 h-40 -mt-10 -ml-3 transition-all duration-700 bg-red-500 rounded-full blur-md ease"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-700 group-hover:rotate-180 ease">
                  <span className="absolute bottom-0 left-0 w-24 h-24 -ml-10 bg-purple-500 rounded-full blur-md"></span>
                  <span className="absolute bottom-0 right-0 w-24 h-24 -mr-10 bg-pink-500 rounded-full blur-md"></span>
                  </span>
                  <span className="relative text-white">Launch App</span>
                </a>
                }
                  
              </div>
              <div className='ml-10 pt-16 flex-col'>
                <p>Available on </p>
                <div className='flex pt-2'>
                  <Image className="w-1/12" src={Polygon} alt='Polygon logo'></Image>    
                  <Image className="w-1/12 ml-2" src={Base} alt='Base logo'></Image>
                  <Image className="w-1/12 ml-2" src={Arbitrum} alt='Arbitrum logo'></Image>
                </div>
              </div>
          </div>
          

        </div>

        <div className="w-1/3">
          {/* <img src={img2} alt="ROSCA" /> */}
        </div>
      </div>
      </div>

  )
}
