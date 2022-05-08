<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 考试名 -->
      <el-input
        v-model="queryParam.name"
        placeholder="考试名"
        style="width: 200px"
        class="filter-item"
      />
      <el-date-picker
        v-model="timeValue"
        type="datetimerange"
        range-separator="至"
        start-placeholder="考试开始时间"
        end-placeholder="考试结束时间"
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
        添加考试
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
    <el-drawer :title="formTitle" :visible.sync="drawerVisable" size="50%" :wrapper-closable="false">
      <!--普通表单-->
      <!-- name\duration\limitTime\startTime\endTime\notice\privilege\password -->
      <el-form ref="myForm" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="考试试卷" prop="paperId">
          <el-select v-model="form.paperId" :disabled="formType === 1" placeholder="请选择试卷">
            <el-option v-for="item in paperData" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="duration">
          <el-input v-model="form.duration" type="number" />
        </el-form-item>
        <el-form-item label="限制考试时间">
          <el-switch
            v-model="form.limitTime"
            inactive-text="关闭"
            active-text="开启"
            :inactive-value="0"
            :active-value="1"
          />
        </el-form-item>
        <el-form-item v-if="form.limitTime == 1" label="考试时间设置">
          <el-date-picker
            v-model="timeValue1"
            type="datetimerange"
            range-separator="至"
            start-placeholder="考试开始时间"
            end-placeholder="考试结束时间"
          />
        </el-form-item>
        <el-form-item label="注意事项" prop="notice">
          <el-input v-model="form.notice" type="textarea" />
        </el-form-item>

        <el-form-item label="考试权限" prop="privilege">
          <el-radio v-model="form.privilege" :label="0">完全开放</el-radio>
          <el-radio v-model="form.privilege" :label="1">需要输入密码</el-radio>
        </el-form-item>

        <el-form-item v-if="form.privilege === 1" label="考试密码" prop="password">
          <el-input v-model="form.password" />
        </el-form-item>

        <div style="margin-left: 30px">
          <el-button @click="drawerVisable = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </el-form>
    </el-drawer>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>
      <el-table-column fixed type="selection" width="55" align="center" />

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column
        label="考试名"
        align="center"
        width="300"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-link type="primary" @click="handleUpdate(scope.row)">{{
            scope.row.name
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column prop="paperName" label="所用试卷" align="center" />

      <el-table-column prop="duration" label="考试时长" align="center" />

      <el-table-column prop="startTime" label="考试开始时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.limitTime === 0">不限制考试时间</span>
          <span v-else>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="endTime" label="考试结束时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.limitTime === 0">不限制考试时间</span>
          <span v-else>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="privilege" label="考试权限" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.privilege === 0" style="color: green">完全开放</span>
          <span v-else style="color: red">需要密码</span>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center" />

      <el-table-column prop="updateTime" label="更新时间" align="center" />

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
import waves from '@/directive/waves' // waves directive
import {
  getExamCount,
  queryExamsByPage,
  addExam,
  deleteExam,
  deleteExams,
  updateExam
} from '@/api/admin/exam'
import {
  queryPapers
} from '@/api/admin/paper'
export default {
  name: 'ExamList',
  directives: { waves },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 试卷数据
      paperData: [],
      // 记录总数
      recordTotal: 0,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        startTime: null,
        endTime: null
      },
      // 抽屉框显示
      drawerVisable: false,
      // 表单类型（添加数据:0,修改数据:1）
      formType: 0,
      // 表单数据
      form: {
        id: null,
        name: null,
        duration: 0,
        limitTime: 0,
        startTime: null,
        endTime: null,
        notice: null,
        privilege: 0,
        password: ''
      },
      timeValue: [],
      timeValue1: [],
      rules: {
        paperId: [{ required: true, message: '请选择考试试卷', trigger: 'blur' }],
        name: [{ required: true, message: '请输入考试名', trigger: 'blur' }],
        duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }]
      },
      // 考试id
      examId: null
    }
  },
  computed: {
    // 通过表单类型计算表单标题
    formTitle() {
      return this.formType === 0 ? '添加记录' : '修改记录'
    }
  },
  watch: {
    timeValue: {
      handler() {
        this.queryParam.startTime = this.getyyyyMMdd(this.timeValue[0])
        this.queryParam.endTime = this.getyyyyMMdd(this.timeValue[1])
      }
    },
    timeValue1: {
      handler() {
        this.form.startTime = this.getyyyyMMdd(this.timeValue1[0])
        this.form.endTime = this.getyyyyMMdd(this.timeValue1[1])
      }
    }
  },
  // 创建后
  created() {
    // 获取试卷信息
    queryPapers().then(res => {
      if (res.status === 200) {
        this.paperData = res.data
      }
    })
    // 从服务器获取数据表格第一页的信息
    // 默认page=1，size=10
    this.queryPage()
  },
  methods: {
    // 格式化日期时间
    getyyyyMMdd(d) {
      if (d == null) return null
      const year = d.getFullYear()
      let month = d.getMonth() + 1
      let day = d.getDate()
      let hour = d.getHours()
      let minute = d.getMinutes()
      let second = d.getSeconds()

      String(month).length < 2 ? (month = '0' + month) : month
      String(day).length < 2 ? (day = '0' + day) : day
      String(hour).length < 2 ? (hour = '0' + hour) : hour
      String(minute).length < 2 ? (minute = '0' + minute) : minute
      String(second).length < 2 ? (second = '0' + second) : second

      const res = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
      return res
    },

    // 查询分页
    queryPage() {
      queryExamsByPage(this.queryParam).then((res) => {
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
      this.queryParam.startTime = null
      this.queryParam.endTime = null
      this.timeValue = []
      this.queryPage()
    },

    // 点击添加记录
    handleCreate() {
      // 表单是添加状态
      this.formType = 0
      // 将空数据置入form
      this.form = {
        id: null,
        paperId: null,
        name: null,
        duration: 0,
        limitTime: 0,
        startTime: null,
        endTime: null,
        notice: null,
        privilege: 0,
        password: ''
      }
      // 显示表单框
      this.drawerVisable = true
    },

    // 点击修改记录
    handleUpdate(row) {
      // 表单是修改状态
      this.formType = 1
      // 将行数据置入form
      this.form = {
        id: row.id,
        paperId: row.paperId,
        name: row.name,
        duration: row.duration,
        limitTime: row.limitTime,
        startTime: row.startTime,
        endTime: row.endTime,
        notice: row.notice,
        privilege: row.privilege,
        password: row.password
      }
      // 放置时间
      this.timeValue1[0] = new Date(this.form.startTime)
      this.timeValue1[1] = new Date(this.form.endTime)
      // 显示表单框
      this.drawerVisable = true
    },

    // 添加和更新的提交表单
    submitForm() {
      this.$refs.myForm.validate((valid) => {
        if (!valid) {
          this.$message.error('不允许提交，请检查必填项')
          return false
        } else {
          if (this.form.duration <= 0) {
            this.$message.error('考试时长应该大于0')
            return false
          }
          // 判断考试时间是否合理
          if (this.form.limitTime === 1) {
            const a = this.timeValue1[0].getTime()
            const b = this.timeValue1[1].getTime()
            const c = (b - a) / 1000 / 60
            console.log(c)
            if (c < this.form.duration) {
              this.$message.error('考试时间的范围应该大于考试时长')
              return false
            }
          }

          if (this.formType === 0) {
            // 添加记录
            addExam(this.form).then((res) => {
              if (res.status === 200) {
                this.$message.success('添加记录成功')
                // 跳转到末尾
                getExamCount().then((res) => {
                  this.recordTotal = res.data
                  this.queryParam.page = Math.ceil(
                    this.recordTotal / this.queryParam.limit
                  )
                  this.handleCurrentChange(this.queryParam.page)
                })
              } else {
                this.$message.error('添加记录失败')
              }
              this.drawerVisable = false // 关闭对话框
            })
          } else if (this.formType === 1) {
            // 更新记录
            updateExam(this.form).then((res) => {
              if (res.status === 200) {
                this.$message.success('更新记录成功')
                this.queryPage()
              } else {
                this.$message.error('更新记录失败')
              }
              this.drawerVisable = false // 关闭对话框
            })
          }
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
        deleteExam(row).then((res) => {
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
        deleteExams(items).then((res) => {
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
