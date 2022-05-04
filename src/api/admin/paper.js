import request from '@/utils/request'

// 获取试卷数量
export function getPaperCount() {
  return request({
    url: '/admin/paper/getCount',
    method: 'get'
  })
}

// 查询所有试卷信息
export function queryPapers() {
  return request({
    url: '/admin/paper/queryAll',
    method: 'get'
  })
}

// 分页查询试卷信息
export function queryPapersByPage(params) {
  return request({
    url: '/admin/paper/queryPage',
    method: 'get',
    params
  })
}

// 添加试卷信息
export function addPaper(data) {
  return request({
    url: '/admin/paper/addOne',
    method: 'post',
    data
  })
}

// 移除试卷信息
export function removePaper(data) {
  return request({
    url: '/admin/paper/removePaper',
    method: 'delete',
    data
  })
}

//  删除一些试卷信息
export function removePapers(data) {
  return request({
    url: '/admin/paper/removePapers',
    method: 'delete',
    data
  })
}

//  更新试卷信息
export function updatePaper(data) {
  return request({
    url: '/admin/paper/updateOne',
    method: 'put',
    data
  })
}

// 保存试卷
export function savePaper(data) {
  return request({
    url: '/admin/paper/savePaper',
    method: 'post',
    data
  })
}

// 获得试卷
export function getPaper(params) {
  return request({
    url: '/admin/paper/getPaper',
    method: 'get',
    params
  })
}
