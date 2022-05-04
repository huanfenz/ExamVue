import request from '@/utils/request'

// 分页查询成绩列表
export function queryRecordByPageByStudent(params) {
  return request({
    url: '/student/record/queryPage',
    method: 'get',
    params
  })
}
