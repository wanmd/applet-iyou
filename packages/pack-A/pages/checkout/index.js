var address_parse = require("../../smartWeChat/js/address_parse");
import { Request, toast, formDate } from '../../../../utils/util.js'
// import { Request, toast, formDate } from '../../utils/util.js'
let request = new Request()
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user__isAgent: false,
    isAgent__amount: 0,
    isVip__amount: 0,
    isGroup__amount: 0,
    autoH: true,
    orderNo : '',
    address : null,
    cartList : [],
    goodsCount : 0,
    amount : 0,
    remarks : [],
    ai__addressFlag: false,
    formData : {
      consignee : '',
      mobile : '',
      is_default : 0,
      province : '',
      city : '',
      district : '',
      address : ''
    },
    cartIds: '',
    type: 0,
    // 方式
    current: 1,
    option1: [
      {
          value: 1,
          label: '7天无理由'
      },
      {
          value: 2,
          label: '特殊商品不退换'
      }
    ],
    option: {
      initialValue: null
    },
    selfParams: {
      selfPickup: 1,
      pickupTime: '',
      consignee: '',
      mobile: '',
      pickupStatePart: 1
    }
  },
  smart: function (val){
    return address_parse.method(val || '')
  },
  getAddressData:function(){//手动重新挂载数据
    address_parse.getData()
  },

  selectAddress (address) {
    this.setData({ address: address})
  },

  input (e) {
    let remark = e.detail.value
    this.setData({
      remark
    })
  },

  confirm () {
    const { current } = this.data; // 1.快递物流  2.到店
    let address = this.data.address;

    if(current == 1 && address == null){
      toast('请选择收货地址')
      return
    }
    let cartIds = []
    let cartList = this.data.cartList
    cartList.forEach(item => {
      item.cart.forEach(cart => {
        cartIds.push(cart.id)
      })
    })

    let addressId = address.id

    console.log("提交订单")
    let data = {
      receiveId: addressId,
      orderNo: this.data.orderNo,
      type: this.data.type,
      remark: this.data.remark
    }
    if(this.data.type == 1){
      data['sorderNo'] = this.data.sorderNo;
      data['cartIds'] = this.data.cartIds;
    }
    if(this.data.type == 2){
      data['shareUserId'] = this.data.shareUserId;
    }
    data['selfPickup'] = 0;
    // 到店
    if(current == 2) {
      if (address == null) {
        toast('请选择收货地址')
        return
      } else {
        data['consignee'] = address.consignee;
        data['mobile'] = address.mobile;
      }
      const { pickupTime, pickupStatePart } = this.data.selfParams;
      if (!pickupTime) {
        toast('请选择到店或自提时间')
        return
      } 
      data['selfPickup'] = 1;
      data['pickupTime'] = pickupTime;
      data['pickupStatePart'] = pickupStatePart;
      
    }
    // 0 发起新团  >0 加入某个团
    data['groupId'] = Number(this.data.groupId) || 0
    console.log(data)
    const that = this;

    // request.post('cart/settlement', res => {
    request.post('iy/order/buy', res => {
        if(res.success){
          let params = res.data.wxparam
          params.success = () => {
            toast('提交成功')
            setTimeout(function(){
              if (that.data.isGroup == 1) {// 组团订单
                const q = '?from=checkout&groupId=' + res.data.groupId
                console.log(q);
                if (data.groupId) {// 拼别人的团  显示拼团成功
                  // debugger
                  wx.redirectTo({
                    url: '../order_user/group/success/index' + '?q=' + encodeURIComponent(q)
                  })
                } else { // 自己的团待分享给别人
                  // debugger
                  wx.redirectTo({
                    url: '../order_user/group/index' + '?q=' + encodeURIComponent(q)
                  })
                }
                
              } else {
                wx.redirectTo({
                  url: '../order_user/index'
                })
              }
              
            }, 1000)
          },
          params.fail = () => {
            toast('支付失败');
            let orderId = ''
            wx.redirectTo({
              url:'../order_user/index?status=1'
              // url:'../order_user/detail/index?orderId=' + orderId
            })
          }

          wx.requestPayment(params)
        }else{
          toast(res.msg)
        }
    // }, { address: addressId, orderNo: this.data.orderNo, remarks: this.data.remarks, cartIds: cartIds}).showLoading()
    }, data).showLoading()
  },
  order_buy(){

  },

  onLoad: function (options) {
    let userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo 
    this.setData({
      userInfo: userInfo
    })
    request.setMany(true)
    request.get('iy/delivery/address', res => {
      if(res.success){
        this.setData({address : res.data.address})
      }
    })
    var that = this;
    setTimeout(function(){
        that.getAddressData()//保险起见，手动挂载数据
    },10000) 
    let opt = options;
    let data = {};
    if(opt.type==1){//购物车下单
      // let cartIds = opt.cartIds.split(',')
      let cartIds = opt.cartIds;
      data = {
        cartIds: cartIds,
        type: opt.type
      }
      
      this.setData({type : opt.type, cartIds : cartIds, isGroup: opt.isGroup, groupId: opt.groupid })
    }else if(opt.type==2){//直接下单
      // console.log(JSON.parse(opt.productSpecs));
      
      data = {
        chatId: opt.chatId,
        goodsNum: opt.goodsNum,
        remark: opt.remark,
        shareUserId: opt.shareUserId || 0,
        type: opt.type,
        buyType: opt.buyType,
        productSpecs: JSON.parse(opt.productSpecs) || {},
        isGroup: opt.isGroup,
        groupId: opt.groupid
      }
      this.setData({type : opt.type, cartIds : opt.chatId, shareUserId: data.shareUserId, isGroup: opt.isGroup, groupId: opt.groupid})
    }
    console.log("data-----")
    console.log(data)

    // let dddd = '47,46,45,44,43'
    // let cartIds = dddd.split(',')
    // console.log(app.formatDecimal("1.20"))

    request.post('iy/cart/toorder', res => {
      if(res.success){
        // 别人打开拼团进入到订单提交页需要获取商家信息
        if (!wx.getStorageSync('storeInfo')) {
          getApp().globalData.STOREID = res.data.list[0].store_id;
          wx.setStorageSync('storeInfo', JSON.parse(res.data.list[0].store[0]))
        }

        let goodsCount = 0
        let amount = 0
        let remarks = []
        let user__isAgent = false;
        let isAgent__amount = 0;
        let isVip__amount = 0;
        let isGroup__amount = 0;
        res.data.list.forEach((v, index) => {
          remarks.push('')
          v.store = JSON.parse(v.store)
          v.id = index
          v.cart.forEach(item => {
            goodsCount += ~~item.quantity;
            let display = '';
            if(item.product_specs) {
                let product_specs =JSON.parse(item.product_specs);
                for (let key in product_specs) {
                    display +=  product_specs[key] + '/'
                }
                item.display = display.substr(0, display.length -1);
            }
            if(v.isAgent) {
              user__isAgent = true;
              isAgent__amount += (item.quantity * app.formatDecimal(item.agent_price))*100
              // amount += (~~item.quantity * app.formatDecimal(item.agent_price))*100
            }else if(!v.isAgent && this.data.userInfo.isVip==1){
              isVip__amount += (~~item.quantity * app.formatDecimal(item.member_price))*100
              // amount += (~~item.quantity * app.formatDecimal(item.member_price))*100
            }else if(!v.isAgent && !this.data.userInfo.isVip){
              if (opt.isGroup == 1) {//拼团
                isGroup__amount += (item.quantity * app.formatDecimal(item.group_price))*100
                // amount += (~~item.quantity * app.formatDecimal(item.group_price))*100
              } else {
                isGroup__amount += (item.quantity * app.formatDecimal(item.sale_price))*100
                // amount += (~~item.quantity * app.formatDecimal(item.sale_price))*100
              }
            }
            amount += (item.price)*100
          })
        })
        
        isAgent__amount = isAgent__amount/100;
        isVip__amount = isVip__amount/100;
        isGroup__amount = isGroup__amount/100;
        // amount = amount/100;
        this.setData({
            cartList: res.data.list, 
            goodsCount: goodsCount, 
            amount: amount/100, 
            remarks: remarks, 
            orderNo: res.data.orderNo,
            user__isAgent: user__isAgent,
            isAgent__amount: isAgent__amount,
            isVip__amount: isVip__amount,
            isGroup__amount: isGroup__amount
          })
        if(opt.type==1){
          this.setData({
            sorderNo: res.data.sorderNo
          })
        }
      } else {
        toast(res.msg);
        setTimeout(function(){
          wx.navigateBack()
        },1000) 
        
      }
    }, data).showLoading()

    request.setMany(false)
  },
  ai__addressShow(){
    this.setData({ ai__addressFlag: true})
    return false;
  },
  ai__addressHide(){
    this.setData({ ai__addressFlag: false})
    return false;
  },
  get__address(){
    var addressAI = this.smart(this.data.addressAI);
    var address = {
      consignee: addressAI.name || '',
      mobile: addressAI.phone || '',
      province: addressAI.province || '',
      city: addressAI.city || '',
      district: addressAI.county || '',
      address: addressAI.address || ''
    }
    var formData = {
      consignee : address.consignee,
      mobile : address.mobile,
      is_default : 0,
      province : address.province,
      city : address.city,
      district : address.district,
      address : address.address
    }
    this.setData({
      // addressAI: addressAI,
       ai__addressFlag: false,
       formData: formData,
      address: address
    })
    this.confirmAdd();
    console.log(address)
  },
  confirmAdd () {
    let formData = Object.assign({}, this.data.formData)
    // if (formData.consignee === ''){
    //   toast('请填写收货人')
    //   return
    // }
    // if (formData.mobile === '') {
    //   toast('请填写手机号码')
    //   return
    // }
    // if (!validmobile(formData.mobile)){
    //   toast('手机号码格式不正确')
    //   return
    // }
    // if (formData.province === '' || formData.city === '' || formData.district === '') {
    //   toast('请选择省市区')
    //   return
    // }
    // if (formData.address === '') {
    //   toast('请填写详细地址')
    //   return
    // }
    // let id = this.data.id
    // if(id > 0){
    // }
    // formData.id = id
    request.post('deliveryaddress/add', res => {
      if(res.success){
        toast('保存成功')
        let address = this.data.address;
        address.id = res.data.id;
        this.setData({
           address: address,
        })
      }else{
        toast(res.msg)
      }
    }, formData).showLoading()
  },
  textarea (e) {
    let index = e.currentTarget.dataset.index
    let remarks = e.detail.value
    var address = remarks
    this.setData({
      addressAI: address
    })
  },
  // 切换快递物流还是到店消费
  handleChange(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      current: index
    })
    if (index == 2) {
      this.getStoreInfo()
    }
  },
  getStoreInfo() {
    const { user_id: storeId } = wx.getStorageSync('storeInfo');
    request.get('iy/store/' + (storeId || getApp().globalData.STOREID), res => {
      res.data.list.name = res.data.list.name.substring(0,10)
      this.setData({
        storeInfo:  res.data.list
      })
    }, {}).showLoading()
  },
  bindChangePickupType(e) {
    this.setData({
      'selfParams.pickupStatePart': e.currentTarget.dataset.type
    })
  },
  // 自提时间
  handlePickupTime(e) {
    this.setData({
      'selfParams.pickupTime': Math.floor(new Date(e.detail.value).getTime()/1000)
    })
  },
  navToAddress() {
    wx.navigateTo({
      url: '/pages/deliveryAddress/index?target=select',
    })
  },
  daohang() {
    const { storeInfo } = this.data;
    if (!storeInfo.lat || !storeInfo.lng) {
      toast('该商家暂未设置位置信息');
      return
    }
    wx.openLocation({
        latitude: Number(storeInfo.lat),//要去的纬度-地址
        longitude: Number(storeInfo.lng),//要去的经度-地址
    })
  }
})