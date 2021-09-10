import { Request, toast, rpxTopx, copyText, errorToast, maskNumber, navToIme, queryParams } from '../../utils/util.js';
import { assetsImages, ALIYUN_URL } from '../../utils/config.js';
let request = new Request();
let app = getApp();
let W = 0;
let H = 0;
wx.Page({
    data: {
        ALIYUN_URL,
        defaultimg: '/assets/images/default-jj.png',
        showlink: 0,
        thumb: false,
        showSelectShareType: 0,
        storeQr: '',
        storeId: 0,
        goodsName: '',
        query: { 
            category: 0, 
            keyword: '',
            price: 1,// 1降序 2.升序 
        },
        query2: {
            keyword: "",
            store_id: '',
        },
        query3: {
            store_id: '',
            keyword: "",
            type: 2,
        },
        query4: {
            store_id: '',
            keyword: "",
            type: 2
        },
        user: {},
        goodsList: [],

        offerList: [],
        quoteListKeyword: '',
        quoteBuyFlag: true,

        editting: false,
        isSelf: false,
        showQr: false,
        wechat: '',
        phone: '',
        picture2: [],
        picture3: [],
        picture4: [],
        selectedNav: 0,
        topNavs: [{ type: 1, name: '首页' }, { type: 2, name: '上新' }, { type: 3, name: '报价' }, { type: 4, name: '产品图集' }],
        chatList: [],
        tmpMapList: [],
        isAgent: 0,
        pageHude: false,

        assetsImages: assetsImages,
        ALIYUN_URL,
        userInfo: {},
        backgroundIamge: '',
        // backgroundIamge: '',
        topHeight: 0,
        statusBarHeight: 0,
        navTop: 0,
        showType: 0,
        showShopCarPop: false,
        goods_id: null,
        shareModal: 0,
        showCard: false,
        cardData: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options);
        // app.globalData.STOREID = options.storeId || options.si;
        // 设置跳转报价单
        options = queryParams(options.scene);
        let selectedNav = this.data.selectedNav;
        if (options.type) {
            selectedNav = options.type;
        } else {
            selectedNav = 1;
        }
        this.setData({ selectedNav: selectedNav })
    },
    onShow() {
        this.getStoreId(app.globalData.STOREID);
        const { topHeight, statusBarHeight, navHeight, navTop } = app.setCustomNav();
        this.setData({
            topHeight, 
            statusBarHeight,
            navHeight,
            navTop
        })
        if (this.data.pageHude) {
            let selectedNav = this.data.selectedNav;
            if (!this.data.query.storeId) return;
            if (selectedNav == 1) {
                this.selectComponent('#pagination').initLoad()
            } else if (selectedNav == 2) {
                this.selectComponent('#pagination2').initLoad()
            } else if (selectedNav == 3) {
                this.selectComponent('#pagination3').initLoad()
            } else if (selectedNav == 4) {
                this.selectComponent('#pagination4').initLoad()
            }
            this.setData({ editting: false })
                // this.load({ detail: { list: [], page: 1 } }, 1)
        }
    },
    getStoreId(STOREID) {
        console.log(STOREID);
        // 1.优先查看路由上传递的商家 (可能是自己看，也可能是看别的商家)
        // 2.如果路由上没有，那就从上次的浏览历史中找商家
        // 3.如果也没有浏览历史，那就请求接口获取默认商家
        let storeId =  STOREID || (wx.getStorageSync('storeInfo') ? wx.getStorageSync('storeInfo').user_id : null);
        let userInfo =  wx.getStorageSync('userinfo') || app.globalData.userInfo;
        console.log(storeId);
        
        if (storeId) {
            let query = this.data.query;
            let query2 = this.data.query2;
            let query3 = this.data.query3;
            let query4 = this.data.query4;
            query.storeId = storeId;
            query2.store_id = storeId;

            query3.store_id = storeId;
            query4.store_id = storeId;
            this.setData({ 
                query: query, 
                query2: query2, 
                query3: query3, 
                query4: query4,
                isSelf: storeId == userInfo.user_id, 
            })

             // 有可能这时候login还没有结束
            setTimeout(() => {
                this.new_initStoreInfo(storeId)
            }, 0)
        } else {
            this.get('iy/mail/follows', res => {
                if (res.success) {
                    storeId = res.data.default.id || 0
                    let user = res.data.default.user
                    if (!(user instanceof Object)) {
                        user = JSON.parse(user)
                        wx.setStorageSync('storeInfo', user)
                    }

                    this.setData({ 
                        isSelf: false, 
                        user: user, 
                        query: { storeId: storeId }, 
                        storeId: storeId, 
                        query2: { store_id: storeId }, 
                        query3: { store_id: '', keyword: '', type: 2 }, 
                        query4: { store_id: storeId, type: 2 } 
                    })
                    this.setVisitFollow(storeId)
                }
            }, { isstore: 1 })
        }
    },
    new_initStoreInfo(storeId) {
        let userInfo = wx.getStorageSync('userinfo') || app.globalData.userInfo || {};
        console.log('new_initStoreInfo');
        console.log(storeId);
        console.log(userInfo);
        console.log(userInfo.user_id);
        
        if (storeId > 0 && storeId != userInfo.user_id) {
            request.setMany(true)
            request.get('user/user/' + storeId, res => {
                if (res.success) {
                    let user = res.data.user
                    if (!(user instanceof Object)) {
                        user = JSON.parse(user)
                        wx.setStorageSync('storeInfo', user)
                    }
                    console.log(user);
                    this.setData({ 
                        user, 
                        userInfo, 
                        storeId 
                    })
                }
            })
        } else if(storeId > 0 && storeId == userInfo.user_id) {
            this.setData({ 
                isSelf: true, 
                user: userInfo, 
                userInfo,
                query: { storeId: storeId }, 
                storeId: storeId, 
                query2: { store_id: storeId }, 
                query3: { store_id: '', keyword: '', type: 2 }, 
                query4: { store_id: storeId, type: 2 } 
            })
        }
        this.setVisitFollow(storeId)
    },
    // 设置关注的店铺
    setVisitFollow(storeId) {
        request.post('iy/visit/follow', res => {
            if (res.success) {
                console.log('关注店铺成功！');
            }
        }, { userId: storeId })
    },
    onHide() {
        this.setData({ pageHude: true })
    },
    splitTime(val_) {
        return val_.split(" ") || [val_, ''];
    },
    copy(e) {
        let val = e.currentTarget.dataset.content;
        copyText(val)
    },
    getAgent() {
        let isAuth = app.isAuthWxInfo()
        if (!isAuth) {
            toast('需要授权获取您的用户信息')
            return
        }
        let user = this.data.user
        wx.navigateTo({
            url: `/pages/applyAgent/index?storeId=${user.user_id}&storeName=${user.nickname}`
        })
    },
    toggleSelectShareType() {
        var show = this.data.showSelectShareType
            // this.setData({ showSelectShareType : !show})
        if (show == 1) {
            show = 2
        } else {
            show = 1
        }
        this.setData({ showSelectShareType: show })
    },
    closeMark() {
        this.setData({ showQr: false })
        this.setData({ showSelectShareType: 2 })
    },
    toggleCardHide() {
        this.closeMark()
    },
    toggleEdit() {
        this.setData({ editting: !this.data.editting })
    },

    changeCategory(categoryId) {
        this.setData({ 'query.category': categoryId })
        wx.nextTick(() => {
            let pagination = this.selectComponent('#pagination')
            this.setData({ goodsList: [] })
            pagination.initLoad()
        })
    },

    load(e) {
        // console.log(e);
        let rows = e.detail.list
        let page = e.detail.page
        this.setData({
            loading: true
        })
        if (rows.length == 0 && page == 1) {
            this.setData({ goodsList: null, loading: false })
            return
        }
        if (page == 1) {
            this.setData({ goodsList: [], loading: false })
        }
        let goodsList = Object.assign([], this.data.goodsList)
        rows.forEach(row => {
            if (!row) {
                return
            }
            goodsList.push(row)
        })

        this.setData({ goodsList: goodsList, loading: false })
    },
    load1(e) {
        console.log(e);
        let isAgent = e.detail.isAgent;
        let rows = e.detail.list || [
            // {
            //     agent_price: "60.00",
            //     chat_id: 2375,
            //     cover: "20c261f0a3fd0530754d052f6d745878.jpg",
            //     create_time: 1624335219,
            //     goods_name: "哈哈11朵粉香皂玫瑰花束礼盒礼品保鲜花康乃馨情人节父亲节",
            //     goods_no: "ffff",
            //     group_price: "90.00",
            //     picture: "",
            //     product_id: 69,
            //     sale_price: "100.00",
            //     vip_price: "80.00",
            // }
        ]
        let page = e.detail.page
        if (rows.length == 0 && page == 1) {
            this.setData({
                chatList: null
            })
            return
        }
        if (page == 1) {
            this.setData({ chatList: [], tmpMapList: [] })
        }

        let chatList = Object.assign([], this.data.chatList)
        if (rows.length > 0) {
            rows = rows.map((v, i) => {
                v.picture = JSON.parse(v.picture);
                if(!isAgent) {
                    console.log(v.agent_price);
                    v.agent_price = maskNumber(v.agent_price)
                }
                return v
            })
            let tmpMapList = this.data.tmpMapList

            rows.forEach(v => {
                switch (v.chat_type) {
                    case 1:
                        v.url = '/pages/chat/index';
                        break;
                    case 2:
                    case 4:
                    case 5:
                        v.url = '/pages/goods/index';
                        break;
                }
                v.url += '?chatId=' + v.chat_id
                let date = new Date(v.create_time * 1000)
                let m = date.getMonth() + 1
                let d = date.getDate();
                // console.log(d)
                if (m < 10) {
                    m = '0' + m
                }
                if (d < 10) {
                    d = '0' + d
                }
                let k = m + '' + d
                if (k in tmpMapList) {
                    tmpMapList[k].list.push(v)
                    // console.log(tmpMapList)
                } else {
                    tmpMapList[k] = {
                        list: [v],
                        m: m,
                        d: d
                    }
                    chatList.push(tmpMapList[k])
                    // console.log(chatList)
                }
            })

            // console.log(chatList)
            this.setData({
                tmpMapList,
                isAgent: isAgent,
                chatList
            })
        }
    },
    
    load3(e) {
        let userInfo = wx._getStorageSync('userinfo')
        let rows = e.detail.list
        let page = e.detail.page
            // let isAgent =  e.detail.isAgent;
        if (rows.length == 0 && page == 1) {
            this.setData({
                offerList: null
            })
            return
        }
        if (page == 1) {
            this.setData({ offerList: [] })
        }

        if (rows.length > 0) {
            let offerList = this.data.offerList;
            rows.forEach((v, index) => {
                v.update_time = this.splitTime(v.update_time);
                offerList.push(v);
                if (!v) {
                    this.setData({
                        isAgent: v.isAgent
                    })
                }
            })
            // 非会员非代理进行数据截取
            this.setData({
                offerList: (userInfo.isVip && this.data.isAgent) ? offerList : offerList.slice(0,3),
            })
        }
    },
    load4(e) {
        let rows = e.detail.list
        let page = e.detail.page
            let isAgent =  e.detail.isAgent;
        if (rows.length == 0 && page == 1) {
            this.setData({
                picture2: null
            })
            return
        }
        if (page == 1) {
            this.setData({ picture2: [] })
        }

        if (rows.length > 0) {
            rows = rows.map((v, i) => {
                v.picture = JSON.parse(v.picture) 
                return v
            })
            let picture2 = this.data.picture2

            rows.forEach(v => {
                picture2.push(v)
            })
            this.setData({
                picture2,
                isAgent: isAgent
            })
        }
    },
    bindinput_(e) {
        this.setData({
            'query.keyword': e.detail.value
        })
    },
    handleDelete(e) {
        this.setData({
            'query.keyword': ''
        })
        this.search()
    },
    bindinput_keyword(e) {
        let target = e.currentTarget.dataset.target
        let update = {}
        update[target] = e.detail.value
        this.setData(update)
    },
    handleDelete_keyword(e) {
        let target = e.currentTarget.dataset.target
        console.log(target);
        let update = {}
        update[target] = ''
        this.setData(update)
        if (target == 'query2.keyword') {
            this.search2()
        } else if(target == 'query3.keyword') {
            this.search3()
        } else {
            this.search4()
        }
    },
    copyName(e) {
        var val = e.currentTarget.dataset.copy_name;
        copyText(val)
    },
    quoteBuy(e) {
        let id = e.currentTarget.dataset.id;
        // let id = e.currentTarget.dataset.chat_id;
        let quoteBuyFlag = this.data.quoteBuyFlag;
        if (!quoteBuyFlag) return
        this.setData({ quoteBuyFlag: false })
        request.post('chat/doQuote', res => {
            if (res.success) {
                toast('已完成')
            }
            this.setData({ quoteBuyFlag: true })
        }, { id: id })

    },

    deleteChat(e) {
        let index = e.currentTarget.dataset.index
        let chatId = this.data.goodsList[index].chat_id;
        let id = this.data.goodsList[index].id;
        wx.showModal({
            title: '删除产品',
            content: '确定删除这个产品吗',

            success: (res) => {
                if (res.confirm) {
                    request.delete('product/' + id,res=>{
                    if(res.code == 200){
                        toast('删除成功');
                        this.setData({
                            goodsList: this.data.goodsList.filter(item => item.id != id)
                        })
                    }else{
                        errorToast(res.msg)
                    }
                    }, {})
                }
            }
        })
    },

    edit(e) {
        let index = e.currentTarget.dataset.index
        let chatId = this.data.goodsList[index].chat_id
        let id = this.data.goodsList[index].id;
        wx.navigateTo({
            url: '/pages/publish/newChat/edit?chatId=' + chatId + '&id=' + id
        })
    },

    getStoreQr() {
        let req = new Request()
        req.setConfig('responseType', 'arraybuffer')
        req.get('iy/qr/store', res => {
            console.log(res);
            this.setData({
                showSelectShareType: 0,
                shareModal: 0
            })
            let qrcode = wx.arrayBufferToBase64(res).replace(/[\r\n]/g, '')
            console.log(qrcode);
            
            this.setData({ storeQr: qrcode, showQr: true })
            wx.nextTick(() => {
                this.draw1()
            })
        }, { storeId: this.data.storeId }).showLoading()
    },
    /**
     * canvas绘图相关，把文字转化成只能行数，多余显示省略号
     * ctx: 当前的canvas
     * text: 文本
     * contentWidth: 文本最大宽度
     * lineNumber: 显示几行
     */
    transformContentToMultiLineText(ctx, text, contentWidth, lineNumber) {
        if (!text) return [''];
        var textArray = text.split(""); // 分割成字符串数组
        var temp = "";
        var row = [];

        for (var i = 0; i < textArray.length; i++) {
            if (ctx.measureText(temp).width < contentWidth) {
                temp += textArray[i];
            } else {
                i--; // 这里添加i--是为了防止字符丢失
                row.push(temp);
                temp = "";
            }
        }
        row.push(temp);
        // 如果数组长度大于2，则截取前两个
        if (row.length > lineNumber) {
            var rowCut = row.slice(0, lineNumber);
            console.log(rowCut)
            var rowPart = '';
            if (rowCut.length <= 1) {
                rowPart = rowCut[0];
            } else {
                rowPart = rowCut[1];
            }
            var test = "";
            var empty = [];
            for (var a = 0; a < rowPart.length; a++) {
                if (ctx.measureText(test).width < contentWidth) {
                    test += rowPart[a];
                } else {
                    break;
                }
            }
            empty.push(test); // 处理后面加省略号
            var group = empty[0] + '...'
            rowCut.splice(lineNumber - 1, 1, group);
            row = rowCut;
        }
        return row;
    },
    draw1() {
        let qrcode = this.data.storeQr
        let userInfo = this.data.user
        console.log(userInfo);
        
        let avatar = userInfo.avatar
        let nickname = userInfo.nickname
        let remark = userInfo.remark
        let self = this
        const query = wx.createSelectorQuery()
        query.select('#canvas-modal1').boundingClientRect()
        query.exec(function(res) {
            W = res[0].width
            H = res[0].height
            var ctx = wx.createCanvasContext('firstCanvas1')
            ctx.setFillStyle('#FFF')
            ctx.fillRect(0, 0, W, H)
            ctx.draw(true)
                // 画背景
            wx.getImageInfo({
                    src: '../../packages/bg/34884d3c3fcaa7c9a201b313191f1488.png',
                    success(res) {
                        ctx.drawImage('../../packages/bg/34884d3c3fcaa7c9a201b313191f1488.png', 0, 0, res.width, res.height, 0, 0, rpxTopx(676), rpxTopx(1000))
                        ctx.draw(true)

                        ctx.beginPath();
                        ctx.arc(rpxTopx(340), rpxTopx(730), rpxTopx(160), 0, 360, false);
                        ctx.fillStyle = "#ffffff"; //填充颜色,默认是黑色
                        ctx.fill(); //画实心圆
                        ctx.closePath();
                        ctx.draw(true)

                    }
                })
                // 画头像
            wx.getImageInfo({
                src: avatar,
                success: function(res) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(rpxTopx(338), rpxTopx(144), rpxTopx(50), 0, 2 * Math.PI);
                    ctx.closePath();
                    // 下面就裁剪出一个圆形了，且坐标在 （338， 144）
                    ctx.clip();
                    ctx.drawImage(res.path, rpxTopx(338-52), rpxTopx(144-52), rpxTopx(104), rpxTopx(104));
                    ctx.restore();
                    ctx.draw(true);
                    // 画昵称
                    ctx.setFillStyle('#333333')
                    ctx.setFontSize(rpxTopx(32))
                    var nickname_ = self.transformContentToMultiLineText(ctx, nickname, rpxTopx(320), 1);
                    let nickname_length = nickname_[0].length;
                    let nickname_txt = nickname;
                    if (nickname_length < nickname.length) nickname_txt = nickname.substring(0, nickname_length) + '...';
                    ctx.fillText(nickname_txt, rpxTopx(338-20*(Math.ceil(nickname_txt.length /2))), rpxTopx(272))
                    ctx.draw(true)

                    ctx.setFillStyle('#333333')
                    ctx.setFontSize(rpxTopx(24))
                    var remark_ = self.transformContentToMultiLineText(ctx, remark, rpxTopx(320), 1);
                    let remark_length = remark_[0].length;
                    let remark_txt = remark;
                    if (remark_length < remark.length) remark_txt = remark.substring(0, remark_length) + '...';
                    ctx.fillText(remark_txt, rpxTopx(338-16*(Math.ceil(remark_txt.length /2))), rpxTopx(332))
                    ctx.draw(true)
                }
            })



            // 画二维码
            console.log(wx.env);
            let d = new Date()
            const fsm = wx.getFileSystemManager()
            const filePath = `${wx.env.USER_DATA_PATH}/` + d.getTime() + '.png'
            const buffer = wx.base64ToArrayBuffer(qrcode)

            fsm.writeFile({
                filePath,
                data: buffer,
                encoding: 'binary',
                success() {
                    wx.getImageInfo({
                        src: filePath,
                        success: (res) => {
                            let qrSize = rpxTopx(300)
                            ctx.drawImage(res.path, 0, 0, res.width, res.height, rpxTopx(190), rpxTopx(520), qrSize, qrSize)
                            ctx.draw(true)
                        }
                    })
                }
            })
        })
    },

    saveCard1() {
        let self = this
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: W,
            height: H,
            canvasId: 'firstCanvas1',
            success(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(res) {
                        wx.showToast({
                            title: '已下载至相册',
                            icon: 'success',
                            duration: 1500
                        })
                        self.setData({ showQr: false })
                            // self.toggleCard1()
                    },
                    fail() {
                        toast('保存失败')
                    }
                })
            }
        })
    },
    getConcentInfo(userId) {
        let isAuth = app.isAuthWxInfo()
        if (!isAuth) {
            toast('需要授权获取您的用户信息')
            return
        }
        request.get('visit/contactInfo', res => {
            if (res.success) {
                this.setData({ userInfo: res.data, phone: res.data.mobile, wechat: res.data.wechat })
            }
        }, { userId: userId })
    },
    contact() {
        let isAuth = app.isAuthWxInfo()
        if (!isAuth) {
            toast('需要授权获取您的用户信息')
            return
        }
        this.getConcentInfo(this.data.user.user_id)
        this.setData({
            showlink: 1
        })
    },
    capy(e) {
        let content = e.currentTarget.dataset.content;
        if (content == '') {
            wx.showToast({
                title: '暂无微信',
                icon: 'none',
                duration: 1500
            })
            return
        }
        wx.setClipboardData({
            data: content,
            success(res) {
                wx.getClipboardData({
                    success(res) {
                        console.log(res.data) // data
                    }
                })
            }
        })
    },
    callNumPhone(e) {
        let pnum = e.currentTarget.dataset.phone
        if (pnum == '') {
            wx.showToast({
                title: '暂无手机号',
                icon: 'none',
                duration: 1500
            })
            return
        }
        wx.makePhoneCall({
            phoneNumber: pnum
        })
    },
    hideMark() {
        this.setData({
            showlink: 2
        })
    },
    toggleType(e) {
        let type = e.currentTarget.dataset.type
        let selectedNav = this.data.selectedNav
        if (selectedNav == type) {
            return
        }
        this.setData({ selectedNav: type, userList: [] })
        wx.nextTick(() => {
            // if(type == 2) this.getMyImageTextList();
            // if(type == 3) this.getMyImageTextList();
            // this.selectComponent('#pagination').initLoad()
        })
    },
    changePriceSearch() {
        let query = this.data.query;
        let price = query.price;
        this.setData({
            'query.price': price == 1 ? 2 : 1
        })
        this.search()
    },
    search() {
        let query = this.data.query
        query.goodsName = this.data.goodsName;
        this.setData({ query: query, loading: true })
        let pagination = this.selectComponent('#pagination');
        pagination.initLoad()
    },
    search2() {
        let query2 = this.data.query2
        this.setData({ query2: query2, chatList: [] })
        let pagination2 = this.selectComponent('#pagination2');
        pagination2.initLoad()
    },
    search3() {
        let query3 = this.data.query3;
        this.setData({ query3: query3, offerList: [] })
        this.selectComponent('#pagination3').initLoad()
    },
    search4() {
        let query4 = this.data.query4
        query4.goodsName = this.data.goodsName;
        this.setData({ query4: query4, picture2: [] })
        this.selectComponent('#pagination4').initLoad()
    },
    isToLogin() {
        let userInfo = wx._getStorageSync('userinfo')
        if (!userInfo.nickname || !userInfo.isAuth) {
            wx._setStorageSync("nav_key", 'swit')
            app.requireLogin('/pages/index/index')
            return false;
        } else {
            return true;
        }
    },
    appStror() {
        if (this.isToLogin()) {
            wx.navigateTo({
                url: '../applyMerchant/index'
            })
        }
    },
    // 获取我的图文列表
    getMyImageTextList() {
        let data = { type: 2 };
        request.get('user/getMyImageTextList', res => {
            console.log(res);
            if (res.success) {
                this.setData({ picture2: res.data.list })
                this.setData({ picture4: res.data.list })
            } else {
                wx._showToast(res.msg)
            }
        }, data)
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        // let pages = getCurrentPages()
        // let page = pages[pages.length - 1]
        // let to = encodeURIComponent(page.route + '?storeId=' + this.data.storeId)
        // console.log(this.data.storeId);
        // console.log(to);
        // let uesr_id = app.globalData.userInfo.user_id
        // let path = '/pages/home/index?f=s&fi=' + uesr_id + '&path=' + to + '&fromUserId=' + uesr_id
        // console.log(path);
        let uesr_id = app.globalData.userInfo.user_id
        let data = encodeURIComponent('?f=s&fi=' + uesr_id)
        
        let title = this.data.isSelf ? '爱优（哎油）哦！这家店不错哦…分享给你！' : '爱优（哎油）哦！这家店不错哦…分享给你！'
        console.log('/pages/home/index?scene=' + data + '&storeId=' + this.data.storeId + '&fromUserId=' + uesr_id);

        return {
            path: '/pages/home/index?scene=' + data + '&storeId=' + this.data.storeId + '&fromUserId=' + uesr_id,
            title: title
        }
    },
    // 切换展示效果
    handleChangeShowType() {
        this.setData({
            showType: this.data.showType ? 0 : 1
        })
    },
    handleBack() {
        wx.navigateBack({
          delta: 1,
        })
    },
    isAuth_(e) {
        if(!this.isToLogin()) return;
        app.requireLogin(e.currentTarget.dataset.url)
    },
    // 购物车弹框
    showGoodsPopup(e) {
        // if (!this.isToLogin()) return;
        // 产品id
        const { goods_id } = e.currentTarget.dataset;
        
        this.setData({
            showShopCarPop: true,
            goods_id 
        })
    },
    navToIme,
    toggleShowShareModal() {
        this.setData({
            shareModal: !this.data.shareModal
        })
    },
    // 图片预览
    previewImage(e) {
        const { src } = e.currentTarget.dataset;
        let picture = [src]
        let current = src

        wx.previewImage({
            current,
            urls: picture
        })
    },
    navToXiaoXi() {
        wx.navigateTo({
          url: '/packages/pack-A/pages/webview/index?targetUrl=' + 'https://mp.weixin.qq.com/s/ozkfskEDeyri-0YOYQajeA',
        })
    },
    // 报价canvas
    initPricePicture() {
        request.get('iy/quote/poster', res => {
            if (res.success) {
                // console.log(res);
                this.setData({
                    cardData: {
                        ...res.data.list,
                        good_num: this.data.offerList.length
                    }
                })
                this.draw();
            } else {
                toast(res.msg)
            }
        }).showLoading()
    },
    // 画图
    draw() {
        
        this.setData({
            showCard: !this.data.showCard
        })
        const ctx = wx.createCanvasContext('firstCanvas');
        const query = wx.createSelectorQuery();
        query.select('#canvas-modal').boundingClientRect();
        query.exec(function (res) {
            W = res[0].width
            H = res[0].height
            // console.log(res);
            ctx.setFillStyle('#FFF')
            ctx.fillRect(0, 0, rpxTopx(676), H)
            ctx.draw(true)
            // 画背景
            wx.getImageInfo({
                src: '../../packages/bg/bg.png',
                success(res) {
                    console.log(res);
                    
                    ctx.drawImage('../../packages/bg/bg.png', 0, 0, res.width, res.height, 0, 0, rpxTopx(676), rpxTopx(1000))
                    ctx.draw(true)
                }
            })
        })
        let self = this;
        const { cardData } = this.data;
        console.log(cardData);
        
        const {nickname, avatar, remark, mobile, wechat, address, store_background, store_quote_state, good_num } = cardData;
        // ctx.setFillStyle('#FFE200')
      
        // 开始画图
        wx.getImageInfo({
            src: avatar,
            success: function (res) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(rpxTopx(100), rpxTopx(80), rpxTopx(50), 0, 2*Math.PI);
                ctx.closePath();
                // 下面就裁剪出一个圆形了，且坐标在 （50， 90）
                ctx.clip();
                ctx.drawImage(res.path, rpxTopx(50), rpxTopx(30), rpxTopx(100), rpxTopx(100));
                ctx.restore();
                ctx.draw(true);
                // 画昵称
                ctx.setFillStyle('#333333')
                ctx.setFontSize(rpxTopx(32))
                var nickname_ = self.transformContentToMultiLineText(ctx, nickname, rpxTopx(320), 1);
                let nickname_length = nickname_[0].length;
                let nickname_txt = nickname;
                if(nickname_length<nickname.length) nickname_txt = nickname.substring(0,nickname_length)+'...';
                ctx.fillText(nickname_txt, rpxTopx(170), rpxTopx(72))
                ctx.draw(true)
                
                // 画签名
                ctx.setFillStyle('#333333')
                ctx.setFontSize(rpxTopx(20))
                var remark_ = self.transformContentToMultiLineText(ctx, remark, rpxTopx(320), 1);
                let remark_length = remark_[0].length;
                let remark_txt = remark;
                if(remark_length<remark.length) remark_txt = remark.substring(0,remark_length)+'...';
                ctx.fillText(remark_txt, rpxTopx(170), rpxTopx(120))
                ctx.draw(true)

                // 画日期
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let title = `${month}月${day}日文字报价单`
                ctx.setFontSize(rpxTopx(32))
                ctx.setFillStyle('#333')
                ctx.fillText(title, rpxTopx(224), rpxTopx(204))
                ctx.draw(true)
                
                let num = -30; // 调整上下距离
                // 画报价日期
                ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText(`报价日期：${year}-${month}-${day}- ${hour}:${minute}`, rpxTopx(52), rpxTopx(314 + num))
                ctx.draw(true)

                // ctx.font = 'normal bold ' + rpxTopx(20) + ' sans-serif';
								ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText('报价产品数：' + good_num  +' 个', rpxTopx(52), rpxTopx(368 + num))
                ctx.draw(true)

                ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText('手机：' + mobile, rpxTopx(52), rpxTopx(422 + num))
                ctx.draw(true)

                ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText('微信：' + wechat, rpxTopx(52), rpxTopx(476 + num))
                ctx.draw(true)

                ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText('地址档口：' + address, rpxTopx(52), rpxTopx(530 + num))
                ctx.draw(true)

                // 报价说明
                let prewords = '报价说明:';
                let words = store_quote_state || '';
                let words_20 = words.substring(0,20);
                let words_20_40 = words.substring(20,40);
                let words_40_60 = words.substring(40,60);
                let words_60_80 = words.substring(60,80);
                ctx.setFontSize(rpxTopx(24))
                ctx.setFillStyle('#333')
                ctx.fillText(prewords + words_20, rpxTopx(52), rpxTopx(584 + num))
                ctx.draw(true)

                let lineheight = 30;
                let left_width = 120;
                if (words_20_40) {
                    ctx.setFontSize(rpxTopx(24))
                    ctx.setFillStyle('#333')
                    ctx.fillText(words_20_40, rpxTopx(52 + left_width), rpxTopx(584 + num + lineheight * 1 ))
                    ctx.draw(true)
                }
                if (words_40_60) {
                    ctx.setFontSize(rpxTopx(24))
                    ctx.setFillStyle('#333')
                    ctx.fillText(words_40_60, rpxTopx(52 + left_width), rpxTopx(584 + num + lineheight * 2))
                    ctx.draw(true)
                }
                if (words_60_80) {
                    ctx.setFontSize(rpxTopx(24))
                    ctx.setFillStyle('#333')
                    ctx.fillText(words_60_80, rpxTopx(52 + left_width), rpxTopx(584 + num + lineheight * 3))
                    ctx.draw(true)
                }

                // 画背景
                let pic =  ALIYUN_URL + '/' + store_background;

                wx.getImageInfo({
                    src: pic,
                    success(res) {			
                        var w = 0
                        var h = 0
                        var l = 0
                        var t = 0
                        var baseSize = 600
                        var baseSize_ = 300
                        var w_h__bar = res.width/res.height;

                        if(w_h__bar>1){
                                h = baseSize
                                w = h*w_h__bar
                                l = (res.width-res.height)/2
                                baseSize_ = res.height
                        }else{
                                w = baseSize
                                h = w/w_h__bar
                                t = (res.height-res.width)/2
                                baseSize_ = res.width
                        }
                        // –drawImage(Imageimg,float sx,float sy,float sw,float sh,float dx,float dy,float dw,float dh)
                        // •从sx、sy处截取sw、sh大小的图片，绘制dw、dh大小到dx、dy处
                        ctx.drawImage(res.path, l, t, baseSize_, baseSize_, rpxTopx(42), rpxTopx(600), rpxTopx(baseSize), rpxTopx(baseSize_))
                        ctx.draw(true)
                    }
                })

                // 底部文字
                ctx.setFontSize(rpxTopx(20))
                ctx.setFillStyle('#333')
                ctx.fillText('iME供应链  货源+工具+渠道', rpxTopx(216), rpxTopx(1048))
				ctx.draw(true)
								
                // 画商家二维码
                let userInfo = wx.getStorageSync('userinfo') || app.globalData.userInfo;
                let req = new Request()
                req.setConfig('responseType', 'arraybuffer')
                req.post('iy/quote/qrcode?storeId=' + userInfo.user_id, res => {
                    console.log(res);
                    
                        let qrcode = wx.arrayBufferToBase64(res).replace(/[\r\n]/g, '');
                        let d = new Date()
                        const fsm = wx.getFileSystemManager()
                        const filePath = `${wx.env.USER_DATA_PATH}/` + d.getTime() + '.png';
                        const buffer = wx.base64ToArrayBuffer(qrcode)

                        fsm.writeFile({
                            filePath,
                            data: buffer,
                            encoding: 'binary',
                            success() {
                                wx.getImageInfo({
                                    src: filePath,
                                    success: (res) => {
                                        console.log(res);
                                        
                                        let qrSize = rpxTopx(188)
                                        ctx.drawImage(res.path, 0, 0, res.width, res.height, rpxTopx(464), rpxTopx(266), qrSize, qrSize)
                                        ctx.draw(true)
                                    }
                                })
                            }
                        })
                }).showLoading()
            }
        })
        
    },
    /**
    * canvas绘图相关，把文字转化成只能行数，多余显示省略号
    * ctx: 当前的canvas
    * text: 文本
    * contentWidth: 文本最大宽度
    * lineNumber: 显示几行
    */
    transformContentToMultiLineText(ctx, text, contentWidth, lineNumber) {
			if(!text) return [''];
			var textArray = text.split(""); // 分割成字符串数组
			var temp = "";
			var row = [];

			for (var i = 0; i < textArray.length; i++) {
				if (ctx.measureText(temp).width < contentWidth) {
					temp += textArray[i];
				} else {
					i--; // 这里添加i--是为了防止字符丢失
					row.push(temp);
					temp = "";
				}
			}
			row.push(temp);
			// 如果数组长度大于2，则截取前两个
			if (row.length > lineNumber) {
				var rowCut = row.slice(0, lineNumber);
				console.log(rowCut)
				var rowPart = '';
				if(rowCut.length<=1){
					rowPart = rowCut[0];
				}else{
					rowPart = rowCut[1];
				}
				var test = "";
				var empty = [];
				for (var a = 0; a < rowPart.length; a++) {
					if (ctx.measureText(test).width < contentWidth) {
						test += rowPart[a];
					} else {
						break;
					}
				}
				empty.push(test); // 处理后面加省略号
				var group = empty[0] + '...'
				rowCut.splice(lineNumber - 1, 1, group);
				row = rowCut;
			}
			return row;
    },
    toggleCardHide (){
        this.setData({ storeQr: '' ,showCard:false})
    },
    saveCard() {
        let self = this
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: W,
            height: H,
            canvasId: 'firstCanvas',
            success(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(res) {
                        wx.showToast({
                            title: '已下载至相册',
                            icon: 'success',
                            duration: 1500
                        })
                        // self.toggleCard()
                    },
                    fail() {
                        toast('保存失败')
                    }
                })
            }
        })

    },
    // 复制报价信息
    copyPrice() {
        console.log(this.data.offerList);

        let str = '';
        this.data.offerList.forEach(item => {
            const { content } = item;
            str += `${content};` +"\n";
        })
        if (str == '') {
            return;
        }
        wx.setClipboardData({
            data: str,
            success(res) {
                wx.showToast({
                    title: '全部文字报价信息已复制',
                    duration: 3000
                })
                wx.getClipboardData({
                    success(res) {
                        console.log(res.data); // data
                    }
                });
            }
        });
    }
})