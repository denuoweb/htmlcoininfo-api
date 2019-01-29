module.exports = app => {
  const {router, controller, middleware} = app
  const {address: addressMiddleware, pagination: paginationMiddleware} = middleware

  router.get('/info', controller.info.index)
  router.get('/supply', controller.info.supply)
  router.get('/circulating-supply', controller.info.circulatingSupply)

  router.get('/blocks', controller.block.list)
  router.get('/block/:block', controller.block.block)
  router.get('/raw-block/:block', controller.block.rawBlock)
  router.get('/recent-blocks', controller.block.recent)

  router.get('/tx/:id', controller.transaction.transaction)
  router.get('/raw-tx/:id', controller.transaction.rawTransaction)
  router.get('/recent-txs', controller.transaction.recent)

  router.get('/address/:address', addressMiddleware(), controller.address.summary)
  router.get('/address/:address/balance', addressMiddleware(), controller.address.balance)
  router.get('/address/:address/balance/total-received', addressMiddleware(), controller.address.totalReceived)
  router.get('/address/:address/balance/total-sent', addressMiddleware(), controller.address.totalSent)
  router.get('/address/:address/balance/unconfirmed', addressMiddleware(), controller.address.unconfirmedBalance)
  router.get('/address/:address/balance/staking', addressMiddleware(), controller.address.stakingBalance)
  router.get('/address/:address/balance/mature', addressMiddleware(), controller.address.matureBalance)
  router.get('/address/:address/utxo', addressMiddleware(), controller.address.utxo)
  router.get('/address/:address/balance-history', addressMiddleware(), paginationMiddleware(), controller.address.balanceHistory)
  router.get('/address/:address/qrc20-balance-history', addressMiddleware(), paginationMiddleware(), controller.address.qrc20BalanceHistory)
}
