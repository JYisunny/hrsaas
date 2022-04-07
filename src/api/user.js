import request from '@/utils/request'

/**
 * 登录接口封装
 */
export function login(data) {
    // 返回一个Promise对象
    return request({
        url: '/sys/login',
        method: 'post',
        data
    })
}

/**
 *  获取用户基本资料
 */
export function getUserInfo(token) {
    return request({
        url: '/sys/profile',
        method: 'post'
    })
}

/**
 *  获取员工/用户 基础信息
 *    完全是为了显示头像
 *  根据用户id获取用户详情
 */
export function getUserDetailById(id) {
    return request({
        url: `/sys/user/${id}`
    })
}

export function logout() {

}