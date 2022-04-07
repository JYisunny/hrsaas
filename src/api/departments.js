import request from '@/utils/request'

/** 
 * 获取组织架构的数据
 */
export function getDepartments() {
    return request({
        url: '/company/department'
    })
}

/**
 * 删除组织架构部门
 */
export function delDepartments(id) {
    return request({
        url: `/company/department/${id}`,
        method: 'DELETE'
    })
}

/**
 * 新增部门组织架构
 */
export function addDepartments(data) {
    return request({
        url: '/company/department',
        method: 'POST',
        data
    })
}

/**
 *  根据ID获取部门详情
 */
export function getDepartDetail(id) {
    return request({
        url: `/company/department/${id}`
    })
}

/**
 *  保存部门编辑的数据
 */
export function updateDepartments(data) {
    return request({
        url: `/company/department/${data.id}`,
        method: 'put',
        data
    })
}