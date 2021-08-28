import { Request, toast } from '../../../../utils/util.js'
// import orderlist1 from '../../../../utils/mack/orderlist.js'
let request = new Request()
let app = getApp()
var numberInter = null
Page({
  data: {
    userType : 1,
    query: {
      status: 5,
    },
    orderList: [],
    showCancelConfirm: false,
    currentIndex: -1,

    pageHude: false,
    number1 : 0,
    number2: 0,
    orderCount: {
      waitPayNum: 0,
      waitReceiveNum: 0,
      waitSendNum: 0,
      hasDoneNum: 0,
    },
    current: 1,
    selfPayShow: 0,
    keyword: ''
  },

  selectToggle(e) {
    let status = parseInt(e.currentTarget.dataset.status)
    if (status == 100) {
      this.setData({
        'query.groupstate': 1
      })
    } else {
      this.setData({
        'query.groupstate': ''
      })
    }
    // if (this.data.query.status == status) {
    //   return
    // }
    this.setData({ orderList: [] })
    this.setData({ 'query.status': status == 100 ? 2 : status })
    this.selectComponent('#pagination').initLoad()
  },

  load(e) {
    let rows = e.detail.list
    // let rows = orderlist1.data.list
    let page = e.detail.page
    let orderList = [];
    if(page == 1){
      orderList = [];
    }else{
      orderList = Object.assign([], this.data.orderList)
    }
    rows.forEach(item => {
      item.delivery = { remarks: item.remarks, consignee: item.consignee, mobile: item.mobile, province: item.province, city: item.city, district: item.district, address: item.address }
      if (item.goods && item.goods.length) {
        item.goods.forEach(gitem => {
          let display = '';
          if(gitem.product_specs) {
              let specs =JSON.parse(gitem.product_specs);
              for (let key in specs) {
                  display +=  specs[key] + '/'
              }
              display = display.substr(0, display.length -1);
          }
          gitem.product_specs = display;
        })
      }
      orderList.push(item)
    })

    this.setData({ orderList: orderList })
  },

  updateOrderList (index) {
    let orderList = this.data.orderList
    orderList.splice(index, 1)
    this.setData({ orderList: orderList })
    if (orderList.length == 0) {
      this.selectComponent('#pagination').initLoad()
    }
  },

  cancelOrder(e) {
    let index = e.currentTarget.dataset.index
    this.setData({ currentIndex: index })
    this.setData({ showCancelConfirm: true })
  },

  cancelCallback(e) {
    this.setData({ showCancelConfirm: false })
    let that = this;
    if (e.detail == 0) {
      let index = this.data.currentIndex
      let orderId = this.data.orderList[index].order_id
      request.post('iy/order/cancel', res => {
        if (res.success) {
          toast('取消订单成功')
          // that.onLoad(this.data.query)
          let pagination = this.selectComponent('#pagination');
          pagination.initLoad()
          this.onShow();
        } else {
          toast(res.msg)
        }
      }, { orderId: orderId }).showLoading()
    }
  },


  confirmComplete (e) { //确定收货
    let index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确定收货',
      content: '请确定已经收到商品',
      success : res => {
        if (res.confirm) {
          this.completeOrder(index)
        }
      }
    })
    // let orderId = this.data.orderId
    // let that = this
    // wx.showModal({
    //   title: '确定收货',
    //   content: '请确定已经收到商品',
    //   success: res => {
    //     if (res.confirm) {
    //       request.post('order/complete', res => {
    //         if(res.success) {
    //           toast('确定成功')
    //           that.onLoad(this.data.query)
    //         }else{
    //           toast(res.msg)
    //         }
    //       }, {id : orderId})
    //     }
    //   }
    // })
  },

  completeOrder (index) {
    let orderId = this.data.orderList[index].order_id
    request.post('iy/order/complete', res => {
      if (res.success) {
        toast('确定成功')
        let query = this.data.query;
        query.status = 4;
        this.setData({query: query,pageHude: true})
        this.onShow();
      } else {
        toast(res.msg)
      }
    }, { id: orderId })
  },
  // 产品订单
  getOrderList() {
    if(this.data.pageHude){
      // this.onLoad(this.data.query)
      request.get('iy/order/list', res => {
        if (res.success && res.data.list.length > 0) {
          this.load({ detail: { list: res.data.list, page: 1 } }, 1)
        }
      }, { status: this.data.query.status, lastPk: 0, page: 1, pageSize: 20, keyword: this.data.query.keyword  }) 
    }
  },
  // 拿货订单
  // getMyTakeGoodsList() {
  //   request.get('iy/getMyTakeGoodsList', res => {
  //     if (res.success && res.data.list.length > 0) {
  //       this.load({ detail: { list: res.data.list, page: 1 } }, 1)
  //     }
  //   }, { status: this.data.query.status, lastPk: 0, page: 1, pageSize: 20 }) 
  // },

  getNumber () {
    var req = new Request()
    req.get('order/number', res => {
      clearTimeout(numberInter)
      numberInter = setTimeout(() => {
        this.getNumber()
      }, 3000)
      if(res.success) {
        var data = res.data
        if('number1' in data) {
          this.setData({number1 : data.number1})
        }
        if ('number2' in data) {
          this.setData({ number2: data.number2 })
        }
      }
    })
  },
  getOrderCount(type) {
    request.get('iy/order/getOrderCount', res => {
      if (res.success) {
        let orderCount = res.data.info;
          this.setData({
            orderCount: orderCount
          })
      } else {
        toast(res.msg)
      }
    }, {type: type})
  },
  onLoad (options) {
    console.log('onLoad')
    let userInfo = app.globalData.userInfo || {}
    if (userInfo.user_type == 2) {
      this.setData({ userType: userInfo.user_type })
    }
    let opt = options;
    if(options&&options.status){
      let query = {
        status: options.status || 5,
        groupstate: options.groupstate || ''
      }
      this.setData({ query: query })
    }
    // this.getNumber();
  },
  onShow () {
    request.setMany(true);
    // this.getOrderList()
    this.getOrderCount(1);
  },

  onHide () {
    this.setData({ pageHude: true })

  },
  onUnload () {
    clearTimeout(numberInter)
  },
  toggleSelfPay(e) {
    console.log(e);
    
    const { storeid, id, index } = e.currentTarget.dataset;
    this.setData({
      selfPayShow: !this.data.selfPayShow,
      selfpayId: id,
      selfpayIndex: index,
      storeid,
    })
  },
  handleSubmit(data) {
    console.log(data);
    let params = {
      payPicture: data.detail.reduce((prev, next) => {
        return prev.concat(next.file)
      },[])
    }
    console.log(params);
    request.post('iy/order/selfpay/' + this.data.selfpayId, res => {
      if (res.success) {
        toast('提交成功');
        let update = {};
        update[`orderList[${this.data.selfpayIndex}].pay_picture`] = 100;
        update.selfPayShow = !this.data.selfPayShow;
        this.setData(update);
        this.selectToggle(
          {
            currentTarget: {
              dataset: {
                status: 2
              }
            }
          }
        )
      } else {
        toast(res.msg)
      }
    }, params)
  },
  bindinput_(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      'query.keyword': keyword
    })
  },
  search() {
    this.setData({ orderList: [] })
    this.selectComponent('#pagination').initLoad()
  },
  handleDelete_keyword() {
    this.setData({
      keyword: '',
      'query.keyword': ''
    })
    this.search()
  }
})
