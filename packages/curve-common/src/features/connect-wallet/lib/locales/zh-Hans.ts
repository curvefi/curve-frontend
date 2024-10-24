const zhHans = {
  connect: {
    selectingWallet: {
      header: '可用钱包',
      sidebar: {
        heading: '开始使用',
        subheading: '连接您的钱包',
        paragraph: '连接您的钱包相当于“登录”到Web3。从设置中选择您的钱包开始使用。',
      },
      recommendedWalletsPart1: '{app}只支持',
      recommendedWalletsPart2: '在这个平台上。请使用或安装支持的钱包之一继续',
      installWallet: '您没有安装任何{app}支持的钱包，请使用支持的钱包',
      agreement: {
        agree: '我同意',
        terms: '服务条款和条件',
        and: '和',
        privacy: '隐私政策',
      },
    },
    connectingWallet: {
      header: '{connectionRejected, select, false {连接到{wallet}...} other {连接被拒绝}}',
      sidebar: {
        subheading: '授权连接',
        paragraph: '请在您的钱包中授权连接并授予访问权限以继续。',
      },
      mainText: '连接中...',
      paragraph: '确保选择您希望授予访问权限的所有账户。',
      previousConnection: '{wallet}已有待处理的连接请求，请打开{wallet}应用程序登录并连接。',
      rejectedText: '连接被拒绝！',
      rejectedCTA: '点击这里重试',
      primaryButton: '返回钱包',
    },
    connectedWallet: {
      header: '连接成功',
      sidebar: {
        subheading: '连接成功！',
        paragraph: '您的钱包現在已连接到{app}',
      },
      mainText: '已连接',
    },
  },
  modals: {
    actionRequired: {
      heading: '{wallet}中需要采取行动',
      paragraph: '请在您的钱包中切换活跃的账户。',
      linkText: '了解更多。',
      buttonText: '好的',
    },
    switchChain: {
      heading: '切换链',
      paragraph1: '{app}要求您在继续操作之前将钱包切换到{nextNetworkName}网络。',
      paragraph2: '*某些钱包可能不支持更改网络。如果您在钱包中无法更改网络，您可以考虑切换到其他钱包。',
    },
    confirmDisconnectAll: {
      heading: '断开所有钱包',
      description: '您確定要断开所有钱包吗？',
      confirm: '确认',
      cancel: '取消',
    },
  },
  accountCenter: {
    connectAnotherWallet: '连接另一个钱包',
    disconnectAllWallets: '断开所有钱包',
    currentNetwork: '当前网络',
    appInfo: '应用程序信息',
    learnMore: '了解更多',
    gettingStartedGuide: '入门指南',
    smartContracts: '智能合约',
    explore: '探索',
    backToApp: '返回 dapp',
    poweredBy: '提供技术支持',
    addAccount: '添加账户',
    setPrimaryAccount: '设置主账户',
    disconnectWallet: '断开钱包',
    copyAddress: '复制钱包地址',
  },
  notify: {
    transaction: {
      txRequest: '您的交易正在等待您的确认',
      nsfFail: '您的资金不足以進行此交易',
      txUnderpriced: '您的交易的矿工费价格太低，请尝试更高的矿工费价格',
      txRepeat: '這可能是重复交易',
      txAwaitingApproval: '您有以前的交易等待您的确认',
      txConfirmReminder: '请确认您的交易才能继续',
      txSendFail: '您拒绝了交易',
      txSent: '您的交易已发送到网络',
      txStallPending: '您的交易在发送之前卡住了，请重试',
      txStuck: '由于nonce冲突，您的交易被卡住了',
      txPool: '您的交易已经开始',
      txStallConfirmed: '您的交易被卡住并确认，将从交易池中移除',
      txError: '您的交易出现错误，请重试',
      txSpeedUp: '增加交易提速',
    },
  },
}

export default zhHans
