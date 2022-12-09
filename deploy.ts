import {providers, Wallet, ContractFactory, BigNumber} from 'ethers';
import fs from 'fs-extra';
import prompt from 'prompt';

interface IPromptProps extends prompt.Properties {
    network: string;
    privateKey: string;
    pathToContractBin: string;
    pathToContractAbi: string;
}

const props: prompt.RevalidatorSchema[] = [
    {
        message: 'Network Address',
        name: 'network',
        required: true,
        allowEmpty: false
    },
    {
        message: 'Private Key',
        name: 'privateKey',
        required: true,
        allowEmpty: false
    },
    {
        message: 'Path to contract to deploy (bin)',
        name: 'pathToContractBin',
        required: true,
        allowEmpty: false
    },
    {
        message: 'Path to contract to deploy (abi)',
        name: 'pathToContractAbi',
        required: true,
        allowEmpty: false
    }
];

(async () => {
    prompt.start();

    const {network, privateKey, pathToContractBin, pathToContractAbi} = await prompt.get<IPromptProps>(props);

    const provider = new providers.JsonRpcProvider(network)
    const wallet = new Wallet(privateKey, provider);
    const abi = await fs.readFile(pathToContractAbi, 'utf8');
    const binary = await fs.readFile(pathToContractBin, 'utf8');

    const contractFactory = new ContractFactory(abi, binary, wallet);

    console.log("Deploying...");

    const contract = await contractFactory.deploy();
    await contract.deployTransaction.wait(1);

    console.log(await (await contract.store(255)).wait(1));
    console.log((await contract.retrieve() as BigNumber).toNumber());
})()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
