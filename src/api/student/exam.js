import request from '@/utils/request'

// 分页查询考试信息
export function queryExamsByPage(params) {
  return request({
    url: '/student/exam/queryPage',
    method: 'get',
    params
  })
}

// 校验密码
export function checkPassword(data) {
  return request({
    url: '/student/exam/checkPassword',
    method: 'post',
    data
  })
}

// 创建学生考试
export function createStudentExam(data) {
  return request({
    url: '/student/exam/createStudentExam',
    method: 'post',
    data
  })
}

// 获取学生回答
export function getExamInfo(params) {
  return request({
    url: '/student/exam/getExamInfo',
    method: 'get',
    params
  })
}

// 获得问题
export function getQuestion(params) {
  return request({
    url: '/student/exam/getQuestion',
    method: 'get',
    params
  })
}

// 保存答案
export function saveAnswer(data) {
  return request({
    url: '/student/exam/saveAnswer',
    method: 'post',
    data
  })
}

// 交卷
export function commitPaper(data) {
  return request({
    url: '/student/exam/commitPaper',
    method: 'post',
    data
  })
}

// 获得分数
export function getScore(params) {
  return request({
    url: '/student/exam/getScore',
    method: 'get',
    params
  })
}

// 得到详情
export function getDetail(params) {
  return request({
    url: '/student/exam/getDetail',
    method: 'get',
    params
  })
}
