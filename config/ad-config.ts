export const adConfig = {
  placements: {
    topBanner: {
      id: 'top-banner',
      size: [320, 50],
      refreshInterval: 30000, // 30秒
    },
    middleSquare: {
      id: 'middle-square',
      size: [300, 250],
      refreshInterval: 60000, // 60秒
    },
    bottomBanner: {
      id: 'bottom-banner',
      size: [320, 50],
      refreshInterval: 30000,
    },
    floatingButton: {
      id: 'floating-btn',
      size: [120, 60],
      refreshInterval: 45000,
    },
  },
  settings: {
    maxAdsPerPage: 4,
    minTimeBetweenRefresh: 30000,
    enableAutoRefresh: true,
    preloadAds: true,
  },
  targeting: {
    allowPersonalization: true,
    gameSpecific: true,
    userBehavior: true,
  },
}

