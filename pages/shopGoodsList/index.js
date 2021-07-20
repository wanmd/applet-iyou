import { Request, toast, maskNumber } from '../../utils/util.js'
let request = new Request()
let app = getApp();

wx.Page({

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
    keyword: '',
		goodsList: [],
		cartGoodsQuantity: '0',
		currentTab: null,
		navScrollLeft: 0,
		page: 1,
		pageSize: 10,
		hasNextPage: true,
    showDown: true,
    // 自定义导航
    // statusBarHeight: 0, // 顶部状态栏
    // navTop: 0, // 胶囊按钮与顶部的距离
    // nav_button_height: 0, // 胶囊按钮高度
    navHeight: 0,
    navTop: 0,
    query1: {
      categoryid: 0,
      storeId: 0,
      keyword: '',
      lastPk: 0
,			page: 1,
			pageSize: 10
    },
    query2: {
      storeId: 0,
      keyword: '',
    },
    showShopCarPop: false,// 规格弹框
    goods_id: null,
    cartList: [],
    gouwuPop: 0,// 购物袋弹框
    totalMoney: 0, // 总价
    saveMoney: 0,// 节省
    isAgent: null
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
    // this.initLabels()
  },

  initData() {
    request.setMany(true);
    this.getCategory()
    this.getGouwuDai()
  },
  // 分类
  getCategory() {
    const userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo;
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
        this.setData({ 
          sidebarData : list,
          sidebarId,
          // currentTab: 0,
          commodityList,
          userInfo
        })
        this.getGoodsList(sidebarId)
      }
    }, {parentid: 0})
  },
  // 购物袋
  getGouwuDai() {
    const { user_id: storeId } = wx.getStorageSync('storeInfo')
    wx._showLoading();
    request.get('iy/carts', res => {
      wx._hideLoading();
      // 只要本商户的加购产品
      let cartList = res.data.list.filter(item => item.store_id == storeId);
      let isAgent = res.data.isAgent;
      this.setData({
        isAgent
      })
      
      if (res.success) {
          if (cartList.length == 0) {
              this.setData({ cartList: [] });
              this.changeCountAndMoney(cartList)
          } else {
              this.setData({
                cartList: cartList.map(item => {
                  const image_urls = item.product.image_urls;
                  item.cover = image_urls.indexOf(',') ? image_urls.split(',')[0] : image_urls;
                  item.isAgent = isAgent;
                  item.productSpecs = item.product_specs
                  return item
                }), 
              })
              this.changeCountAndMoney(cartList)
          }
      } else {
          wx.showToast({ title: res.msg, icon: 'none' });
      }
    });
  },
  // 改变数量和总价
  changeCountAndMoney(cartList) {
    const { isVip } = wx.getStorageSync('storeInfo');
    let goodsCount = 0, totalMoney = 0, salesMoney = 0;
    console.log(cartList);
    cartList.forEach((item, index) => {
      item.agent_price = Number(item.agent_price).toFixed(2);
      let display = ''
      let product_specs = item.product_specs && JSON.parse(item.product_specs);
      for (let key in product_specs) {
          display +=  key + ':' + product_specs[key] + ';'
      }
      item.display = display;
      if (item.isAgent) {
        totalMoney += (item.quantity) * (item.agent_price)
      } else if(!item.isAgent && isVip) {
        totalMoney += (item.quantity) * (item.member_price)
      } else {
        totalMoney += (item.quantity) * (item.group_price)
      }
      goodsCount += (item.quantity);
      salesMoney += (item.sale_price)*(item.quantity);
    });
    console.log(cartList);
    this.setData({ 
      goodsCount, 
      totalMoney,
      saveMoney: salesMoney-totalMoney
    });
  },

  // 后退
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  // 切换导航
  handleNavTab(e) {
    const { current } = e.currentTarget.dataset;
    this.setData({
      current,
      keyword: ''
    }, () => {
      if (this.data.current == 1) {
        this.initData()
      } else {
        this.initLabels()
      }
    })
  },

  //选择侧边一级分类
	async sidebarClick(e) {
		const query = e.currentTarget ? e.currentTarget.dataset['id'] : e;
		if (query === this.data.sidebarId) return
    const { sidebarData } = this.data;
    const commodityList = sidebarData.filter(item => item.id == query)[0].son;
    
		this.setData({ 
      sidebarId: query, 
      // currentTab: 0,
      page: 1, 
      goodsList: [], 
      navScrollLeft: 0, 
      hasNextPage: true, 
      loading: true, 
      commodityList,
      currentTab: null,
    })
   
    this.getGoodsList(query)
  },
  
  //展开所有二级分类
	handleAllCategory(e) {
		this.setData({
			allCategoryMenu: !this.data.allCategoryMenu
		})
  },
  
  //切换二级分类
	async switchNav(event) {
    const { id } = event.currentTarget.dataset;
    const { sidebarId } = this.data;
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
			this.setData({
				currentTab: null,
				goodsList: [],
				allCategoryMenu: false,
				hasNextPage: true,
				page: 1,
			})
			this.getGoodsList(sidebarId)
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
    const value = e.detail.value;
    if (this.data.current == 1) {
      this.setData({
        'query1.keyword': value
      })
    } else {
      this.setData({
        'query2.keyword': value
      })
    }
  },

  // 确定搜索
  search(e) {
    if (this.data.current == 1) {
      this.getGoodsList(this.data.query1.categoryid)
    } else {
      this.initLabels()
    }
  },

  
  getGoodsList(query) {
		let hasNextPage = this.data.hasNextPage
    this.setData({
      'query1.categoryid': query || null
    })
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
            item.member_price = (item.isAgent || this.data.userInfo.isVip) ? Number(item.member_price).toFixed(2) : maskNumber(Number(item.member_price).toFixed(2));
            return item
          }),
          loading: false
        })
      } else {
        this.setData({
          loading: false
        })
      }
    }, this.data.query1)
  },
  // 获取标签列表
  initLabels() {
    request.get('iy/labels', res => {
      if(res.success){
        console.log(res);
        this.setData({
          labelsList: [...res.data.list]
        })
      }
    }, this.data.query2).showLoading()
  },

  navTo(e) {
    const { name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/goodsManage/index?labelname=' + name,
    })
  },

  // 购物车弹框
  showGoodsPopup(e) {
    // 产品id
    const { goods_id } = e.currentTarget.dataset;
    
    this.setData({
        showShopCarPop: true,
        goods_id 
    })
  },
  // 确认规格
  handleOK(e) {
    this.getGouwuDai();
    this.setData({
      showShopCarPop: false,
    })
  },
  // 弹起购物袋弹窗
  showCartsPop() {
    console.log('showCartsPop');
    this.setData({
      gouwuPop: true
    })
  },
  toggleShowCartsPop() {

  },
  toggleShowGouwuPop(e) {
    const { target } = e.currentTarget.dataset;
    if (target === 'modal') return;
    this.setData({
      gouwuPop: !this.data.gouwuPop
    })
  },
  // 清空购物篮
  emptyCartsData() {
    if (!this.data.cartList.length) {
      toast('无可清空项目');
      return
    }
    wx.showModal({
      title: '确任清空购物篮？',
      content: '',
      success: res => {
          if (res.confirm) {
            let cartIds = this.getCurrentIds().split(',');
            this.deleteGoods(cartIds)
          }
      }
    })
  },
  deleteGoods(ids) {
    const that = this;
    this.post('iy/cart/delete', { cartIds: ids }).then(res => {
        if (res.success) {
            wx._showToast('删除成功');
            that.getGouwuDai();
        } else {
            wx._showToast(res.msg);
        }
    });
  },
  // 数量加减
  operaTap(e) {
    const { flag, index } = e.currentTarget.dataset;
    const { quantity, id, remark } = this.data.cartList[index];
    const newQuantity = flag === '-' ? quantity - 1 : quantity + 1;

    if(newQuantity) {
      const callback = () => {
        let update = {};
        update[`cartList[${index}].quantity`] = newQuantity;
        this.setData(update)
        this.changeCountAndMoney(this.data.cartList)
      }
      this.changeCart(newQuantity, id, remark, callback)
    } else {
      this.deleteGoods([id])
    }

    
  },
  // 编辑数量
  changeCart(q, id, remark, callback) {
    wx.showToast({ title: '修改中', icon: 'none' });
    this.post('iy/cart/change', { id: id, quantity: q, remark: remark }).then(res => {
      if (res.success) {
          toast("修改成功");
          callback && callback()
      } else {
          toast(res.msg);
      }
    });
  },
  getCurrentIds() {
    let cartIds = []
    let { cartList } = this.data;
    for (let i = 0; i < cartList.length; i++) {
      let item = cartList[i];
      if(item.quantity) {
        cartIds = cartIds.concat(item.id)
      }
    }
    return cartIds.join(',');
  },
  // 下单
  postOrder() {
    let { cartList } = this.data;
    if (!cartList.length) {
      toast('请先加购商品再下单');
      return
    }
    let cartIds = this.getCurrentIds();
    wx.navigateTo({
      url: '../../packages/pack-A/pages/checkout/index?cartIds=' + cartIds + '&type=1'
    });
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