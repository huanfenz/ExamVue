<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 用户名输入 -->
      <el-input
        v-model="queryParam.username"
        placeholder="用户名"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- 一些按钮 -->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleShowAll"
      >
        显示全部
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加用户
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="danger"
        icon="el-icon-delete"
        @click="handleDeleteSome"
      >
        批量删除
      </el-button>
    </div>

    <!--弹出框-->
    <!-- :close-on-click-modal="false" -->
    <el-dialog :title="formTitle" :visible.sync="dialogFormVisible" width="40%">
      <el-row>
        <el-col :span="16">
          <!--普通表单-->
          <el-form ref="ruleForm" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" />
            </el-form-item>

            <el-form-item label="身份" prop="role">
              <el-radio v-model="form.role" label="管理员" :disabled="form.id === 1">管理员</el-radio>
              <el-radio v-model="form.role" label="学生" :disabled="form.id === 1">学生</el-radio>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <div align="center">
            <h3>点击下方图片上传头像</h3>
            <!--上传图片-->
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8093/system/upload/uploadImage"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-image
                v-if="form.profile"
                :src="form.profile"
                class="avatar"
                alt="封面无法显示"
              />
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>

      <el-table-column type="selection" width="55" fixed align="center" />

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column label="头像" align="center">
        <template slot-scope="scope">
          <el-avatar :key="scope.row.profile" size="large" :src="scope.row.profile">
            <img src="http://wangpeng-imgsubmit.oss-cn-hangzhou.aliyuncs.com/img/202203231718487.png">
          </el-avatar>
        </template>
      </el-table-column>

      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleUpdate(scope.row)">{{ scope.row.username }}</el-link>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="password" label="密码" align="center" /> -->

      <el-table-column label="用户身份" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.role === '管理员'" type="warning">管理员</el-tag>
          <el-tag v-else type="success">学生</el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row, scope.$index)"
          >删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!--分页条-->
    <el-pagination
      background
      :current-page.sync="queryParam.page"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="queryParam.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="recordTotal"
      style="margin-top: 15px"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import waves from '@/directive/waves' // waves directive
import {
  getUserCount,
  // queryUsers,
  queryUsersByPage,
  addUser,
  deleteUser,
  deleteUsers,
  updateUser
} from '@/api/admin/user'

export default {
  name: 'UserList',
  directives: { waves },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 记录总数
      recordTotal: 0,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        username: null
      },
      // 对话框表单显示
      dialogFormVisible: false,
      // 表单类型（添加数据:0,修改数据:1）
      formType: 0,
      // 表单数据
      form: {
        id: null,
        username: null,
        password: null,
        role: '管理员',
        profile: null
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 获得user信息
    // ...mapGetters(['id', 'name', 'roles', 'avatar']),
    // 通过表单类型计算表单标题
    formTitle() {
      return this.formType === 0 ? '添加记录' : '修改记录'
    }
  },
  // 创建后
  created() {
    // 从服务器获取数据表格第一页的信息
    // 默认page=1，size=10
    this.queryPage()
  },
  methods: {
    // 查询分页
    queryPage() {
      queryUsersByPage(this.queryParam).then((res) => {
        if (res.status === 200) {
          this.tableData = res.data
          this.recordTotal = res.count
        }
      })
    },

    // 分页大小改变监听
    handleSizeChange(curSize) {
      this.queryParam.limit = curSize
      this.queryPage()
    },

    // 点击分页监听方法
    handleCurrentChange(curPage) {
      this.queryParam.page = curPage
      this.queryPage()
    },

    // 搜索
    handleFilter() {
      this.queryParam.page = 1
      this.queryPage()
    },

    // 点击显示全部
    handleShowAll() {
      this.queryParam.page = 1
      this.queryParam.username = null
      this.queryPage()
    },

    // 点击添加记录
    handleCreate() {
      // 表单是添加状态
      this.formType = 0
      // 将空数据置入form
      this.form = {
        id: null,
        username: null,
        password: null,
        role: '学生',
        profile: null
      }
      // 显示表单框
      this.dialogFormVisible = true
    },

    // 点击修改记录
    handleUpdate(row) {
      // 表单是修改状态
      this.formType = 1
      // 将行数据置入form
      this.form = {
        id: row.id,
        username: row.username,
        password: row.password,
        role: row.role,
        profile: row.profile
      }
      // 显示表单框
      this.dialogFormVisible = true
    },

    // 添加和更新的提交表单
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) {
          this.$message.error('不允许提交，请检查必填项')
          return false
        }
        if (this.formType === 0) {
        // 添加记录
          addUser(this.form).then((res) => {
            if (res.status === 200) {
              this.$message.success('添加记录成功')
              // 跳转到末尾
              getUserCount().then((res) => {
                this.recordTotal = res.data
                this.queryParam.page = Math.ceil(
                  this.recordTotal / this.queryParam.limit
                )
                this.handleCurrentChange(this.queryParam.page)
              })
            } else {
              if (res.status === 501) this.$message.error(res.message)
              else this.$message.error('添加记录失败')
            }
            this.dialogFormVisible = false // 关闭对话框
          })
        } else if (this.formType === 1) {
          // 更新记录
          updateUser(this.form).then((res) => {
            if (res.status === 200) {
              this.$message.success('更新记录成功')
              this.queryPage()
              this.dialogFormVisible = false // 关闭对话框
            } else {
              if (res.status === 501) this.$message.error(res.message)
              else this.$message.error('更新记录失败')
            }
          })
        }
      })
    },

    // 删除记录
    handleDelete(row, index) {
      this.$confirm('确定要删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row).then((res) => {
          if (res.status === 200) {
            this.$message.success('删除记录成功')
            this.tableData.splice(index, 1)
            // 如果删完了，获取上一页
            if (this.tableData.length === 0) {
              this.queryParam.page = this.queryParam.page - 1
              this.handleCurrentChange(this.queryParam.page)
            }
          } else {
            this.$message.error(res.message)
          }
        })
      })
    },

    // 删除一些
    handleDeleteSome() {
      // 获取选中的对象数组
      const items = this.$refs.multipleTable.selection
      if (items.length === 0) {
        this.$message.error('至少选择一条记录')
        return
      }
      this.$confirm('确定要删除这些记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUsers(items).then((res) => {
          if (res.status === 200) {
            this.$message.success('批量删除记录成功')
            if (this.tableData.length === items.length) {
              // 如果本页内容全部删光了
              // 当前页为上一页
              if (this.queryParam.page !== 0) {
                this.queryParam.page = this.queryParam.page - 1
              }
            }
          } else {
            this.$message.error(res.message)
          }
          // 重载当前页
          this.handleCurrentChange(this.queryParam.page)
        })
      })
    },

    // 图片上传之前监听
    beforeAvatarUpload(file) {
      const isJpg = file.type === 'image/jpeg'
      const isPng = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJpg && !isPng) {
        this.$message.error('只能上传 jpg 和 png 图片')
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传封面图片大小不能超过 2MB!')
        return false
      }
      return true
    },

    // 图片上传成功监听
    handleAvatarSuccess(res, file) {
      console.log(file)
      if (res.status === 200) {
        this.$message.success(res.message)
        this.form.profile = res.data
      } else {
        this.$message.error(res.message)
      }
    }
  }
}
</script>

<style scoped>
</style>
