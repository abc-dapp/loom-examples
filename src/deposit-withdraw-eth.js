import LoomEthCoin from './LoomEthCoin/LoomEthCoin'
import { EventBus } from './EventBus/EventBus'

const Web3 = require('web3')

var sample = new Vue({
  el: '#eth-deposit-withdraw',
  data: {
    info: 'Wait a bit until it gets initialized',
    web3js: null,
    loomEthCoinDemo: null
  },
  methods: {
    async depositAndWithdrawEthersDemo () {
      EventBus.$on('updateEthBalance', this.updateBalance)
      this.loomEthCoinDemo = new LoomEthCoin()
      this.loomEthCoinDemo.load(this.web3js)
    },
    async updateBalance (data) {
      await this.loomEthCoinDemo._updateBalances()
      this.info = 'Rinkeby balance: ' + data.mainNetBalance + ', Extdev balance: ' + data.loomBalance
    },
    async depositEth () {
      this.loomEthCoinDemo.depositEth(this.web3js.utils.toWei('0.2', 'ether'))
    },
    async withdrawEth () {
      this.loomEthCoinDemo.withdrawEth(this.loomEthCoinDemo.depositEth(this.web3js.utils.toWei('0.001', 'ether')))
    },
    async resumeWithdrawal () {
      this.loomEthCoinDemo.resumeWithdrawal()
    },
    async loadWeb3 () {
      if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        this.web3js = new Web3(window.web3.currentProvider)
        await ethereum.enable()
      } else {
        alert('Metamask is not Enabled')
      }
    }
  },
  async mounted () {
    await this.loadWeb3()
    await this.depositAndWithdrawEthersDemo()
  }
})
