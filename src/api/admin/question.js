import request from '@/utils/request'

// 获取题目数量
export function getQuestionCount() {
  return request({
    url: '/admin/question/getCount',
    method: 'get'
  })
}

// 查询所有题目信息
export function queryQuestions() {
  return request({
    url: '/admin/question/queryAll',
    method: 'get'
  })
}

// 分页查询题目信息
export function queryQuestionsByPage(params) {
  return request({
    url: '/admin/question/queryPage',
    method: 'get',
    params
  })
}

// 根据id查询题目
export function queryQuestionById(params) {
  return request({
    url: '/admin/question/queryOneById',
    method: 'get',
    params
  })
}

// 根据题目id查询选项
export function queryOptionsByQuestionId(params) {
  return request({
    url: '/admin/question/queryOptionsByQuestionId',
    method: 'get',
    params
  })
}

// 添加题目信息
export function addQuestion(data) {
  return request({
    url: '/admin/question/addOne',
    method: 'post',
    data
  })
}

// 删除题目信息
export function deleteQuestion(data) {
  return request({
    url: '/admin/question/deleteOne',
    method: 'delete',
    data
  })
}

//  删除一些题目信息
export function deleteQuestions(data) {
  return request({
    url: '/admin/question/deleteSome',
    method: 'delete',
    data
  })
}

//  更新题目信息
export function updateQuestion(data) {
  return request({
    url: '/admin/question/updateOne',
    method: 'put',
    data
  })
}

// 保存题目
export function saveQuestion(data) {
  return request({
    url: '/admin/question/saveQuestion',
    method: 'post',
    data
  })
}

// 移除题目
export function removeQuestion(data) {
  return request({
    url: '/admin/question/removeQuestion',
    method: 'post',
    data
  })
}

// 移除一些题目
export function removeQuestions(data) {
  return request({
    url: '/admin/question/removeQuestions',
    method: 'post',
    data
  })
}

// 获取随机题目
export function getRandomQuestion(params) {
  return request({
    url: '/admin/question/getRandomQuestion',
    method: 'get',
    params
  })
}

export function exportExcel(data) {
  return request({
    url: '/admin/question/exportExcel',
    method: 'post',
    data
  })
}
