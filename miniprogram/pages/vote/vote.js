// 项目，通过实时
// 用户，调用云函数
// 投票，调用云函数，自己和项目票数自增

// JS-SDK : 未登录，匿名登录，邮件登录，手机登录
// WEB-SDK: 未登录、微信登录（服务号）

//=================虚拟数据源====================
var tempdata = {
  SIN: {
    title: "你的云开发使用经验如何？", //投票标题
    options: [ //投票选项
      "小白：从来没有接触",
      "入门：正在学习和尝试DEMO",
      "了解：懂一些使用，敢于尝试小项目",
      "掌握：具备开发线上项目的实力",
      "熟悉：专业踩坑达人，多个线上项目"
    ],
    code: "SIN", //进入路径
    open: true, //允许投票
    one: false, //只允许一次
    number: {   //投票数
      0:32,
      1:56,
      2:34,
      3:78,
      4:40
    }
  }
}
//=================页面逻辑区====================
var that = null

Page({
  data: {},
  onLoad(options) {
    that = this;
    if (options.code != null) {
      that.code = options.code;
      that.init_project()
    } else {
      setInfo('T_OPEN')
    }
  },
  init_project() {
    that.watch = wx.cloud.database().collection('vote_mess').where({
      code:that.code
    }).watch({
      onChange(res){
        if (res.docs.length != 0) {
          let result = res.docs[0];
          setProject(result)
          if (that.data.user == null || result.number == null) {
            that.init_user()
          }
        } else {
          setInfo('T_OPEN')
        }
      },
      onError(err){
        setInfo('T_NET')
      }
    })
  },
  init_user() {
    netCall({
      name:'vote_init',
      data:{
        code:that.code
      },
      success(res){
        setUser(res.result)
        that.one = JSON.stringify(res.result)
      }
    })
  },
  vote(e) {
    if (that.data.project.open != true) {
      showModel('S_CLOSE')
      return;
    }
    if (that.data.user[e.currentTarget.dataset.i] == true) {
      return;
    }
    if (that.data.project.one && that.one != '{}') {
      showModel('S_ONE')
      return;
    }
    let tempvote = {}
    if(e.currentTarget.dataset.mul){
      for(let i in that.data.user){
        if(that.data.user[i]==true){
          tempvote[i] = true
        }
      }
      if(Object.keys(tempvote).length==0){
        showModel('S_EMPTY')
        return;
      }
    }
    else{
       tempvote[e.currentTarget.dataset.i] = true
    }
    that.setData({
      load: tempvote
    })
    netCall({
      name:'vote_exe',
      data:{
        select:tempvote,
        code:that.code
      },
      success(res){
        setUser(res.result)
        that.one = JSON.stringify(res.result)
      }
    })
  },
  select(e) {
    let key = 'user.'+e.currentTarget.dataset.i
    that.setData({
      [key]:!that.data.user[e.currentTarget.dataset.i]
    })
  },
  onShareAppMessage() {
    return {
      title: `投票-${that.data.project.title}`,
      path: `/pages/vote/vote?code=${that.code}`
    }
  }
})
//=================功能封装区====================
const INFO = {
  T_NET: '网络服务出现异常，请稍后再试\n如有问题请联系管理员处理',
  T_OPEN: '无法找到对应的投票项目，请重新尝试\n如有问题请联系管理员处理',
  S_ONE: ['项目设置只能投票一次', '提示'],
  S_CLOSE: ['当前不能投票，请等待投票开启', '提示'],
  S_LOAD: ['请等待本次投票操作完毕后再变更选择', '提示'],
  S_FAIL: ['在操作时遇到了一些网络问题，请稍后再试', '网络错误'],
  S_EMPTY: ['多选不能为空，请至少选择一个','提示']
}
function setInfo(info) {
  that.setData({
    info: INFO[info]
  })
}
function setUser(user) {
  that.setData({
    user,
    load: null
  })
}
function setProject(project) {
  that.setData({
    project
  })
}
function setLoad(load) {
  that.setData({
    load
  })
}
function showModel(info) {
  wx.showModal({
    title: INFO[info][1],
    content: INFO[info][0],
    showCancel: false
  })
}
function netCall(obj) {
  if (that.netload != true) {
    that.netload = true;
    wx.cloud.callFunction({
      name: obj.name,
      data: (obj.data ? obj.data : {}),
      success: (res) => {
        typeof obj.success == "function" ? obj.success(res) : null
      },
      fail: (err) => {
        showModel('S_FAIL')
        console.log(err)
        typeof obj.fail == "function" ? obj.fail(err) : null
      },
      complete() {
        that.netload = false;
      }
    })
  } else {
    showModel('S_LOAD')
  }
}