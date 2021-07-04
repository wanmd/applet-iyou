Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  navToOrderDetail() {
    wx.navigateTo({
      url: '',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo 
    this.setData({
      userInfo: userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
     * 用户点击右上角分享
     */
  onShareAppMessage: function() {
    var sceneStr = '?from=ordergroup&&ci=' + (this.data.chatId || 0)+ '&id=' + (this.data.id || 0);

    sceneStr += ('&fromUserId=' + app.globalData.userInfo.user_id)

    let path = '/packages/pack-A/pages/order_user/group/index?scene=' + encodeURIComponent(sceneStr)
    // let path = '/pages/index/index?scene=' + encodeURIComponent(sceneStr) + 'chatId=' + encodeURIComponent(this.data.chatId) + "&shareUserId=" + app.globalData.userInfo.user_id
    // console.log(path);
    // let picture = this.data.rentingData.picture[0];
    return {
        path: path,
        imageUrl: '',
        title: '好物分享'
    }
  }
})