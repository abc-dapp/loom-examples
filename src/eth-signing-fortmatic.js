import {
  ethers
} from 'ethers'

import Fortmatic from 'fortmatic'
import Web3 from 'web3'
import SimpleStoreJSON from '../truffle/build/contracts/SimpleStore.json'

import {
  NonceTxMiddleware,
  SignedEthTxMiddleware,
  CryptoUtils,
  Client,
  LoomProvider,
  Address,
  LocalAddress,
  Contracts,
  EthersSigner,
  createDefaultTxMiddleware
} from 'loom-js'

var sample = new Vue({
  el: '#counter',
  data: {
    info: 'Fortmatic demo. Wait a bit until it gets initialized.',
    counter: 0,
    web3js: null,
    publicKey: null,
    chainId: 'extdev-plasma-us1',
    writeUrl: 'wss://extdev-plasma-us1.dappchains.com/websocket',
    readUrl: 'wss://extdev-plasma-us1.dappchains.com/queryws',
    client: null,
    web3Ethereum: null,
    loomProvider: null,
    contract: null,
    networkId: 9545242630824,
    callerChainId: 'eth',
    userAddress: null,
    loomAddress: null
  },
  methods: {
    async init () {
      this.client = new Client(
        this.chainId,
        this.writeUrl,
        this.readUrl
      )
      const provider = this.web3js.currentProvider
      provider.isMetaMask = true
      const ethersProvider = new ethers.providers.Web3Provider(provider)
      const signer = ethersProvider.getSigner()
      this.ethAddress = await signer.getAddress()
      const to = new Address('eth', LocalAddress.fromHexString(this.ethAddress))
      const privateKey = CryptoUtils.generatePrivateKey()
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      this.client.txMiddleware = createDefaultTxMiddleware(this.client, privateKey)
      const addressMapper = await Contracts.AddressMapper.createAsync(
        this.client,
        new Address(this.client.chainId, LocalAddress.fromPublicKey(publicKey))
      )
      if (await addressMapper.hasMappingAsync(to)) {
        console.log('Mapping already exists.')
        const mapping = await addressMapper.getMappingAsync(to)
        console.log('mapping.to: ' + mapping.to.local.toString())
        console.log('mapping.from: ' + mapping.from.local.toString())
        this.loomAddress = mapping.to.local.toString()
      } else {
        const from = new Address(this.client.chainId, LocalAddress.fromPublicKey(publicKey))
        console.log('Mapping ' + from + ' and ' + to)
        const ethersSigner = new EthersSigner(signer)
        await addressMapper.addIdentityMappingAsync(from, to, ethersSigner)
        const mapping = await addressMapper.getMappingAsync(to)
        console.log('mapping.to: ' + mapping.to.local.toString())
        console.log('mapping.from: ' + mapping.from.local.toString())
        this.loomAddress = mapping.to.local.toString()
      }
      this.loomProvider = new LoomProvider(this.client, privateKey)
      this.loomProvider.callerChainId = this.callerChainId
      this.loomProvider.setMiddlewaresForAddress(to.local.toString(), [
        new NonceTxMiddleware(
          new Address(this.callerChainId, LocalAddress.fromHexString(this.ethAddress)),
          this.client
        ),
        new SignedEthTxMiddleware(signer)
      ])
      return true
    },
    async getContract () {
      const web3 = new Web3(this.loomProvider)
      this.contract = new web3.eth.Contract(SimpleStoreJSON.abi, SimpleStoreJSON.networks[this.networkId].address)
    },
    async testEthSigning () {
      const value = parseInt(this.counter, 10)
      await this.contract.methods
        .set(value)
        .send({
          from: this.ethAddress
        })
    },
    async increment () {
      this.info = 'Please sign the transaction.'
      this.counter += 1
      await this.testEthSigning()
    },

    async decrement () {
      this.info = 'Please sign the transaction.'
      if (this.counter > 0) {
        this.counter -= 1
        await this.testEthSigning()
      } else {
        console.log('counter should be > 1.')
      }
    },
    async filterEvents () {
      this.contract.events.NewValueSet({ filter: { address: this.loomAddress } }, (err, event) => {
        if (err) console.error('Error on event', err)
        else {
          if (event.returnValues._value.toString() === this.counter.toString()) {
            this.info = 'Looking good! Expected: ' + this.counter.toString() + ', Returned: ' + event.returnValues._value.toString()
          } else {
            this.info = 'An error occured! Expected: ' + this.counter.toString() + ', Returned: ' + event.returnValues._value.toString()
          }
        }
      })
    },
    async  ethSigningDemo () {
      console.log('ethSigningDemo')
      if (await this.init()) {
        await this.getContract()
        await this.filterEvents()
        await this.testEthSigning()
      }
    }
  },
  async mounted () {
    const fm = new Fortmatic('pk_test_68B049DC42D74C1C', 'rinkeby')
    this.web3js = new Web3(fm.getProvider())
    this.userAddress = await this.web3js.currentProvider.enable()
    await this.ethSigningDemo()
  }
})