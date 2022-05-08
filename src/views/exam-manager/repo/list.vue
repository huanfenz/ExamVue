<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 题库名 -->
      <el-input
        v-model="queryParam.name"
        placeholder="题库名"
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
        添加题库
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
    <el-dialog :title="formTitle" :visible.sync="dialogFormVisible" width="30%">
      <!--普通表单-->
      <!-- name\isopen\remark -->
      <el-form ref="ruleForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题库名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="是否开放" prop="isOpen">
          <el-radio v-model="form.isOpen" :label="0">否</el-radio>
          <el-radio v-model="form.isOpen" :label="1">是</el-radio>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 抽屉 -->
    <el-drawer
      title="章节管理"
      :visible.sync="drawerVisable"
      size="50%"
      :wrapper-closable="false"
      :destroy-on-close="true"
    >
      <chapter v-if="drawerVisable" :repo-id="repoId" @close-event="drawerVisable = false" />
    </el-drawer>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>
      <el-table-column fixed type="selection" width="55" align="center" />

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column label="题库名" align="center" width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-link type="primary" @click="handleUpdate(scope.row)">{{
            scope.row.name
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="是否开放" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.isOpen === 0" style="color: red">否</span>
          <span v-else style="color: green">是</span>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center" />

      <el-table-column prop="updateTime" label="更新时间" align="center" />

      <el-table-column fixed="right" label="操作" width="250" align="center">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="small"
            @click="handleChapter(scope.row)"
          >章节管理</el-button>
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
import waves from '@/directive/waves' // waves directive
import {
  getRepoCount,
  // queryRepos,
  queryReposByPage,
  addRepo,
  deleteRepo,
  deleteRepos,
  updateRepo
} from '@/api/admin/repo'
import chapter from './chapter.vue'

export default {
  name: 'RepoList',
  components: { chapter },
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
        name: null
      },
      // 对话框表单显示
      dialogFormVisible: false,
      // 抽屉框显示
      drawerVisable: false,
      // 表单类型（添加数据:0,修改数据:1）
      formType: 0,
      // 表单数据
      form: {
        id: null,
        name: null,
        isOpen: null,
        remark: null
      },
      rules: {
        name: [{ required: true, message: '请输入题库名', trigger: 'blur' }]
      },
      // 题库id
      repoId: null
    }
  },
  computed: {
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
      queryReposByPage(this.queryParam).then((res) => {
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
      this.queryParam.name = null
      this.queryPage()
    },

    // 点击添加记录
    handleCreate() {
      // 表单是添加状态
      this.formType = 0
      // 将空数据置入form
      this.form = {
        id: null,
        name: null,
        isOpen: 0,
        remark: null
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
        name: row.name,
        isOpen: row.isOpen,
        remark: row.remark
      }
      // 显示表单框
      this.dialogFormVisible = true
    },

    // 添加和更新的提交表单
    submitForm() {
      if (this.formType === 0) {
        // 添加记录
        addRepo(this.form).then((res) => {
          if (res.status === 200) {
            this.$message.success('添加记录成功')
            // 跳转到末尾
            getRepoCount().then((res) => {
              this.recordTotal = res.data
              this.queryParam.page = Math.ceil(
                this.recordTotal / this.queryParam.limit
              )
              this.handleCurrentChange(this.queryParam.page)
            })
          } else {
            this.$message.error('添加记录失败')
          }
          this.dialogFormVisible = false // 关闭对话框
        })
      } else if (this.formType === 1) {
        // 更新记录
        updateRepo(this.form).then((res) => {
          if (res.status === 200) {
            this.$message.success('更新记录成功')
            this.queryPage()
          } else {
            this.$message.error('更新记录失败')
          }
          this.dialogFormVisible = false // 关闭对话框
        })
      }
    },

    // 删除记录
    handleDelete(row, index) {
      this.$confirm('确定要删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRepo(row).then((res) => {
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
        deleteRepos(items).then((res) => {
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

    // 点击章节管理
    handleChapter(row) {
      this.repoId = row.id
      this.drawerVisable = true
    }
  }
}
</script>

<style scoped>
/*1.显示滚动条：当内容超出容器的时候，可以拖动：*/
::v-deep .el-drawer__body {
   overflow: auto;
}
/*2.隐藏滚动条，太丑了*/
/* ::v-deep .el-drawer__container ::-webkit-scrollbar{
    display: none;
} */
</style>
