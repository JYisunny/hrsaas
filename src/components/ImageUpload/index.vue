<template>
  <div>
      <!-- 给action一个#号 就不会报错了 -->
      <!-- file-list是上传的文件列表    可以绑定到上传组件上，让上传组件来显示 -->
      <!-- upload 组件显示的是 file-list内容 -->
      <el-upload
        list-type="picture-card" 
        :limit="1" 
        action="#"
        :on-preview="preview"
        :on-remove="handleRemove"
        :on-change="changeFile"
        :before-upload="beforeUpload"
        :http-request="upload"
        :file-list="fileList"
        :class="{ disabled: fileComputed }"
      >
          <i class="el-icon-plus" />
      </el-upload>
      <el-progress v-if="showPercent" :percentage="percent" style="width:180px" />
      <el-dialog :visible.sync="showDialog" title="图片预览">
          <img width="100%" :src="imgUrl" alt="">
      </el-dialog>
      </div>
</template>

<script>
import COS from 'cos-js-sdk-v5' // 引入腾讯云 cos 包

// 实例化COS对象 需要传入两个(ID + 密钥)
const cos = new COS({
    // 腾讯云中的密钥
    SecretId: 'AKID0mJZYGiupTqwkIfla8OP8algJfkZ7PRD', // 身份识别 ID
    SecretKey: 'WmmUw6zbw0mHbeQxF1XnmUv5yZz80bw0' // 身份密钥
})

export default {
    data () {
        return {
            fileList: [/* {url: 'https://t7.baidu.com/it/u=4187938205,226110168&fm=193&f=GIF'} *//*,  { url: 'https://t7.baidu.com/it/u=3837406260,1306354845&fm=193&f=GIF' }*/],
            showDialog: false,
            imgUrl: '',
            currentFileUid: null, // 记录当前正在上传的uid      
            percent: 0, // 上传进度的百分比
            showPercent: false
        }
    },
    computed: {
        // 如果它为true 表示不应该显示 ＋号上传了
        fileComputed() {
            return this.fileList.length === 1
        }
    },
    methods: {
        // 点击预览事件
        preview(file) {
            console.log(file.url);
            this.imgUrl = file.url
            this.showDialog = true
        },
        // file 是要删除的文件
        // fileList 是删除后的文件
        handleRemove(file, fileList) {
            // console.log(file);
            // console.log(fileList);
            // console.log(this.fileList);
            this.fileList = this.fileList.filter(item => item.uid !== file.uid) // 将当前的删除文件排除在外
            // this.fileList = fileList
        },
        // 不能用push 这个钩子会执行多次
        changeFile(file, fileList) {
            // file是当前的文件 fileList是当前的最新数组
            // console.log(file);
            // console.log(fileList);
            // 如果当前 fileList中没有该文件  就往里进行追加
            this.fileList = fileList.map(item => item)
            // Why failed? Cause 没有上传(action="#") 所以第二次进来的数据 一定是空的
            // 如果完成上传动作了  第一次进入 和第二次进入的fileList的长度应该都是1  都有数据
            // 上传成功 => 数据才能进来 => 腾讯云cos
        },
        beforeUpload(file) {
            // console.log(file);
            // 先检查文件类型
            const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
            if (!types.includes(file.type)) {
                // 如果上传图片  不存在类型
                this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
                return false // 上传终止
            }
            // 检查文件大小    5M
            const maxSize = 5 * 1024 * 1024
            if (file.size > maxSize) {
                // 超过了限制的文件大小
                this.$message.error('上传的图片大小不能大于5M')
                return false
            }
            // 已经确定上传的就是当前的这个 file了
            // console.log(file)
            this.currentFileUid = file.uid
            this.showPercent = true
            return true // 最后一定要 return true
            // (上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。) 
        },
        // 进行上传操作
        upload(params) {
            // console.log(params.file)
            if (params.file) {
                // 执行上传操作
                cos.putObject({
                    // 上传到腾讯云 => 哪个存储桶 哪个地域的存储桶 文件 格式 名称 回调
                    Bucket: 'jyisuny-1310726043', // 存储桶名称
                    Region: 'ap-nanjing', // 所在地域
                    Key: params.file.name, // 文件名
                    Body: params.file, // 要上传的文件对象
                    StorageClass: 'STANDARD', // 上传的模式类型  直接默认 标准模式
                    onProgress: (params) => {
                        // console.log(params) // {loaded: 0, total: 711851, speed: 0, percent: 0}
                        this.percent = params.percent * 100
                    }
                }, (err, data) => {
                    // data返回数据之后 应该如何处理?
                    // console.log(err || data)
                    // data中有一个statusCode === 200 说明上传成功
                    if (!err && data.statusCode === 200) {
                        // 此时说明文件上传成功     要获取成功的返回地址(data.Location,记住拼接 http:// )
                        // fileList才能显示到上传组件中   此时我们要将fileList中的数据的 url地址变成 现在上传成功返回的地址
                        // 目前虽然是一张图片 但是请注意: 我们的fileList是一个数组
                        // 需要知道当前上传成功的是哪一张图片
                        this.fileList = this.fileList.map(item => {
                            // 去找谁的uid等于刚刚记录下的uid
                            if (item.uid === this.currentFileUid) {
                                // 将成功的地址赋值给原来的 url
                                return { url: 'http://' + data.Location, upload: true }
                                // upload 为true 表示这张图片已经上传完毕 该属性要为我们后期引用的时候做标记
                                // 保存信息时，图片有大有小，上传速度有快慢(图片未上传成功，就点击保存) ==> 要根据有没有 upload这个标记来决定是否去保存
                            }
                            return item
                        })
                        // 关闭进度条   &&  重置百分比
                        setTimeout(() => {
                            this.showPercent = false
                            this.percent = 0
                        }, 1500);
                        
                        // 将上传成功的地址  回写 到了fileList中    fileList变化 => upload组件 就会根据fileList变化而去渲染视图
                    }
                })
            }
        }
    }
}
</script>

<style>
    .disabled .el-upload--picture-card {
        display: none;
    }
</style>
