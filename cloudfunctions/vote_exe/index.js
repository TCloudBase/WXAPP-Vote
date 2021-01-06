const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const openid = event.userInfo.openId;
  const result = (await db.collection('vote_user').where({
    openid:openid
  }).get()).data;
  if(result.length!=0){
    const code = event.code;
    let project = result[0].project[code];
    let newData = event.select;
    let diff = {}
    for(let i in newData){
      diff[i] = _.inc(1)
    }
    for(let i in project){
      if(diff[i]) delete diff[i];
      else diff[i] = _.inc(-1)
    }
    await db.collection('vote_user').where({
      openid:openid
    }).update({
      data:{
        project:{
          [event.code]:_.set(newData)
        }
      }
    })
    await db.collection('vote_mess').where({
      code:code
    }).update({
      data:{
        number:diff
      }
    })
    return newData
  }
}