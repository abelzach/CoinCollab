import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { ethers, Contract, Wallet, Provider } from 'ethers';
import dotenv from 'dotenv';
import { contractAddress } from './contractAddress';

const RoscaManager = require("../nextjs/abis/RoscaManager.json");
const RoscaGroup = require("../nextjs/abis/RoscaGroup.json");

dotenv.config();

const app = express();
const port = 3001;
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

const zkEvmTestnetProvider = new ethers.JsonRpcProvider(process.env.ZKEVM_TESTNET_RPC_URL);
const baseGoerliProvider = new ethers.JsonRpcProvider(process.env.BASE_GOERLI_RPC_URL);
const arbitrumGoerliProvider = new ethers.JsonRpcProvider(process.env.ARBITRUM_GOERLI_RPC_URL);
const localhostProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');


app.use(cors());
app.use(express.json());

app.get('/api/add-listener', async (req, res) => {
    try {
        const { chain } = req.query as any;
        if (!chain) throw new Error('Chain not specified');
        
        let provider: Provider;
        switch (parseInt(chain)) {
            case 31337: provider = localhostProvider; break;
            case 1442: provider = zkEvmTestnetProvider; break;
            case 84531: provider = baseGoerliProvider; break;
            case 421613: provider = arbitrumGoerliProvider; break;
            default: throw new Error('Chain not supported');
        }

        const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
        const roscaManager = new ethers.Contract(contractAddress[parseInt(chain)].RoscaManager, RoscaManager.abi, provider);
        roscaManager.addListener('GroupCreated', async (groupAddress: string, creator: string) => {
            console.log("New group", parseInt(chain), groupAddress);
            const roscaGroup = new ethers.Contract(groupAddress, RoscaGroup.abi, provider);
            const groupDetails = await (roscaGroup.connect(signer) as any).getGroupDetails();
            console.log(groupDetails);
            const groupMembers = await (roscaGroup.connect(signer) as any).getMembers();

            roscaGroup.addListener('GroupStarted', async (timestamp: any) => {
                console.log("Group started", parseInt(chain), groupAddress);
                const created_at = new Date().toISOString();
                const { data, error } = await supabase
                .from('groups')
                .insert([{ 
                    chain: parseInt(chain), 
                    group: groupDetails.id, 
                    address: groupAddress, 
                    amount: parseInt(ethers.formatEther(groupDetails.amount)), 
                    members: groupMembers, 
                    created_at 
                }]);
            });
            roscaGroup.addListener('RoundStarted', async (round: any, timestamp: any) => {
                console.log("Round started", parseInt(chain), round, groupAddress);
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
});    

app.get('/api/get-groups', async (req, res) => {
    try {
      const { chain } = req.query as any;
      if (!chain) throw new Error('Chain not specified');
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('chain', chain);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
});

app.get('/api/get-group', async (req, res) => {
    try {
      const { chain, group } = req.query as any;
      if (!chain) throw new Error('Chain not specified');
      if (!group) throw new Error('Group ID not specified');
  
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('chain', chain)
        .eq('group', group);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
});

app.post('/api/place-bid', async (req, res) => {
    try {
      const { chain, group, round, member, bid_hash } = req.body;
      if (!chain) throw new Error('Chain not specified');
      if (!group) throw new Error('Group ID not specified');
      if (!round) throw new Error('Round not specified');
      if (!member) throw new Error('Member not specified');
      if (!bid_hash) throw new Error('Bid hash not specified');
  
      const { data, error } = await supabase
        .from('bids')
        .insert([{ chain, group, round, member, bid_hash }]);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
});

app.post('/api/reveal-bid', async (req, res) => {
    try {
      const { chain, group, round, member, bid } = req.body;
      if (!chain) throw new Error('Chain not specified');
      if (!group) throw new Error('Group ID not specified');
      if (!round) throw new Error('Round not specified');
      if (!member) throw new Error('Member not specified');
      if (!bid) throw new Error('Bid not specified');
  
      const { data, error } = await supabase
        .from('bids')
        .update({ bid })
        .eq('chain', chain)
        .eq('group', group)
        .eq('round', round)
        .eq('member', member);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});