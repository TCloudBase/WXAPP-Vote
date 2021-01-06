const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId;
  const result = (await db.collection('vote_user').where({
    openid:openid
  }).get()).data;
  if(result.length!=0){
    const code = event.code;
    let project = result[0].project[code];
    return project?project:{}
  }
  else{
    await db.collection('vote_user').add({
      data:{
        openid:openid,
        project:{}
      }
    })
    return {}
  }
}