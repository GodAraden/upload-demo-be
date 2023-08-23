// 响应处理函数参数
interface UploadChunkParams {
  order: number;
  size: number;
  fileId: string;
}

interface CreateFileParams {
  fileId: string;
  total: number;
  filename: string;
}

interface MergeChunkParams {
  fileId: string;
}

// 自定义类型
interface CustomFile {
  filename: string;
  total: number;
  upload: number;
}

interface CustomChunk {
  chunk: Buffer;
  order: number;
  size: number;
}
