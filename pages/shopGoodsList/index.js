import { Request, toast } from '../../utils/util.js'
let request = new Request()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    error: undefined,
    loading: false,
    allCategoryMenu: false, // 是否展开所有二级分类
    current: 1, // 顶部导航activeIndex
    sidebarId: null,
    // 左侧一级分类列表
    sidebarData: [],
    // 二级分类列表
    commodityList: [],
    // 搜索关键字
    goodsName: '',
		goodsList: [],
		cartGoodsQuantity: '0',
		currentTab: null,
		navScrollLeft: 0,
		page: 1,
		pageSize: 10,
		hasNextPage: true,
    showDown: true,
    // 自定义导航
    topHeight: 0,
    // statusBarHeight: 0, // 顶部状态栏
    // navTop: 0, // 胶囊按钮与顶部的距离
    // nav_button_height: 0, // 胶囊按钮高度
    navHeight: 0,
    navTop: 0,
    windowHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度

        this.setData({
          navHeight,
          navTop,
          menuButtonHeight: menuButtonObject.height,
          windowHeight: res.windowHeight
        })
      },
      fail(err) {
        console.log(err);
      }
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
    this.initData()
  },

  initData() {
    request.setMany(true);
    request.get('iy/productcategories', res => {
      if(res.success){
        let { list } = res.data;
        let sidebarId = list.length > 0 ? list[0].id : null;
        let commodityList = [];
        list.forEach(item => {
          if (item.id === sidebarId) {
            commodityList = item.son
          }
        })
        console.log(commodityList);
        this.setData({ 
          sidebarData : list,
          sidebarId,
          currentTab: 0,
          commodityList,
        })
        this.getGoodsList(commodityList[0] ? commodityList[0].id : null)
      }
    }, {parentid: 0})
  },

  // 后退
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  // 切换顶部
  handleNav(e) {
    const { current } = e.currentTarget.dataset;
    this.setData({
      current
    })
  },

  //选择分类
	async sidebarClick(e) {
    console.log(e);
		const query = e.currentTarget ? e.currentTarget.dataset['id'] : e;
		if (query === this.data.sidebarId) return
    const { sidebarData } = this.data;
    const commodityList = sidebarData.filter(item => item.id == query)[0].son;
    
		this.setData({ 
      sidebarId: query, 
      currentTab: 0,
      page: 1, 
      goodsList: [], 
      navScrollLeft: 0, 
      hasNextPage: true, 
      loading: true, 
      commodityList
    })
   
    this.getGoodsList(commodityList.length ? commodityList[0].id : null)
  },
  
  //展开所有分类
	handleAllCategory(e) {
		this.setData({
			allCategoryMenu: !this.data.allCategoryMenu
		})
  },
  
  //切换分类
	async switchNav(event) {
    const { id } = event.currentTarget.dataset;
		//console.log(event)
		var cur = event.currentTarget.dataset.current;
		//每个tab选项宽度占1/5
		var singleNavWidth = this.data.windowWidth / 5;
		//tab选项居中                            
		this.setData({
			// navScrollLeft: 85
			navScrollLeft: ((cur - 2) * singleNavWidth) + 10
		})
		if (this.data.currentTab == cur) {
			return false;
		} else {
			this.setData({
				currentTab: cur,
				goodsList: [],
				allCategoryMenu: false,
				hasNextPage: true,
				page: 1,
			})
			this.getGoodsList(id)
		}
  },

  // 监听input变化
  bindinput_(e) {
    console.log(e);
    this.setData({
      goodsName: e.detail.value
    })
  },

  // 确定搜索
  search(e) {
    const { target } = e.currentTarget.dataset;
    console.log(target);
  },

  
  getGoodsList(query) {
		let cIdx = this.data.currentTab
		let categoryId = query || null
		//console.log(categoryId)
		let page = this.data.page
		let pageSize = this.data.pageSize
		let goodsListVal = this.data.goodsList
		let hasNextPage = this.data.hasNextPage
		let dataInfo = {
			categoryId: categoryId,
			page: page,
			pageSize: pageSize
		}
		if (!hasNextPage) {
			wx.hideLoading()
			return
		}
		// wx.showLoading({ mask: 'true', title: '加载中.....' })
		this.setData({
			loading: true
    })
    
    request.get('iy/products', res => {
      if(res.success){
        this.setData({
          goodsList: res.data.list.map(item => {
            item.image_urls = item.image_urls.indexOf(',') ? item.image_urls.split(',')[0] : item.image_urls;
            return item
          }),
          loading: false
        })
      } else {
        this.setData({
          loading: false
        })
      }
      
    }, {categoryid: categoryId})

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