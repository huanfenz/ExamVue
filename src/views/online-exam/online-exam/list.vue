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
    </div>

    <!--弹出框-->
    <el-dialog title="考试信息" :visible.sync="dialogVisible" width="30%">
      <p>考试名称：{{ curExam.name }}</p>
      <p>考试试卷：{{ curExam.paperName }}</p>
      <p>考试时长：{{ curExam.duration }} 分钟</p>
      <p v-if="curExam.limitTime === 1">开始时间：{{ curExam.startTime }}</p>
      <p v-if="curExam.limitTime === 1">结束时间：{{ curExam.endTime }}</p>
      <p>注意事项：{{ curExam.notice }}</p>
      <p v-if="curExam.privilege === 1">
        输入密码：<el-input v-model="curPassword" placeholder="请输入密码" style="width: 300px" />
      </p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitStart">确 定</el-button>
      </div>
    </el-dialog>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column
        label="考试名"
        align="center"
        width="300"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-link type="primary" @click="handleStart(scope.row)">{{
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

      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="small"
            @click="handleStart(scope.row)"
          >开始考试</el-button>
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
import { mapGetters } from 'vuex'
import { Loading } from 'element-ui'
import waves from '@/directive/waves' // waves directive
import {
  queryExamsByPage,
  checkPassword,
  createStudentExam
} from '@/api/student/exam'
export default {
  name: 'ExamList',
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
        startTime: null,
        endTime: null
      },
      // 弹出框显示
      dialogVisible: false,
      // 表单数据
      curExam: {
        id: null,
        name: null,
        paperName: null,
        duration: 0,
        limitTime: 0,
        startTime: null,
        endTime: null,
        notice: null,
        showState: 0,
        privilege: 0,
        password: ''
      },
      curPassword: null,
      timeValue: [],
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
    ...mapGetters(['id', 'name', 'roles', 'avatar']),
    // 表单标题
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
    }
  },
  // 创建后
  created() {
    // 从服务器获取数据表格第一页的信息
    // 默认page=1，size=10
    this.queryPage()
  },
  methods: {
    // 格式化日期时间
    getyyyyMMdd(d) {
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

    handleStart(row) {
      this.curExam = row
      this.dialogVisible = true
    },

    submitStart() {
      // 考试时间判断
      if (this.curExam.limitTime === 1) {
        const cur = new Date().getTime()
        const start = new Date(this.curExam.startTime).getTime()
        const end = new Date(this.curExam.endTime).getTime()
        if (cur < start) {
          this.$message.error('考试还没有开始')
          return
        }
        if (cur > end) {
          this.$message.error('考试已经结束了')
          return
        }
      }

      // 考试密码判断
      if (this.curExam.privilege === 1) {
        checkPassword({ examId: this.curExam.id, password: this.curPassword }).then(res => {
          if (res.status !== 200) {
            this.$message.error('考试密码错误')
            return
          } else {
            // 进入考试
            const that = this

            // 打开
            const loading = Loading.service({
              text: '正在努力创建试卷...',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 创建学生考试请求
            createStudentExam({ studentId: that.id, examId: that.curExam.id }).then(res => {
              if (res.status === 200) {
                this.$message({
                  message: '试卷创建成功，即将进入考试！',
                  type: 'success'
                })

                setTimeout(function() {
                  loading.close()
                  that.dialogVisible = false
                  that.$router.push({ name: 'RunExam', params: { studentExamId: res.data }})
                }, 1000)
              } else {
                this.$message.error(res.message)
                loading.close()
              }
            }).catch(() => {
              loading.close()
            })
          }
        })
      } else {
        // 进入考试
        const that = this

        // 打开
        const loading = Loading.service({
          text: '正在努力创建试卷...',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        // 创建学生考试请求
        createStudentExam({ studentId: that.id, examId: that.curExam.id }).then(res => {
          if (res.status === 200) {
            this.$message({
              message: '试卷创建成功，即将进入考试！',
              type: 'success'
            })

            setTimeout(function() {
              loading.close()
              that.dialogVisible = false
              that.$router.push({ name: 'RunExam', params: { studentExamId: res.data }})
            }, 1000)
          } else {
            this.$message.error(res.message)
            loading.close()
          }
        }).catch(() => {
          loading.close()
        })
      }
    }
  }
}
</script>

<style scoped>
</style>
