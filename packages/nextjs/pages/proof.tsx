import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  AnonAadhaarProof,
} from "anon-aadhaar-react";
import { useEffect } from "react";

export default function Home() {
  const [anonAadhaar] = useAnonAadhaar();

  useEffect(() => {
    console.log("Anon Aadhaar status: ", anonAadhaar.status);
  }, [anonAadhaar]);

  return (
    <>
    
    {anonAadhaar?.status === "logged-in" && (
        <>  <center>
            <p>✅ Proof is valid</p>
            </center>
            <AnonAadhaarProof code={JSON.stringify(anonAadhaar.pcd, null, 2)} />
        </>
    )}
    </>
  );
}