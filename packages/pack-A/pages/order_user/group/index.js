import { Request, toast } from '../../../../../utils/util.js'
import { ALIYUN_URL } from '../../../../../utils/config'
let request = new Request()
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupInfo: {}
  },

  navToOrderDetail() {
    wx.navigateTo({
      url: '/packages/pack-A/pages/order_user/detail/index?index=0&orderId=' + this.data.groupInfo.order_id,
    })
  },

  geturlData(url){
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
      var str = url.split("?");
      theRequest['url'] = str[0];
      str = str[1];
      console.log(str)
      var strs = str.split("&");
      console.log(strs)
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let q = decodeURIComponent(options.q)
    let urlData = this.geturlData(q);
    
    let userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo 

    this.setData({
      userInfo: userInfo,
      groupId: urlData.groupId,
      from: urlData.from
    })
    // if (urlData.from == 'ordergroup') {

    // } else {

    // }
    this.getGroupInfo()
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
    
  },

  getGroupInfo() {
    request.get('iy/productgroup/' + this.data.groupId, res => {
      if(res.success){
        res.data.list.difftime = res.data.list.created_at + 86400 - Math.floor(new Date().getTime()/1000)
        let product_specs = res.data.list.product_specs;
        this.setData({
          groupInfo: res.data.list,
          product_specs: product_specs.substring(1,product_specs.length -1)
        })
      }
    }).showLoading()
  },

  handlePick() {
    getApp().requireLogin();
    this.setData({
      showShopCarPop: true,
      goods_id: this.data.groupInfo.product_id
    })
  },

  more() {
    wx.navigateTo({
      url: '/pages/home/index',
    })
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
    const { groupInfo } = this.data;
    var sceneStr = '?from=ordergroup' + '&groupId=' + (this.data.groupId || 0);

    let path = '/packages/pack-A/pages/order_user/group/index' + '?q=' + encodeURIComponent(sceneStr)
    console.log(path);
    
    return {
        path: path,
        imageUrl: ALIYUN_URL + '/' + groupInfo.cover,
        title: groupInfo.goods_name
    }
  }
})