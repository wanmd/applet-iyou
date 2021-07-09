// component/selfPay/index.js
import { Request, toast } from '../../utils/util.js'
let request = new Request()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    storeInfo: {},
    images: [],
  },

  lifetimes : {
    ready () {
      this.getStoreInfo()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getStoreInfo() {
      const storeInfo = wx.getStorageSync('storeInfo')
      const storeId = storeInfo.storeId || storeInfo.user_id;
        request.get('iy/store/' + storeId, res => {
          console.log(res);
          this.setData({
            storeInfo:  res.data.list
          })
        }, {}).showLoading()
    },
    // 长按保存图片
    saveImage(e){
      let url = e.currentTarget.dataset.url;
      //用户需要授权
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success:()=> {
                // 同意授权
                this.saveImg1(url);
              },
              fail: (res) =>{
                console.log(res);
              }
            })
          }else{
            // 已经授权了
            this.saveImg1(url);
          }
        },
        fail: (res) =>{
          console.log(res);
        }
      })   
    },
    saveImg1(url){
      wx.getImageInfo({
        src: url,
        success:(res)=> {
          let path = res.path;
          wx.saveImageToPhotosAlbum({
            filePath:path,
            success:(res)=> { 
              toast('保存成功，请去相册查看~')
              console.log(res);
            },
            fail:(res)=>{
              toast('保存失败，请重试~')
              console.log(res);
            }
          })
        },
        fail:(res)=> {
          console.log(res);
        }
      })
    },
    uploadPic(e) {
      let d = new Date()
      let file = e.detail.value
      let index = parseInt(e.target.dataset.index)
      let images = JSON.parse(JSON.stringify(this.data.images))
      images.push({ file: file, id: d.getTime() })
      console.log(images);
      this.setData({ images: images })
    },
    uploadPic_(e) {
      console.log(e);
      
      let d = new Date()
      let file = e.detail.value
      let index = parseInt(e.target.dataset.index)
      let images = JSON.parse(JSON.stringify(this.data.images))
          // images.push({ file: file, id: d.getTime()})
      images[index] = { file: file, id: d.getTime() }
      
      this.setData({ images: images })
    },
    clearPic(e) {
        let index = parseInt(e.target.dataset.index)
        let images = this.data.images
        images.splice(index, 1)

        this.setData({ images: images })
    },
    cancel() {
      this.triggerEvent('cancel')
    },
    submit() {
      this.triggerEvent('submit', this.data.images)
    }
  }
})
