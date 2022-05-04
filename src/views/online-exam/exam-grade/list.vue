<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 学生列表 -->
      <el-select v-model="queryParam.studentId" placeholder="请选择学生">
        <el-option v-for="item in studentData" :key="item.id" :label="item.username" :value="item.id" />
      </el-select>
      <!-- 考试开始结束时间 -->
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

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>

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

      <el-table-column prop="startTime" label="考试开始时间" align="center" />

      <el-table-column prop="finishTime" label="考试结束时间" align="center" />

      <el-table-column prop="score" label="考试得分" align="center" />

      <el-table-column prop="isQualify" label="是否及格" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.isQualify === 1" style="color: green">是</span>
          <span v-else style="color: red">否</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="250" align="center">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="small"
            @click="handleDetail(scope.row)"
          >查看试卷详细情况</el-button>
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
  queryAllStudents
} from '@/api/admin/user'

import {
  queryGradePage
} from '@/api/student/grade'

export default {
  name: 'GradeList',
  directives: { waves },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 学生数据
      studentData: [],
      // 记录总数
      recordTotal: 0,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        studentId: null,
        startTime: null,
        endTime: null
      },
      // 时间值
      timeValue: [],
      // 考试id
      examId: null
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
    // 获取学生信息
    queryAllStudents().then(res => {
      if (res.status === 200) {
        this.studentData = res.data
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
      queryGradePage(this.queryParam).then((res) => {
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

    // 处理详情
    handleDetail(item) {
      // 带着studentExamId到ExamDetail页面
      this.$router.push({ name: 'ExamDetail', params: { studentExamId: item.id }})
    }
  }
}
</script>

<style scoped>
</style>
