import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import ethers, { Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

const baseGoerliProvider = new ethers.JsonRpcProvider(process.env.BASE_GOERLI_RPC_URL);

app.use(cors());
app.use(express.json());


app.post('/api/create-group', async (req, res) => {
    try {
        const { chain, group, address, amount, members } = req.body;
        if (!chain) throw new Error('Chain not specified');
        if (!group) throw new Error('Group ID not specified');
        if (!address) throw new Error('Address not specified');
        if (!amount) throw new Error('Amount not specified');
        if (!members) throw new Error('Members not specified');

        let ownerSigner: Wallet;
        switch (chain) {
            case 84531: ownerSigner = new ethers.Wallet(process.env.PRIVATE_KEY as string, baseGoerliProvider); break;
            default: throw new Error('Chain not supported');
        }

        const created_at = new Date().toISOString();
        const { data, error } = await supabase
        .from('groups')
        .insert([{ chain, group, address, amount, members, created_at }]);
        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
});

app.get('/api/get-groups', async (req, res) => {
    try {
      const { chain } = req.params as any;
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
      const { chain, group } = req.params as any;
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});