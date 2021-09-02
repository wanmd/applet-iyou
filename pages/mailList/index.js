
wx.Page({

  data: {
    selectedNav : 1,
    // urls: ['mail/follows', 'mail/fans', 'mail/agent', 'mail/merchant'],
    urls: ['iy/mail/follows'],
    query: { isstore: 1 },
    topNavs: [
      // { type: 1, name: '关注的店' }, 
      // { type: 2, name: '粉丝' }, 
      // { type: 3, name: '我的代理' }, 
      // { type: 4, name: '我的商户' }
    ],
    userList : []
  },

  // toggleType (e) {
  //   let type = e.currentTarget.dataset.type
  //   let selectedNav = this.data.selectedNav
  //   if (selectedNav == type) {
  //     return
  //   }

  //   this.setData({ selectedNav: type, userList: []})
  //   wx.nextTick(() => {
  //     this.selectComponent('#pagination').initLoad()
  //   })
  // },

  load (e) {
    console.log(e);
    let rows = e.detail.list
    let page = e.detail.page
    if (page == 1 && rows.length == 0) {
      this.setData({ userList: null })
    }
    if(rows.length > 0) {
      let userList = Object.assign([], this.data.userList)
      rows.forEach(row => {
        if(!row) {
          return
        }
        row.user = JSON.parse(row.user);
        userList.push(row)
      })

      this.setData({ userList: userList})
    }
  },

  changeStore(e) {
    // 重置
    getApp().globalData.STOREID = 0;
    const { user } = e.currentTarget.dataset;
    const { user_id } = user;
    user.storeId = user_id;
    wx.setStorageSync('storeInfo', user);
    wx.switchTab({
      url: '/pages/home/index',
    })
  },

  onLoad: function (opts) {
    if(opts.nav) this.setData({selectedNav:opts.nav})
  }
})