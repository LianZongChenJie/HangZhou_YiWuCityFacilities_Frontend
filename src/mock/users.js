export const mockUsers = [
  { id: 1, username: 'accept01', name: '王窗口', password: '123456', role: 'accept', enabled: true },
  { id: 2, username: 'review01', name: '李审核', password: '123456', role: 'review', enabled: true },
  { id: 3, username: 'issue01', name: '陈签发', password: '123456', role: 'issue', enabled: true },
  { id: 4, username: 'close01', name: '赵办结', password: '123456', role: 'close', enabled: true },
  { id: 5, username: 'admin01', name: '系统管理员', password: '123456', role: 'admin', enabled: true }
]

export const mockRoles = [
  { key: 'accept', name: '受理岗', menus: ['工作台', '改建办件', '待处理', '办件查询'] },
  { key: 'review', name: '审核岗', menus: ['工作台', '待处理', '办件查询', '统计报表'] },
  { key: 'issue', name: '签发岗', menus: ['工作台', '待处理', '办件查询', '统计报表'] },
  { key: 'close', name: '办结岗', menus: ['工作台', '待处理', '办件查询'] },
  { key: 'admin', name: '管理岗', menus: ['工作台', '办件查询', '统计报表', '用户管理', '角色管理'] }
]
