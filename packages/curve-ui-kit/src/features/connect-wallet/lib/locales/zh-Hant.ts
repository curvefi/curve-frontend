const zhHant = {
  connect: {
    selectingWallet: {
      header: '可用錢包',
      sidebar: {
        heading: '開始使用',
        subheading: '連接您的錢包',
        paragraph: '連接您的錢包就像“登錄”到Web3。從選項中選擇您的錢包開始使用。',
      },
      recommendedWalletsPart1: '{app}只支持',
      recommendedWalletsPart2: '在這個平台上。請使用或安裝支持的錢包之一繼續',
      installWallet: '您沒有安裝任何{app}支持的錢包，請使用支持的錢包',
      agreement: {
        agree: '我同意',
        terms: '服務條款和條件',
        and: '和',
        privacy: '隱私政策',
      },
    },
    connectingWallet: {
      header: '{connectionRejected, select, false {連接到{wallet}...} other {連接被拒絕}}',
      sidebar: {
        subheading: '批准連接',
        paragraph: '請在您的錢包中批准連接並授予訪問權限以繼續。',
      },
      mainText: '連接中...',
      paragraph: '確保選擇您希望授予訪問權限的所有帳戶。',
      previousConnection: '{wallet}已有待處理的連接請求，請打開{wallet}應用程序登錄並連接。',
      rejectedText: '連接被拒絕！',
      rejectedCTA: '點擊這裡重試',
      primaryButton: '返回錢包',
    },
    connectedWallet: {
      header: '連接成功',
      sidebar: {
        subheading: '連接成功！',
        paragraph: '您的錢包現在已連接到{app}',
      },
      mainText: '已連接',
    },
  },
  modals: {
    actionRequired: {
      heading: '{wallet}中需要採取行動',
      paragraph: '請在您的錢包中切換活動帳戶。',
      linkText: '了解更多。',
      buttonText: '好的',
    },
    switchChain: {
      heading: '切換鏈',
      paragraph1: '{app}要求您在繼續操作之前將錢包切換到{nextNetworkName}網絡。',
      paragraph2: '*某些錢包可能不支持更改網絡。如果您在錢包中無法更改網絡，您可以考慮切換到其他錢包。',
    },
    confirmDisconnectAll: {
      heading: '斷開所有錢包',
      description: '您確定要斷開所有錢包嗎？',
      confirm: '確認',
      cancel: '取消',
    },
  },
  accountCenter: {
    connectAnotherWallet: '連接另一個錢包',
    disconnectAllWallets: '斷開所有錢包',
    currentNetwork: '當前網絡',
    appInfo: '應用程序信息',
    learnMore: '了解更多',
    gettingStartedGuide: '入門指南',
    smartContracts: '智能合約',
    explore: '探索',
    backToApp: '返回 dapp',
    poweredBy: '提供技術支持',
    addAccount: '添加帳戶',
    setPrimaryAccount: '設置主帳戶',
    disconnectWallet: '斷開錢包',
    copyAddress: '復制錢包地址',
  },
  notify: {
    transaction: {
      txRequest: '您的交易正在等待您的確認',
      nsfFail: '您的資金不足以進行此交易',
      txUnderpriced: '您的交易的瓦斯價格太低，請嘗試更高的瓦斯價格',
      txRepeat: '這可能是重複交易',
      txAwaitingApproval: '您有以前的交易等待您的確認',
      txConfirmReminder: '請確認您的交易才能繼續',
      txSendFail: '您拒絕了交易',
      txSent: '您的交易已發送到網絡',
      txStallPending: '您的交易在發送之前卡住了，請重試',
      txStuck: '由於nonce gap，您的交易被卡住了',
      txPool: '您的交易已經開始',
      txStallConfirmed: '您的交易被卡住並確認，將從交易池中移除',
      txError: '您的交易出現錯誤，請重試',
      txSpeedUp: '增加交易提速',
    },
  },
}

export default zhHant
