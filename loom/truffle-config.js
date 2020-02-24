const LoomTruffleProvider = require('loom-truffle-provider')
const HDWalletProvider = require('truffle-hdwallet-provider')
const {
  readFileSync
} = require('fs')
const path = require('path')

module.exports = {
  networks: {
    extdev: {
      provider: function () {
        const privateKey = readFileSync(path.join(__dirname, 'loom_private_key'), 'utf-8')
        const chainId = 'extdev-plasma-us1'
        const writeUrl = 'wss://extdev-plasma-us1.dappchains.com/websocket'
        const readUrl = 'wss://extdev-plasma-us1.dappchains.com/queryws'
        const loomTruffleProvider = new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
        loomTruffleProvider.createExtraAccountsFromMnemonic('gravity top burden flip student usage spell purchase hundred improve check genre', 10)
        return loomTruffleProvider
      },
      network_id: '9545242630824'
    },
    asia1: {
      provider: function () {
        const privateKey = readFileSync(path.join(__dirname, 'loom_private_key'), 'utf-8')
        const chainId = 'asia1'
        const writeUrl = 'wss://test-z-asia1.dappchains.com/websocket'
        const readUrl = 'wss://test-z-asia1.dappchains.com/queryws'
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: '5101040124304'
    },
    rinkeby: {
      provider: function () {
        const mnemonic = readFileSync(path.join(__dirname, '../rinkeby_mnemonic'), 'utf-8')
        if (!process.env.INFURA_API_KEY) {
          throw new Error("INFURA_API_KEY env var not set")
        }
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 10)
      },
      network_id: 4,
      gasPrice: 15000000001,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '0.5.0'
    }
  }
}
