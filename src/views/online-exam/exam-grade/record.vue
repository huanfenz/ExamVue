<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 学生列表 -->
      <el-select v-model="queryParam.studentId" v-permission="['admin']" placeholder="请选择学生">
        <el-option v-for="item in studentData" :key="item.id" :label="item.username" :value="item.id" />
      </el-select>
      <!-- 考试列表 -->
      <el-select v-model="queryParam.examId" placeholder="请选择考试">
        <el-option v-for="item in examData" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <!-- 是否完成 -->
      <el-select v-model="queryParam.isFinished" placeholder="是否完成">
        <el-option label="考试中" :value="0" />
        <el-option label="考试完成" :value="1" />
      </el-select>
      <!-- 是否批改 -->
      <el-select v-model="queryParam.isChecked" placeholder="是否批改">
        <el-option label="等待批改主观题" :value="0" />
        <el-option label="批改完成" :value="1" />
      </el-select>
      <!-- 是否及格 -->
      <el-select v-model="queryParam.isQualify" placeholder="是否及格">
        <el-option label="不及格" :value="0" />
        <el-option label="及格" :value="1" />
      </el-select>
      <!-- 考试开始结束时间 -->
      <!-- <el-date-picker
        v-model="timeValue"
        type="datetimerange"
        range-separator="至"
        start-placeholder="考试开始时间"
        end-placeholder="考试结束时间"
      /> -->
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
        v-permission="['admin']"
        class="filter-item"
        style="margin-left: 10px"
        type="danger"
        icon="el-icon-delete"
        @click="handleDeleteSome"
      >
        批量删除
      </el-button>
    </div>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>

      <el-table-column fixed type="selection" width="55" align="center" />

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column prop="studentName" label="学生姓名" align="center" />

      <el-table-column
        label="考试名"
        align="center"
        width="300"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-link type="primary" @click="handleDetail(scope.row)">{{
            scope.row.examName
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column prop="isFinished" label="是否完成" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.isFinished === 0" style="color: red">考试中</span>
          <span v-else style="color: green">考试完成</span>
        </template>
      </el-table-column>

      <el-table-column prop="score" label="考试得分" align="center" />

      <el-table-column prop="isChecked" label="是否批改" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.isChecked === 0" style="color: orange">等待批改主观题</span>
          <span v-else style="color: green">批改完成</span>
        </template>
      </el-table-column>

      <el-table-column prop="qualifyScore" label="及格分数" align="center" />

      <el-table-column prop="isQualify" label="是否及格" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.isQualify === 0" style="color: red">不及格</span>
          <span v-else style="color: green">及格</span>
        </template>
      </el-table-column>

      <el-table-column prop="startTime" label="开考时间" align="center" />

      <el-table-column prop="finishTime" label="交卷时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.finishTime != null">{{ scope.row.finishTime }}</span>
          <span v-else>等待交卷</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" :width="roleIsAdmin ? 350 : 150" align="center">
        <template slot-scope="scope">
          <el-button
            v-permission="['admin']"
            type="primary"
            size="small"
            :disabled="!scope.row.isFinished"
            @click="handleCheck(scope.row)"
          >批改试卷</el-button>
          <el-button
            type="success"
            size="small"
            :disabled="!scope.row.isFinished"
            @click="handleDetail(scope.row)"
          >查看试卷答题情况</el-button>
          <el-button
            v-permission="['admin']"
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
import { mapGetters } from 'vuex'
import permission from '@/directive/permission/index.js'
import waves from '@/directive/waves' // waves directive

import {
  queryUsers
} from '@/api/admin/user'

import {
  queryExams
} from '@/api/admin/exam'

import {
  queryRecordByPage,
  deleteRecord,
  deleteRecords
} from '@/api/admin/record'

import {
  queryRecordByPageByStudent
} from '@/api/student/record'

export default {
  name: 'GradeList',
  directives: { waves, permission },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 学生数据
      studentData: [],
      // 考试数据
      examData: [],
      // 记录总数
      recordTotal: 0,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        studentId: null,
        examId: null,
        isFinished: null,
        isQualify: null,
        isChecked: null,
        startTime: null,
        endTime: null
      },
      // 时间值
      timeValue: [],
      // 考试id
      examId: null
    }
  },
  computed: {
    // 获得user信息
    ...mapGetters(['id', 'roles']),
    roleIsAdmin() {
      if (this.roles[0] === 'admin') return true
      else return false
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
    if (this.roleIsAdmin) {
      // 获取学生信息
      queryUsers().then(res => {
        if (res.status === 200) {
          this.studentData = res.data
        }
      })
    }
    // 获取考试信息
    queryExams().then(res => {
      if (res.status === 200) {
        this.examData = res.data
      }
    })
    // 从服务器获取数据表格第一页的信息
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
      if (this.roleIsAdmin) {
        queryRecordByPage(this.queryParam).then((res) => {
          if (res.status === 200) {
            this.tableData = res.data
            this.recordTotal = res.count
          }
        })
      } else {
        this.queryParam.studentId = this.id
        queryRecordByPageByStudent(this.queryParam).then((res) => {
          if (res.status === 200) {
            this.tableData = res.data
            this.recordTotal = res.count
          }
        })
      }
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
      this.queryParam.studentId = null
      this.queryParam.examId = null
      this.queryParam.isFinished = null
      this.queryParam.isQualify = null
      this.queryParam.isChecked = null
      this.queryParam.startTime = null
      this.queryParam.endTime = null
      this.timeValue = []
      this.queryPage()
    },

    // 处理批改试卷
    handleCheck(item) {
      // 带着studentExamId到ExamDetail页面
      this.$router.push({ name: 'ExamDetail', params: { studentExamId: item.id, myState: 1 }})
    },

    // 处理详情
    handleDetail(item) {
      // 带着studentExamId到ExamDetail页面
      this.$router.push({ name: 'ExamDetail', params: { studentExamId: item.id, myState: 0 }})
    },

    // 删除记录
    handleDelete(row, index) {
      this.$confirm('确定要删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRecord(row).then((res) => {
          if (res.status === 200) {
            this.$message.success('删除记录成功')
            this.tableData.splice(index, 1)
            // 如果删完了，获取上一页
            if (this.tableData.length === 0) {
              this.queryParam.page = this.queryParam.page - 1
              this.handleCurrentChange(this.queryParam.page)
            }
          } else {
            this.$message.error('删除记录失败')
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
        deleteRecords(items).then((res) => {
          if (res.status === 200) {
            this.$message.success('批量删除记录成功')
            if (this.tableData.length === items.length) {
              // 如果本页内容全部删光了
              // 当前页为上一页
              if (this.queryParam.page !== 0) {
                this.queryParam.page = this.queryParam.page - 1
              }
            }
            // 重载当前页
            this.handleCurrentChange(this.queryParam.page)
          } else {
            this.$message.error('批量删除记录失败')
          }
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
