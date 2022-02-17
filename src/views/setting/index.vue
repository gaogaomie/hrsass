<template>
  <div class="dashboard-container">
    <div class="app-container">
      <template>
        <div class="dashboard-container">
          <div class="app-container">
            <el-card>
              <el-tabs>
                <!-- 放置页签 -->
                <el-tab-pane label="角色管理">
                  <!-- 新增角色按钮 -->
                  <el-row style="height:60px">
                    <el-button
                      icon="el-icon-plus"
                      size="small"
                      type="primary"
                      @click="showDialog = true"
                    >新增角色</el-button>
                  </el-row>
                  <!-- 表格 -->
                  <el-table border="" :data="list">
                    <el-table-column label="序号" width="120" type="index" align="center" />
                    <el-table-column label="角色名称" width="240" prop="name" align="center" />
                    <el-table-column label="描述" prop="description" align="center" />
                    <el-table-column label="操作">
                      <template slot-scope="{ row }">
                        <el-button size="small" type="success">分配权限</el-button>
                        <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                        <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- 分页组件 -->
                  <el-row type="flex" justify="center" align="middle" style="height: 60px">
                    <!-- 分页组件 -->
                    <el-pagination layout="prev,pager,next" :page-size="page.pagesize" :page-count="page.page" :total="page.total" @current-change="changePage" />
                  </el-row>
                </el-tab-pane>
                <el-tab-pane label="公司信息">
                  <el-alert
                    title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
                    type="info"
                    show-icon
                    :closable="false"
                  />
                  <el-form label-width="120px" style="margin-top:50px">
                    <el-form-item label="公司名称">
                      <el-input v-model="formData.name" disabled style="width:400px" />
                    </el-form-item>
                    <el-form-item label="公司地址">
                      <el-input v-model="formData.companyAddress" disabled style="width:400px" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                      <el-input v-model="formData.mailbox" disabled style="width:400px" />
                    </el-form-item>
                    <el-form-item label="备注">
                      <el-input v-model="formData.remarks" type="textarea" :rows="3" disabled style="width:400px" />
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </div>
      </template>
      <!-- 放置弹出层 -->
      <el-dialog title="编辑弹层" :visible="showDialog" @close="btnCancel">
        <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" />
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="roleForm.description" />
          </el-form-item>
        </el-form>
        <!-- 底部 -->
        <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
            <el-button size="small" @click="btnCancel">取消</el-button>

            <el-button size="small" type="primary" @click="btnOK">确定</el-button>

          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, getRoleDetail, updateRole, addRole } from '@/api/setting'

export default {
  name: 'Setting',
  data() {
    return {
      list: [],
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0 // 记录总数
      },
      formData: {}, // 用来存放公司信息
      showDialog: false,
      roleForm: {},
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      }

    }
  },

  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo() // 获取公司信息
  },
  methods: {
  // 更新列表
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    changePage(newPage) {
      console.log(newPage)
      // newPage是当前点击的页码
      this.page.page = newPage // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    // 获取公司信息
    async  getCompanyInfo() {
      const res = await getCompanyInfo()
      // console.log(res)
      this.formData = res[0]
    },
    // 删除角色
    async deleteRole(id) {
      //  提示
      try {
        await this.$confirm('确认删除该角色吗')
        // 只有点击了确定 才能进入到下方
        await deleteRole(id) // 调用删除接口
        this.getRoleList() // 重新加载数据
        this.$message.success('删除角色成功')
      } catch (error) {
        console.log(error)
      }
    },
    // 编辑角色 或者增加角色
    async  editRole(id) {
      this.roleForm = await getRoleDetail(id) // 调用接口 数据回填
      this.showDialog = true// 打开弹层
    },
    async  btnOK() {
      try {
        // 验证form表单字段
        await this.$refs.roleForm.validate()
        // 通过验证才会执行下面流程
        if (this.roleForm.id) {
          // 编辑业务
          await updateRole(this.roleForm)
        } else {
          // 新增业务
          await addRole(this.roleForm)
        }

        // 重新拉取数据
        this.getRoleList()
        // 关闭弹窗
        this.$message.success('操作成功')
        this.showDialog = false
      } catch (error) {
        console.log(error)
      }
    },
    // 关闭弹窗
    btnCancel() {
      // 字段全部清空
      this.roleForm = {
        name: '',
        description: ''
      }
      // 清除校验规则
      this.$refs.roleForm.resetFields()
      //  关闭弹窗
      this.showDialog = false
    }
  }
}
</script>

<style>

</style>
