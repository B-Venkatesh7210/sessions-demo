import React, { useState } from "react";
import {
  PaymasterMode,
  createSmartAccountClient,
  createSession,
  Rule,
  Policy,
  createSessionKeyEOA,
  BiconomySmartAccountV2,
  createSessionSmartAccountClient,
  getSingleSessionTxParams,
  createBundler,
} from "@biconomy/account";
import { contractABI } from "../contract/contractABI";
import { ethers, providers, Wallet } from "ethers";
import { encodeFunctionData, parseAbi } from "viem";
import { polygonAmoy, sepolia, berachainTestnetbArtio } from "viem/chains";

export default function Home() {
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [chainSelected, setChainSelected] = useState<number>(0);
  const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

  const chains = [
    {
      chainNo: 0,
      chainId: 80084,
      name: "Bera Testnet",
      providerUrl: "https://bartio.rpc.b-harvest.io",
      incrementCountContractAdd: "0xcf29227477393728935BdBB86770f8F81b698F1A",
      biconomyPaymasterApiKey: "9ooHeMdTl.aa829ad6-e07b-4fcb-afc2-584e3400b4f5",
      explorerUrl: "https://bartio.beratrail.io/tx/",
      chain: berachainTestnetbArtio,
      bundlerUrl:
        "https://bundler.biconomy.io/api/v2/80084/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      paymasterUrl:
        "https://paymaster.biconomy.io/api/v1/80084/9ooHeMdTl.aa829ad6-e07b-4fcb-afc2-584e3400b4f5",
    },
    {
      chainNo: 1,
      chainId: 11155111,
      name: "Ethereum Sepolia",
      providerUrl: "https://eth-sepolia.public.blastapi.io",
      incrementCountContractAdd: "0xd9ea570eF1378D7B52887cE0342721E164062f5f",
      // biconomyPaymasterApiKey: "gJdVIBMSe.f6cc87ea-e351-449d-9736-c04c6fab56a2",
      biconomyPaymasterApiKey: "_sTfkyAEp.552504b5-9093-4d4b-94dd-701f85a267ea",
      explorerUrl: "https://sepolia.etherscan.io/tx/",
      chain: sepolia,
      bundlerUrl:
        "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      // paymasterUrl:
      //   "https://paymaster.biconomy.io/api/v1/11155111/gJdVIBMSe.f6cc87ea-e351-449d-9736-c04c6fab56a2",
      paymasterUrl:
        "https://paymaster.biconomy.io/api/v1/11155111/_sTfkyAEp.552504b5-9093-4d4b-94dd-701f85a267ea",
    },
    {
      chainNo: 2,
      chainId: 80002,
      name: "Polygon Amoy",
      providerUrl: "https://rpc-amoy.polygon.technology/",
      incrementCountContractAdd: "0xfeec89eC2afD503FF359487967D02285f7DaA9aD",
      biconomyPaymasterApiKey: "TVDdBH-yz.5040805f-d795-4078-9fd1-b668b8817642",
      explorerUrl: "https://www.oklink.com/amoy/tx/",
      chain: polygonAmoy,
      bundlerUrl:
        "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      paymasterUrl:
        "https://paymaster.biconomy.io/api/v1/80002/TVDdBH-yz.5040805f-d795-4078-9fd1-b668b8817642",
    },
  ];

  const withSponsorship = {
    paymasterServiceData: { mode: PaymasterMode.SPONSORED },
  };

  const createSessionWithSponsorship = async () => {
    // const { sessionKeyAddress, sessionStorageClient } =
    //   await createSessionKeyEOA(
    //     //@ts-ignore
    //     smartAccount,
    //     chains[chainSelected].chain
    //   );

    const rules: Rule[] = [
      {
        offset: 0,
        condition: 0,
        //@ts-ignore
        referenceValue: smartAccountAddress,
      },
    ];

    const policy: Policy[] = [
      {
        // sessionKeyAddress,
        //@ts-ignore
        contractAddress: chains[chainSelected].incrementCountContractAdd,
        // contractAddress: nftAddress,
        functionSelector: "increment()",
        // functionSelector: "safeMint(address)",
        rules: [],
        // rules,
        interval: {
          validUntil: 0,
          validAfter: 0,
        },
        valueLimit: BigInt(0),
      },
    ];

    const { wait, session } = await createSession(
      //@ts-ignore
      smartAccount,
      policy,
      // sessionStorageClient,
      null,
      withSponsorship
    );

    const {
      receipt: { transactionHash },
      success,
    } = await wait();

    console.log(
      "Successful in creating the session",
      success,
      "Txn Hash",
      transactionHash,
      "Session",
      session
    );

    // const usersSmartAccountAddress = sessionStorageClient.smartAccountAddress;

    console.log(
      "Users Smart Account Address",
      // usersSmartAccountAddress,
      "Smart Account Address",
      smartAccountAddress
    );
  };

  const incrementCount = async () => {
    const emulatedUsersSmartAccount = await createSessionSmartAccountClient(
      {
        //@ts-ignore
        accountAddress: smartAccountAddress, // Dapp can set the account address on behalf of the user
        bundlerUrl: chains[chainSelected].bundlerUrl,
        paymasterUrl: chains[chainSelected].paymasterUrl,
        chainId: chains[chainSelected].chainId,
      },
      // smartAccountAddress
      "DEFAULT_STORE" // Storage client, full Session or simply the smartAccount address if using default storage for your environment
    );

    console.log("Emulated Users Smart Account", emulatedUsersSmartAccount);

    const minTx = {
      to: chains[chainSelected].incrementCountContractAdd,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "increment",
        args: [],
      }),
    };

    // const nftMintTx = {
    //   to: nftAddress,
    //   data: encodeFunctionData({
    //     abi: parseAbi(["function safeMint(address _to)"]),
    //     functionName: "safeMint",
    //     //@ts-ignore
    //     args: [smartAccountAddress],
    //   }),
    // };

    const params = await getSingleSessionTxParams(
      //@ts-ignore
      smartAccountAddress,
      chains[chainSelected].chain,
      0 // index of the relevant policy leaf to the tx
    );

    const { wait: wait2 } = await emulatedUsersSmartAccount.sendTransaction(
      // nftMintTx,
      minTx,
      // {
      //   ...params,
      //   ...withSponsorship,
      // }
      { paymasterServiceData: { mode: PaymasterMode.SPONSORED } },
      { leafIndex: "LAST_LEAF" }
    );

    const { success: success2 } = await wait2();

    console.log("Success", success2);
  };

  const connect = async () => {
    const ethereum = (window as any).ethereum;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      // const provider = new providers.JsonRpcProvider(
      //   "https://rpc-amoy.polygon.technology/"
      // );
      // const signer = new Wallet("f055d9c616149ebf48335227c6cbeff24286eadd6411eeb38c53127656d31768" || "", provider);

      const config = {
        biconomyPaymasterApiKey: chains[chainSelected].biconomyPaymasterApiKey,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
      };

      const bundler = await createBundler({
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[chainSelected].chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
        userOpReceiptMaxDurationIntervals: { [80002]: 120000 }, //waitForTxn
        userOpReceiptIntervals: { [80002]: 3000 }, //wait
      });

      const smartWallet = await createSmartAccountClient({
        signer: signer,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundler: bundler,
        // bundlerUrl: config.bundlerUrl,
        rpcUrl: chains[chainSelected].providerUrl,
        chainId: chains[chainSelected].chainId,
      });

      console.log("Biconomy Smart Account", smartWallet);
      setSmartAccount(smartWallet);
      const saAddress = await smartWallet.getAccountAddress();
      console.log("Smart Account Address", saAddress);
      setSmartAccountAddress(saAddress);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-8 p-24">
      <div className="text-[4rem] font-bold text-orange-400">
        Biconomy Session Key Demo
      </div>

      {!smartAccount && (
        <>
          <div className="flex flex-row justify-center items-center gap-4">
            {chains.map((chain) => {
              return (
                <div
                  key={chain.chainNo}
                  className={`w-[10rem] h-[3rem] cursor-pointer rounded-lg flex flex-row justify-center items-center text-white ${
                    chainSelected == chain.chainNo
                      ? "bg-orange-600"
                      : "bg-black"
                  } border-2 border-solid border-orange-400`}
                  onClick={() => {
                    setChainSelected(chain.chainNo);
                  }}
                >
                  {chain.name}
                </div>
              );
            })}
          </div>
          <button
            className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
            onClick={connect}
          >
            EOA Sign in
          </button>
        </>
      )}

      {smartAccount && (
        <>
          {" "}
          <span>Smart Account Address</span>
          <span>{smartAccountAddress}</span>
          <span>Network: {chains[chainSelected].name}</span>
          <button
            className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
            onClick={createSessionWithSponsorship}
          >
            Create Session
          </button>
          <button
            className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
            onClick={incrementCount}
          >
            Increment Count
          </button>
        </>
      )}
    </main>
  );
}
