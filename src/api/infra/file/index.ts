import request from '@/config/axios'

export interface FileConfigVO {
  configFile?: string
  id?: number
  name: string
  storage: number
  master: boolean
  visible: boolean
  config: any
  remark?: string
  createTime?: Date
}

export interface FilePageReqVO {
  page: number
  limit: number
  path?: string
  type?: string
  createTime?: [Date, Date]
}

export interface FilePresignedUrlRespVO {
  configId: number
  url: string
  path: string
}

export interface FileRespVO {
  configId: number
  path: string
  url: string
  name: string
  type: string
  size: number
}

// 查询文件列表
export const getFilePage = async (params: FilePageReqVO) => {
  return await request.get({ url: '/infra/file/page', params })
}

// 删除文件
export const deleteFile = async (id: number) => {
  return await request.delete({ url: '/infra/file/delete?id=' + id })
}

// 获取文件预签名地址（模式一：前端直连上传，仅支持 S3 类型）
export const getFilePresignedUrl = async (fileName: string, directory?: string) => {
  return await request.get<FilePresignedUrlRespVO>({
    url: '/infra/file/presigned-url',
    params: { fileName: fileName, directory: directory }
  })
}

// 创建文件（模式一：前端直连上传，记录到数据库）
export const createFile = async (data: any) => {
  return await request.post({ url: '/infra/file/create', data })
}

// 上传文件（模式二：后端上传）
export const updateFile = async (data: any, onUploadProgress?: (progressEvent: any) => void) => {
  return await request.upload({ url: '/infra/file/upload', data, onUploadProgress })
}

// 下载文件
export const downloadFile = async (configId: number, path: string) => {
  return await request.download({
    url: '/infra/file/download',
    params: { configId, path }
  })
}
