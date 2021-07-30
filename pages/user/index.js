import {
    Request,
    toast
} from '../../utils/util.js'
import { ALIYUN_URL } from '../../utils/config.js';

let request = new Request()
let app = getApp()
Component({

    /**
     * 页面的初始数据
     */
    data: {
        ALIYUN_URL,
        showlink: 0,
        url: 'https://mp.weixin.qq.com/s/Qmb1KZ1cLA-K4qXIGgv9AA',
        showBindMobileModel: false,
        userType: 1,
        numbers: {},
        orderCount: {
            waitPayNum: 0,
            waitReceiveNum: 0,
            waitSendNum: 0,
            hasDoneNum: 0,
        },
        orderCount2: {
            waitPayNum: 0,
            waitReceiveNum: 0,
            waitSendNum: 0,
            hasDoneNum: 0,
        },
        userInfo: {
            avatar: '',
            nickname: ''
        },

        setUrl: '',
        personManageList: [
            {
                image: '../../assets/images/iyou_user/youhuiquan@2x.png',
                text: '优惠券',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/jifen@2x.png',
                text: '积分',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/shoucang@2x.png',
                text: '收藏夹',
                url: '/pages/collection/index',
            },
            {
                image: '../../assets/images/iyou_user/dianzan@2x.png',
                text: '点赞',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/guanzhu@2x.png',
                text: '关注的店',
                url: '/pages/mailList/index',
            },
            {
                image: '../../assets/images/iyou_user/liulan@2x.png',
                text: '浏览历史',
                url: '/pages/browse/index',
            },
            {
                image: '../../assets/images/iyou_user/record@2x.png',
                text: '拿货记录',
                url: '../../packages/pack-A/pages/offer/index',
            },
            {
                image: '../../assets/images/iyou_user/address@2x.png',
                text: '收货地址',
                url: '/pages/deliveryAddress/index',
            },
            {
                image: '../../assets/images/iyou_user/remark@2x.png',
                text: '建议留言',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/rebate@2x.png',
                text: '返利小金库',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/contact@2x.png',
                text: '联系我们',
                url: '',
                method: 'handleContact'
            },
            {
                image: '../../assets/images/iyou_user/setting@2x.png',
                text: '设置',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/message@2x.png',
                text: '开启通知',
                url: '',
            },
            {
                image: '../../assets/images/iyou_user/organizag@2x.png',
                text: '找组织',
                url: '',
            }
        ]
    },
    methods: {
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function(options) {},
        onShow() {
            request.setMany(true);
            let userInfo = wx.getStorageSync('userinfo') || app.globalData.userInfo;
            if (userInfo) {
                this.setData({
                    userInfo: userInfo,
                    userType: userInfo.user_type
                })
            }
            this.getOrderCount(1);
            if (this.data.userType == 2) {
                this.getOrderCount(2);
            }
        },
        getOrderCount(type) {
            request.get('iy/order/getOrderCount', res => {
                if (res.success) {
                    let orderCount = res.data.info;
                    if (type == 1) {
                        this.setData({
                            orderCount: orderCount
                        })
                    } else if (type == 2) {
                        this.setData({
                            orderCount2: orderCount
                        })
                    }
                } else {
                    toast(res.msg)
                }
            }, { type: type })
        },
        toMyPage() {
            app.requireLogin(`/pages/homepage/index?userId=${this.data.userInfo.user_id}`)
        },
        operate(e) {
            console.log(e);
            app.requireLogin(e.currentTarget.dataset.url)
        },

        close() {
            this.setData({
                showBindMobileModel: false
            })
        },
        getPhoneNumber(e) {
            this.setData({
                showBindMobileModel: false
            })
            if (e.detail.errMsg === 'getPhoneNumber:ok') {
                request.post('iy/bindMobile', res => {
                    if (res.success) {
                        app.reloadUserInfo(() => {
                            app.globalData.userInfo = wx._getStorageSync('userinfo')
                            toast('授权成功')
                            console.log(this.data.setUrl)
                            wx.navigateTo({
                                url: this.data.setUrl
                            })
                        })
                    } else {
                        toast(res.msg)
                    }
                }, e.detail)
            }
        },
        isAuth_(e) {
            const { url } = e.currentTarget.dataset;
            if (!url) {
                this.development_();
                return
            }
            let userInfo = wx._getStorageSync('userinfo')
            if (!userInfo.nickname || !userInfo.isAuth) {
                wx._setStorageSync("nav_key", 'swit')
                app.requireLogin('/pages/user/index')
            }else if(!userInfo.isAuth) {
                this.setData({
                    showBindMobileModel: true,
                    setUrl: url
                })
                return
            } else {
                console.log(e)
                app.requireLogin(url)
            }
        },
        development_() {
            toast('此功能陆续开放中...')
        },
        toWallet() {
            let userInfo = wx._getStorageSync('userinfo')
            if (!userInfo.nickname || !userInfo.isAuth) {
                wx._setStorageSync("nav_key", 'swit')
                app.requireLogin('/pages/user/index')
                    // this.setData({
                    // showBindMobileModel: true,
                    // setUrl: e.currentTarget.dataset.url
                    // })
                return
            }
            app.requireLogin('/pages/wallet/index')
        },
        toUnivercity(e) {
            let url = e.currentTarget.dataset.url
            wx.navigateTo({ url: `/pages/webview/webview?url=${this.data[url]}` });
        },
        isToOrder(options) {
            let userInfo = wx._getStorageSync('userinfo');
            if (options.q) {
                if (userInfo.user_type == 2) {
                    console.log(options)
                    let q = options.q;
                    q = decodeURIComponent(q)
                    let urlData = app.geturlData(q);
                    if (urlData && urlData.store_id && urlData.store_id == userInfo.user_id) {
                        console.log(options)
                        wx.navigateTo({
                            url: '../../packages/pack-A/pages/order/detail/index' + '?q=' + encodeURIComponent(q)
                        })
                    } else {
                        toast('老板，该订单不是您商家的订单哦！');
                    }
                } else {
                    toast('亲，只有商家才能扫码进去赚钱哦！');
                }
            }
        },
        getqr() {
            let that = this;
            wx.scanCode({
                success(res) {
                    console.log(res)
                        // toast(res.result);
                    that.isToOrder({ q: res.result })
                        //    wx.navigateTo({
                        //   url: '../../packages/pack-A/pages/order/detail/index'+'?q='+encodeURIComponent(res.result)
                        // })
                        // that.setData({ result: res.result });
                        // wx.showToast({
                        //   title: res.result,
                        //   icon: 'none',
                        //   duration: 5000
                        // });
                },
                fail(err) {
                    wx.showToast({
                        title: '扫码失败',
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(err)
                }
            })
        },
        navToIme() {
            wx.navigateToMiniProgram({
                appId: 'wxde0ae16dacfdfd37',
                path: 'pages/index/index',
                extraData: {},
                envVersion: 'trial',
                success(res) {
                    // 打开成功
                }
            })
        },
        handleContact() {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('需要授权获取您的用户信息')
                return
            }
            const storeInfo = wx.getStorageSync('storeInfo');
            this.setData({ 
                storeInfo,
                showlink: 1
            });
        },
        hideMark() {
            this.setData({
                showlink: 2
            });
        },
    },
    pageLifetimes: {
        show() { //获取位置
            if (typeof this.getTabBar === 'function' &&
                this.getTabBar()) {
                this.getTabBar().setData({
                    selectedIndex: 4
                })
            }
            // if (!app.globalData.userNumber) {
            request.get('iy/user/number', res => {
                    app.globalData.userNumber = res.data
                    this.setData({
                        numbers: res.data
                    })
                })
                // }
        }
    }
})