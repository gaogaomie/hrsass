<template>
  <div>
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :file-list="fileList"
      :on-preview="preview"
      :on-remove="onRemove"
      :on-change="onChange"
      :before-upload="beforeUpload"
      :http-request="upload"
      :class="{disabled:fileComputer}"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <!-- 进度条 -->
    <el-progress v-if="showPercent" style="width: 180px" :percentage="percent" />
    <!-- 预览弹框 -->
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <img :src="imgUrl" alt="" style="width:100%">
    </el-dialog>
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5'
var cos = new COS({
  SecretId: 'AKIDe8LJ0QZR2MPDk00iALFsFLAi00jBMGtG',
  SecretKey: '7yYqrb4GBxTjiQFn44oHTP4SaQzHI2Ug'
})
export default {
  name: 'ImageUpload',
  components: {},
  props: {},
  data() {
    return {
      fileList: [],
      showDialog: false,
      imgUrl: '',
      currentFileUid: '', // 用一个变量 记住当前上传的图片id
      percent: 0,
      showPercent: false // 默认不显示进度条
    }
  },
  computed: {
    fileComputer() {
      return this.fileList.length === 1
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    preview(file) {
      // 点击要预览的图片的信息
      this.imgUrl = file.url
      this.showDialog = true
    },
    // 图片删除
    onRemove(file, fileList) {
      // file==>删除的那个元素
      // fileList==>删除后的fileList
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
    },
    // 图片发生改变的时候
    onChange(file, fileList) {
      this.fileList = fileList.map(item => item)
    },
    // 上传之前的钩子
    beforeUpload(file) {
      // 类型校验
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.warning('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      // 大小校验
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.warning('上传图片不能超过5M')
        return false
      }
      //   已经确定当前上传的就是当前的这个file了
      this.currentFileUid = file.uid
      this.showPercent = true
      // 校验全部通过
      return true
    },
    // 上传
    upload({ file }) {
      // console.log(file)// 需要使用的文件信息
      // 不使用腾讯云OS我们就需要在这里自己执行上传事件逻辑,找到上传接口,提交文件给上传接口完成上传
      //   console.log(params.file)
      if (file) {
        // 执行上传操作
        cos.putObject({
          Bucket: 'picture-1309743358', // 存储桶
          Region: 'ap-shanghai', // 地域
          Key: file.name, // 文件名
          Body: file, // 要上传的文件对象
          StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
          // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
          onProgress: (params) => {
            this.percent = params.percent * 100
          }
        }, (err, data) => {
          // data返回数据之后 应该如何处理
          console.log(err || data)
          if (!err && data.statusCode === 200) {
            this.fileList = this.fileList.map(item => {
              if (item.uid === this.currentFileUid) {
                return { url: 'http://' + data.Location, upload: true }
              }
              return item
            })
            setTimeout(() => {
              // 关闭进度条
              this.showPercent = false
              // 进度重置为0
              this.percent = 0
            }, 1000)
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.disabled .el-upload--picture-card {
  display: none
}
.el-upload el-upload--picture-card{
   display: none
}
</style>
