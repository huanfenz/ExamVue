import request from '@/utils/request'

// 获取题库数量
export function getRepoCount() {
  return request({
    url: '/admin/repo/getCount',
    method: 'get'
  })
}

// 查询所有题库信息
export function queryRepos() {
  return request({
    url: '/admin/repo/queryAll',
    method: 'get'
  })
}

// 分页查询题库信息
export function queryReposByPage(params) {
  return request({
    url: '/admin/repo/queryPage',
    method: 'get',
    params
  })
}

// 添加题库信息
export function addRepo(data) {
  return request({
    url: '/admin/repo/addOne',
    method: 'post',
    data
  })
}

// 删除题库信息
export function deleteRepo(data) {
  return request({
    url: '/admin/repo/deleteOne',
    method: 'delete',
    data
  })
}

//  删除一些题库信息
export function deleteRepos(data) {
  return request({
    url: '/admin/repo/deleteSome',
    method: 'delete',
    data
  })
}

//  更新题库信息
export function updateRepo(data) {
  return request({
    url: '/admin/repo/updateOne',
    method: 'put',
    data
  })
}
