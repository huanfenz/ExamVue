import request from '@/utils/request'

// 查询所有章节信息
export function queryChapters(params) {
  return request({
    url: '/admin/chapter/queryChapters',
    method: 'get',
    params
  })
}

// 保存章节
export function saveChapters(data) {
  return request({
    url: '/admin/chapter/saveChapters',
    method: 'post',
    data
  })
}
