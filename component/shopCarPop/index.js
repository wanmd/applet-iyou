// component/shopCarPop/index.js
import { Request, toast, maskNumber } from '../../utils/util.js'
import { bannerUrl, ALIYUN_URL } from '../../utils/config.js'
let request = new Request()
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 要不要触底
    mode: {
      type: String,
      value: 'b0'
    }, 
    show: {
      type: Boolean,
      value: true
    },
    goods_id: { // 产品id
      type: Number,
      value: 0
    } ,
    groupid: { // 产品id
      type: Number,
      value: 0
    } ,
    user: { // 商家信息
      type: String,
      value: ''
    },
    needSelectType: {// 选择规格前需不需要选底部拿货类型
      type: Boolean,
      value: true
    },
    type: { // 拿货类型
      type: String,
      value: ''
    }
  },

  observers:{
    'show, goods_id': function(show, goods_id) {
      console.log(show, goods_id);
      if(show && goods_id) {
        this.initData()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseUrl: ALIYUN_URL,
    detail: {},
    // 能否选择
    canSelect: false,
    // 能否确定
    canConfirm: false,
    // 操作类型
    type: '',
    num: 1,
    goodName: '',
    // 价格
    header_price: '',//顶部展示价格
    price_1: '',// 一件代发价格
    price_2: '',// 代理价格
    userType: '',// 用户身份
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData() {
      const { type } = this.data;
      let type_title = '';

      switch(type) {
        case 'cart':
          type_title = '加入购物车'
          break
        case 'single':
          type_title = '单独购买'
          break
        case 'group':
          type_title = '拼单购买'
          break
      }
      if(!this.data.needSelectType) {
        this.setData({
          canSelect: true,
          type_title
        })
      }
      this.getDetail()
    },
    getDetail() {
      request.get('iy/product/' + this.data.goods_id, res => {
        if (res.success) {
          // console.log(res);
          // 改造数据结构
          res.data.image_urls = res.data.image_urls.split(',')[0];
          res.data.attribute = res.data.attribute.map(item => {
            item.value = item.value.map(iitem => {
              let obj = {};
              obj.name = iitem;
              obj.parentName = item.name;
              obj.active =  false;
              return obj
            })
            return item
          })
          // 根据用户身份计算最低价
          // 一般用户 一件代发(会员价) + 代理拿货(代理价) 
          // 会员用户 一件代发(会员价) + 代理拿货(代理价) 
          // 代理用户 一件代发(代理价) + 代理拿货(代理价)
          const userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo;
          const { isAgent } = res.data;
          const { isVip } = userInfo;


          let specs = res.data.specs;
          let sale_price = specs.sort(function(a, b) {
            return a.sale_price - b.sale_price
          })
          let group_price = specs.sort(function(a, b) {
            return a.group_price - b.group_price
          })
          let agent_price = specs.sort(function(a, b) {
            return a.agent_price - b.agent_price
          })
          // 用户价格显示区别：
          // 1 一般用户单击单独购买：
          // 零售价
          // 2.一般用户单击拼单购买：
          // 拼单价+划线零售价
          // 3.会员用户单击单独购买+拼单购买都展示：
          // 会员价（公开报价）+划线零售价
          // 会员价（公开报价）+划线拼单价
          // 4此商家代理单击单独购买+拼单购买都展示：
          // 代理价（拿货价）+划线零售价
          // 代理价（拿货价）+划线拼单价


          // 一般用户
          if (!isVip && !isAgent) {
            this.setData({
              userType: 'normal',
              price_1: sale_price[0].sale_price,
              price_2: group_price[0].group_price
            })
          }
          // 会员用户
          if (isVip && !isAgent) {
            this.setData({
              userType: 'member',
              price_1: member_price[0].member_price,
              price_2: group_price[0].group_price
            })
          }
          // 代理
          if (isAgent) {
            this.setData({
              userType: 'agent',
              price_1: agent_price[0].agent_price,
              price_2: group_price[0].group_price
            })
          }
          console.log(res.data);
          this.setData({ 
            detail: res.data
          })
        } else {
          toast(res.msg)
        }
     }, {}).showLoading()
    },
     /**
     * 显示/关闭分享弹窗
     */
    toggleSelectShareType(e) {
      const { current } = e.currentTarget.dataset;
      const { show } = this.data;
      if (current === 'sliup_1' && show) {
        this.setData({
          show: false,
          header_price: '',
          price_1: '',
          price_2: '',
          type: ''
        })
      }
    },
    // 数量加减
    operaTap(e) {
      if (!this.data.canSelect) {
        toast("请先选择+购物车、单独购买或者代理拿货后再进行选择");
        return
      }
      let { flag } = e.currentTarget.dataset;
      let { num } = this.data;
      if (flag === '-') {
        if (num == 1 || num < 1) {
          return
        } else {
          this.setData({
            num: num - 1
          })
        }
      } else {
        this.setData({
          num: num + 1
        })
      }
    },
    // 数量键盘输入
    handleInput(e) {
      if (!this.data.canSelect) {
        toast("请先选择+购物车、单独购买或者代理拿货后再进行选择");
        return
      }
      this.setData({
        num: Math.floor(e.detail.value)
      })
    },
    // 操作按钮
    handleChangeOpea(e) {
      const { type } = e.currentTarget.dataset;
      const { price_1, price_2, detail } = this.data;
      const { isAgent } = detail;
      const { nickname, user_id } = this.data.user ? JSON.parse(this.data.user) : wx.getStorageSync('userinfo');
      let header_price = '';

      this.setData({
        type,
        canSelect: true
      })

      if (!this.data.canConfirm) {
        switch(type) {
          case 'cart':
            // header_price = price_1
            break
          case 'single':
            // header_price = price_1
            break
          case 'group':
            // if (!isAgent) {
            //   wx.navigateTo({
            //     url: `/pages/applyAgent/index?storeId=${user_id}&storeName=${nickname}`,
            //   })
            //   return
            // }
            // header_price = price_2
            break
        }
      } else {
        this.changePriceShow()
      }
    },
    // 切换拼单购买
    handleGroupBuy() {
      this.setData({
        type: 'group',
        type_title: '拼单购买'
      })
      this.handleSelect(this.data.e)
    },
    // 选取规格型号
    handleSelect(e) {
      if (!this.data.canSelect) {
        toast("请先选择+购物车、单独购买或者代理拿货后再进行选择");
        return
      }
      this.setData({
        e
      })
      const { index, vindex } = e.currentTarget.dataset;
      // 当前选中规格所在的数组
      let selectValues = this.data.detail.attribute[index].value;
      let newSelectValues = selectValues.map((sitem, sindex) => {
        sitem.active = false;
        if(sindex === vindex) {
          sitem.active = true
        }
        return sitem
      })
      let update = {};
      update[`detail.attribute[${index}].value`] = newSelectValues;
      this.setData(update);
      // 改变一些商品属性展示
      this.changeGood_arr()
    },
    changeGood_arr() {
      let goodName = '';
      let { detail } = this.data;
      let { attribute } = detail;
      let times = 0;
      let values = attribute.map(item => item.value);

      values.forEach(item => {
        if (item.some(i => i.active)) {
          console.log(item);
          goodName = goodName + (goodName ? '-' : '') + item.filter(v => v.active)[0].name;
          
          times ++;
        }
      })
      // 有没有选取好全部的规格  只有选取了所有规格后才能展示
      const canConfirm = times === values.length;
      if (canConfirm) {
        this.changePriceShow()
      }
      this.setData({
        goodName,
        canConfirm
      })
    },
    // 改变价格显示
    changePriceShow() {
      let { detail } = this.data;
      let { attribute, specs } = detail;
      // 产品规格
      let product_specs = {};

      let values = attribute.map(item => item.value);
      values.forEach(item => {
        item.forEach(v=> {
          if(v.active) {
            product_specs[v.parentName] = v.name
          }
        })
      })
      console.log(product_specs);
      // 将选中的产品规格和商品详情里面返回的产品规格进行比较，得到那一项查出价格
      let select_product_specs;
      
      for (let i = 0; i <specs.length;i++) {
        const item = specs[i];
        let flag = true;
        for (let key in item.product_specs) {
          if(product_specs[key] !== item.product_specs[key]) {
            flag = false;
          }
        }
        if (flag) {
          select_product_specs = item;
          break
        }
      }
      console.log(select_product_specs);
      const { agent_price, member_price, group_price, sale_price } = select_product_specs;
      const { userType, type } = this.data;

      switch(userType) {
        case 'normal':
          this.setData({
            price_1: sale_price,
            price_2: group_price,
            header_price: type === 'group' ? group_price : sale_price
          })
          break
        case 'member':
          this.setData({
            price_1: member_price,
            price_2: group_price,
            header_price: member_price
          })
          break
        case 'agent':
          this.setData({
            price_1: agent_price,
            price_2: agent_price,
            header_price: agent_price
          })
          break
      }
      
      
    },
    // 确定提交
    handleSubmit() {
      const { type } = this.data;

      switch(type) {
        case 'cart':
          this.postCart();
          break
        case 'single':
          this.postBuy(2);
          break
        case 'group':
          this.postBuy(1);
          break
      }
    },

    getProductSpecs() {
      const { detail } = this.data;
      const { attribute } = detail;
      let obj = {};
      let values = attribute.map(item => item.value);
      values.forEach(item => {
        item.forEach(i => {
          if(i.active) {
            obj[i.parentName] = i.name;
          }
        })
      })
      return obj
    },
    // 加入购物车
    postCart() {
      const { detail, num } = this.data;
      if (!num) {
        toast('数量不正确');
        return
      }

      const data = {
        id: detail.chat_id || 0,
        remark: detail.remark || '',
        shareUserId: detail.shareUserId || 0,
        quantity: num,
        productSpecs: this.getProductSpecs()
      }
      request.post('iy/cart/add', res => {
        if(res.success){
          toast('加入购物车成功!')
          this.setData({
            show: false,
            type: '',
            canSelect: false
          })
          return
        }else{
          toast(res.msg)
        }
      }, data).showLoading()
    },
    // 购买
    postBuy(isGroup = 2) { // 是否拼单购买 1-是 2-否 一般用户生效
      const { detail, num: goodsNum, userType } = this.data;
      const { chat_id: chatId, remark = '', shareUserId = 0 } = detail;
      const productSpecs = JSON.stringify(this.getProductSpecs());
      const buyType =  userType === 'agent' ? 2 : 1; // 1-普通用户 2-会员购买
      const prefix = '../../packages/pack-A/pages/checkout/index?chatId=' ;
      const { groupid } = this.data;

      wx.navigateTo({
        url: prefix + chatId + "&goodsNum=" + goodsNum + "&remark=" + remark + "&type=2&shareUserId=" + shareUserId + '&isGroup='+ isGroup + '&groupid=' + groupid + '&productSpecs=' + productSpecs + '&buyType=' + buyType,
      });
    }
  }
})
