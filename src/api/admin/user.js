import request from '@/utils/request'

// 获取用户数量
export function getUserCount() {
  return request({
    url: '/admin/user/getCount',
    method: 'get'
  })
}

// 查询所有用户信息
export function queryUsers() {
  return request({
    url: '/admin/user/queryAll',
    method: 'get'
  })
}

// 分页查询用户信息
export function queryUsersByPage(params) {
  return request({
    url: '/admin/user/queryPage',
    method: 'get',
    params
  })
}

// 添加用户信息
export function addUser(data) {
  return request({
    url: '/admin/user/addOne',
    method: 'post',
    data
  })
}

// 删除用户信息
export function deleteUser(data) {
  return request({
    url: '/admin/user/deleteOne',
    method: 'delete',
    data
  })
}

//  删除一些用户信息
export function deleteUsers(data) {
  return request({
    url: '/admin/user/deleteSome',
    method: 'delete',
    data
  })
}

//  更新用户信息
export function updateUser(data) {
  return request({
    url: '/admin/user/updateOne',
    method: 'put',
    data
  })
}
