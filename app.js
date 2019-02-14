module.exports = app => {
  app.blockchainInfo = {
    tip: null,
    stakeWeight: null,
    feeRate: null
  }
  const namespace = app.io.of('/')

  app.messenger.on('egg-ready', () => {
    app.messenger.sendToAgent('blockchain-info')
  })

  app.messenger.on('update-richlist', async () => {
    let ctx = app.createAnonymousContext()
    await ctx.service.balance.updateRichList()
  })

  app.messenger.on('get-stakeweight', async () => {
    let ctx = app.createAnonymousContext()
    let stakeWeight = await ctx.service.info.getStakeWeight()
    app.messenger.sendToAgent('stakeweight', stakeWeight)
    namespace.to('blockchain').emit('stakeweight', stakeWeight)
  })

  app.messenger.on('blockchain-info', info => {
    app.blockchainInfo = info
  })
  app.messenger.on('block-tip', tip => {
    app.blockchainInfo.tip = tip
  })
  app.messenger.on('new-block', block => {
    app.blockchainInfo.tip = block
  })
  app.messenger.on('reorg-to-block', block => {
    app.blockchainInfo.tip = block
  })

  app.messenger.on('socket/block-tip', async tip => {
    app.blockchainInfo.tip = tip
    namespace.emit('tip', tip)
    let ctx = app.createAnonymousContext()
    let transactions = (await ctx.service.block.getBlockTransactions(tip.height)).map(id => id.toString('hex'))
    for (let id of transactions) {
      namespace.to(`transaction/${id}`).emit('transaction/confirm', id)
    }
    let list = await ctx.service.block.getBlockAddressTransactions(tip.height)
    for (let i = 0; i < transactions.length; ++i) {
      for (let address of list[i] || []) {
        namespace.to(`address/${address}`).emit('address/transaction', {address, id: transactions[i]})
      }
    }
  })

  app.messenger.on('socket/reorg/block-tip', tip => {
    app.blockchainInfo.tip = tip
    namespace.emit('reorg', tip)
  })

  app.messenger.on('socket/mempool-transaction', async id => {
    id = Buffer.from(id)
    let ctx = app.createAnonymousContext()
    let transaction = await ctx.service.transaction.getTransaction(id)
    if (!transaction) {
      return
    }
    namespace.to('mempool').emit('mempool/transaction', await ctx.service.transaction.transformTransaction(transaction, {brief: true}))
    let addresses = await ctx.service.transaction.getMempoolTransactionAddresses(id)
    for (let address of addresses) {
      namespace.to(`address/${address}`).emit('address/transaction', {address, id: id.toString('hex')})
    }
  })

  app.messenger.on('socket/feerate', feeRate => {
    namespace.to('blockchain').emit('feerate', feeRate)
  })
}
