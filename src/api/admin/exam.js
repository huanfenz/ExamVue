import request from '@/utils/request'

// 获取考试数量
export function getExamCount() {
  return request({
    url: '/admin/exam/getCount',
    method: 'get'
  })
}

// 查询所有考试信息
export function queryExams() {
  return request({
    url: '/admin/exam/queryAll',
    method: 'get'
  })
}

// 分页查询考试信息
export function queryExamsByPage(params) {
  return request({
    url: '/admin/exam/queryPage',
    method: 'get',
    params
  })
}

// 添加考试信息
export function addExam(data) {
  return request({
    url: '/admin/exam/addOne',
    method: 'post',
    data
  })
}

// 删除考试信息
export function deleteExam(data) {
  return request({
    url: '/admin/exam/deleteOne',
    method: 'delete',
    data
  })
}

//  删除一些考试信息
export function deleteExams(data) {
  return request({
    url: '/admin/exam/deleteSome',
    method: 'delete',
    data
  })
}

//  更新考试信息
export function updateExam(data) {
  return request({
    url: '/admin/exam/updateOne',
    method: 'put',
    data
  })
}
