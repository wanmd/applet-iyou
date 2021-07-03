// component/selfPay/index.js
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
    images: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
