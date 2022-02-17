<template>
  <!-- 新增部门的弹层 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <el-form ref="deptsForm" label-width="120px" :model="formData" :rules="rules">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeeSimple">
          <el-option v-for="item in people" :key="item.id" :label="item.username" :value="item.username">{{ item.username }}  </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
  // 需要传入一个props变量来控制 显示或者隐藏
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // 现在定义一个函数 这个函数的目的是 去找 同级部门下 是否有重复的部门名称
    const checkNameRepeat = async(rule, value, callback) => {
      // 先要获取最新的组织架构数据
      // depts是所有的部门数据
      const { depts } = await getDepartments()
      let isRepeat = false
      if (this.formData.id) {
        // 有id就是编辑模式  编辑模式下校验部门名称
        // 编辑 张三 => 校验规则 除了我之外 同级部门下 不能有叫张三的
        isRepeat = depts.filter(item => item.id !== this.treeNode.id && item.pid === this.treeNode.pid).some(item => item.name === value)
      } else {
        // 技术部所有的子节点 新增模式下校验部门名称
        isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }

      isRepeat ? callback(new Error(`同级部门下已经有${value}的部门了`)) : callback()
    }
    // 检查编码重复
    const checkCodeRepeat = async(rule, value, callback) => {
      // 先要获取最新的组织架构数据
      const { depts } = await getDepartments()
      let isRepeat = false
      if (this.formData.id) {
        // 编辑模式  校验编码规则 因为编辑模式下 不能算自己
        isRepeat = depts.some(item => item.id !== this.treeNode.id && item.code === value && value)
      } else {
        // 新增模式 校验编码规则
        isRepeat = depts.some(item => item.code === value && value) // 这里加一个 value不为空 因为我们的部门有可能没有code
      }
      isRepeat ? callback(new Error(`组织架构中已经有部门使用${value}编码`)) : callback()
    }
    return {
      // 定义一个表单数据
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: checkNameRepeat }], // 自定义函数的形式校验
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: checkCodeRepeat }], // 自定义函数的形式校验
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }]
      },
      people: []
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增子部门'
    }
  },
  methods: {
    // 获取简单员工
    async getEmployeeSimple() {
      const res = await getEmployeeSimple()
      this.people = res
    },
    // 新增部门
    btnOK() {
      this.$refs.deptsForm.validate(async(isOK) => {
        if (isOK) {
          // 判断是编辑还是新增 依据：formdata里面的id
          if (this.formData.id) {
            // 编辑模式  调用编辑接口
            await updateDepartments(this.formData)
          } else {
            // 新增模式下，调用新增借口
            // 如果成功，则将新数据添加到后台数据里
            await addDepartments({ ...this.formData, pid: this.treeNode.id })
          }

          // 通知父组件去更新部门数据
          this.$emit('addDepts')

          // 关闭弹窗  子组件通知父组件的语法糖
          // 子组件 update:固定写法 (update:props名称, 值)
          this.$emit('update:showDialog', false) // 触发事件
          // 清空输入框里面的内容
          // 点击确认按钮的时候 ei-dialog会自动触发close时间，无需手动关闭
        }
      })
    },
    // 弹窗关闭效果
    btnCancel() {
      // // 重置数据  因为resetFields 只能重置 表单上的数据 非表单上的 比如 编辑中id 不能重置
      // this.formData = {
      //   name: '', // 部门名称
      //   code: '', // 部门编码
      //   manager: '', // 部门管理者
      //   introduce: '' // 部门介绍
      // }
      this.$emit('update:showDialog', false) // 关闭
      this.$refs.deptsForm.resetFields()// 对该表单项进行重置，将其值重置为初始值并移除校验结果
    },
    // 编辑部门
    async  getDepartDetail(id) {
      // prop传值是异步的，id有可能会传过来，有可能不会传过来，因此需要父组件传入，确保id
      this.formData = await getDepartDetail(id)
    }
  }
}

</script>

<style>

</style>
