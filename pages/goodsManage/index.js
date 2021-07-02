// pages/goodsManage/index.js
import { Request, toast, errorToast } from '../../utils/util.js'
let request = new Request()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedNav: 0,
    goodsList: [],
    query: {
      categoryid: null,
      storeId: '',
      keyword: '',
      lastPk: 0,
      page: 1,
      pageSize: 10,
      labelname: '',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'query.labelname': options.labelname
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
  },

  load (e) {
    let rows = e.detail.list
    let page = e.detail.page
    if (page == 1 && rows.length == 0) {
      this.setData({ goodsList: null })
    }
    if(rows.length > 0) {
      let goodsList = Object.assign([], this.data.goodsList)
      rows.forEach(row => {
        if(!row) {
          return
        }
        if (row.image_urls.indexOf(',')) {
          row.image_urls = row.image_urls.split(',')[0]
        }
        
        goodsList.push(row)
      })

      this.setData({ goodsList: goodsList})
    }
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
  onShareAppMessage: function () {

  }
})