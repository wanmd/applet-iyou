import { ALIYUN_URL } from '../../utils/config.js';
import { Request, toast } from '../../utils/util.js';
let request = new Request();
let app = getApp()
Component({
    properties: {
        urls: {
            type: Array,
            value: []
        },
        video_url: {
            type: String,
            value: ''
        },
        userId: {
            type: Number,
            value: 0
        },
        chatId: {
            type: Number,
            value: 0
        },
        collectId: {
            type: Number,
            value: 0
        },
        collectStatus: {
            type: Boolean,
            value: false
        },

        praiseStatus: {
            type: Boolean,
            value: false
        },

        exclude: {
            type: Array,
            value: []
        },
        content: {
            type: String,
            value: ''
        },
        type: {
            type: String,
            value: '1'
        },
    },

    lifetimes: {
        attached() {
            let exclude = this.properties.exclude;
            let userId = this.properties.userId;
            this.setData({
                showDown: !exclude.includes('down'),
                showCollect: !exclude.includes('collect'),
                showContact: !exclude.includes('contact'),
                showPraise: !exclude.includes('praise'),
                type: this.properties.type,
            });
        }
    },

    observers: {
        collectId(collectStatus) {
            this.setData({ collect_id: collectId });
        },
        collectStatus(collectStatus) {
            this.setData({ collect_status: collectStatus });
        },
        praiseStatus(praiseStatus) {
            this.setData({ praise_status: praiseStatus });
        }
    },

    data: {
        collect_id: 0,
        collect_status: false,
        praise_status: false,
        showDown: false,
        showCollect: false,
        showContact: false,
        showPraise: false,
        showlink: 0,
        downOk: false,
        ALIYUN_URL
    },
    methods: {
        downOkHide() {
            this.setData({ downOk: false });
        },
        down() {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            let urls = this.properties.urls;
            let video_url = this.properties.video_url;
            let urlsNum = urls.length;
            let num = 0;
            let _this = this;

            let content = this.data.content;
            wx.setClipboardData({
                data: content,
                success(res) {
                    wx.getClipboardData({
                        success(res) {
                            console.log(res.data); // data
                            // toast('????????????')
                            // this.downOk = true;
                        }
                    });
                }
            });
            wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                    wx.getSetting({
                        success(res) {
                            if (res.authSetting['scope.writePhotosAlbum']) {
                                wx.showLoading({ title: '???????????????...' });
                                // ????????????
                                urls.forEach(url => {
                                    wx.downloadFile({
                                        url: ALIYUN_URL + '/' + url,
                                        success: res => {
                                            wx.saveImageToPhotosAlbum({
                                                filePath: res.tempFilePath,
                                                success: res => {
                                                    console.log(res);
                                                    num++;
                                                    wx.hideLoading();
                                                    if (num == urlsNum) {
                                                        num = 0;
                                                        _this.setData({ downOk: true });
                                                        wx.showToast({
                                                            title: '????????????????????????',
                                                            icon: 'success',
                                                            duration: 1000
                                                        })
                                                    }
                                                },
                                                fail: res => {
                                                    console.log(res);
                                                    wx.hideLoading();
                                                }
                                            });
                                            console.log(res);
                                        },
                                        fail: res => {
                                            wx.hideLoading();
                                            console.log(res);
                                        }
                                    });
                                });
                                // ????????????
                                if (video_url) {
                                    wx.showLoading({ title: '???????????????...' })
                                    wx.downloadFile({
                                        url: ALIYUN_URL + '/' + video_url,
                                        success: res => {
                                            wx.saveVideoToPhotosAlbum({
                                                filePath: res.tempFilePath,
                                                success: res => {
                                                    console.log(res)
                                                    wx.hideLoading()
                                                    toast('????????????????????????')
                                                },
                                                fail: res => {
                                                    wx._showAlert('??????????????????');
                                                    console.log(res)
                                                    wx.hideLoading()
                                                }
                                            })
                                            console.log(res)
                                        },
                                        fail: res => {
                                            wx.hideLoading()
                                            console.log(res)
                                        }
                                    })
                                }
                            } else {
                                wx.hideLoading();
                                wx._showAlert(
                                    '?????????????????????????????????????????????????????????????????????????????? - ?????? - ????????? - ??????????????????????????????'
                                );
                                return;
                            }
                        }
                    });
                },
                fail: function() {
                    wx._showAlert(
                        '?????????????????????????????????????????????????????????????????????????????? - ?????? - ????????? - ??????????????????????????????'
                    );
                    return;
                }
            });
        },
        // ??????
        collect() {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            let chatId = this.properties.chatId;
            let collectStatus = this.data.collect_status;
            if (collectStatus) {
                //????????????
                request.get(
                    'chat/uncollect',
                    res => {
                        if (res.success) {
                            this.setData({ collect_status: false });
                        } else {
                            toast(res.msg);
                        }
                    }, { id: chatId }
                );
            } else {
                //??????
                request.get(
                    'chat/collect',
                    res => {
                        if (res.success) {
                            this.setData({ collect_status: true });
                        } else {
                            toast(res.msg);
                        }
                    }, { id: chatId }
                );
            }
        },
        gouwuche() {
            wx.switchTab({
                url: '/pages/cart/index'
            })
        },
        // ??????
        praise() {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            let chatId = this.properties.chatId;
            let praiseStatus = this.data.praise_status;
            request.get(
                praiseStatus == false ? 'chat/praise' : 'chat/unpraise',
                res => {
                    if (res.success) {
                        this.setData({ praise_status: !praiseStatus });
                    } else {
                        toast(res.msg);
                    }
                }, { id: chatId }
            );
        },
        copy(e) {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            let content = e.currentTarget.dataset.content;
            console.log(content);
            if (!content) {
                wx.showToast({
                    title: '????????????',
                    icon: 'none',
                    duration: 1500
                });
                return;
            }
            wx.setClipboardData({
                data: content,
                success(res) {
                    wx.getClipboardData({
                        success(res) {
                            console.log(res.data); // data
                        }
                    });
                }
            });
        },
        callNumPhone(e) {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            let pnum = e.currentTarget.dataset.phone;
            if (!pnum) {
                wx.showToast({
                    title: '???????????????',
                    icon: 'none',
                    duration: 1500
                });
                return;
            }
            wx.makePhoneCall({
                phoneNumber: pnum
            });
        },
        hideMark() {
            this.setData({
                showlink: 2
            });
        },
        getConcentInfo(userId) {
            request.get(
                'visit/contactInfo',
                res => {
                    if (res.success) {
                        this.setData({ userInfo: res.data });
                    }
                }, { userId: userId }
            );
        },
        contact() {
            let isAuth = app.isAuthWxInfo()
            if (!isAuth) {
                toast('????????????????????????????????????')
                return
            }
            this.getConcentInfo(this.properties.userId);
            this.setData({
                showlink: 1
            });
        }
    }
});