import request from '@/utils/request'

// 获取验证码
export function getCode() {
  return request({
    url: '/system/user/captcha',
    method: 'get'
  })
}

// 登录
export function login(data) {
  return request({
    url: '/system/user/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/system/user/info',
    method: 'get',
    params: { token }
  })
}

// 获取用户信息
export function getUserById(id) {
  return request({
    url: '/system/user/getUserById',
    method: 'get',
    params: { id }
  })
}

// 登出
export function logout(token) {
  return request({
    url: '/system/user/logout',
    method: 'post',
    params: { token }
  })
}

// 注册
export function register(data) {
  return request({
    url: '/system/user/register',
    method: 'post',
    data
  })
}

// 修改密码
export function alterPassword(params) {
  return request({
    url: '/system/user/alterPassword',
    method: 'post',
    params
  })
}

//  修改个人信息
export function updateInfo(data) {
  return request({
    url: '/system/user/updateInfo',
    method: 'put',
    data
  })
}
