import request from '@/utils/request'

// 分页查询考试记录
export function queryRecordByPage(params) {
  return request({
    url: '/admin/record/queryPage',
    method: 'get',
    params
  })
}

// 学生分页查询考试记录
export function queryRecordByPageByStudent(params) {
  return request({
    url: '/admin/record/queryPageByStudent',
    method: 'get',
    params
  })
}

// 删除考试信息
export function deleteRecord(data) {
  return request({
    url: '/admin/record/deleteRecord',
    method: 'delete',
    data
  })
}

//  删除一些考试信息
export function deleteRecords(data) {
  return request({
    url: '/admin/record/deleteRecords',
    method: 'delete',
    data
  })
}

//  修改分数
export function alterScore(data) {
  return request({
    url: '/admin/record/alterScore',
    method: 'put',
    data
  })
}

// 提交批改
export function commitCheck(data) {
  return request({
    url: '/admin/record/commitCheck',
    method: 'post',
    data
  })
}
