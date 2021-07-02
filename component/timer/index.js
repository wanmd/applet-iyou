Component({
  /**
   * 组件的属性列表
   */
  properties: {
    time: {
      type: Number
    },
    bgcolor: {
      type : null,
      value: null,
    },
    color: {
      type : null,
      value: null,
    },
    speratecolor: {
      type : null,
      value: null,
    },
  },

  /**
   * 组件的数据监听
   */
  observers: {
    'time': function(time) {// 传进的时候是秒  转进来变成毫秒
      this.setData({
        _time: time * 1000
      }, this.initTimer)
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    _time: 0,
    show: false,
    leftd: '',
    lefth: '',
    leftm: '',
    lefts: '',
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
    },
    detached() {
      if (this.timer) clearInterval(this.timer)
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initTimer(difftime) {
      if (this.timer) clearInterval(this.timer)
      let  { _time } = this.data;
      if (!_time) { _time = 0 }; // 异常值处理
      let index  = 0;
      let that  = this;
      this.timer = setInterval(() => {
        var lefttime = _time - 1000 * index ;  //距离结束时间的毫秒数
        if(lefttime < 0) {clearInterval(that.timer);return}; // 边界处理
        
        var leftd = Math.floor(lefttime/(1000*60*60*24)),  //计算天数
        lefth = Math.floor(lefttime/(1000*60*60)%24),  //计算小时数
        leftm = Math.floor(lefttime/(1000*60)%60),  //计算分钟数
        lefts = Math.floor(lefttime/1000%60);  //计算秒数

        index++;
        that.setData({
          leftd: leftd < 10 ? '0' + leftd : leftd,
          lefth: lefth < 10 ? '0' + lefth : lefth,
          leftm: leftm < 10 ? '0' + leftm : leftm,
          lefts: lefts < 10 ? '0' + lefts : lefts,
          show: true
        })
      }, 1000)
    },
  }
})
