<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 试卷名 -->
      <el-input
        v-model="queryParam.name"
        placeholder="试卷名"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- 创建人 -->
      <el-select
        v-model="queryParam.creator"
        filterable
        placeholder="创建人"
        clearable
        class="filter-item"
        style="width: 200px"
      >
        <el-option
          v-for="item in userData"
          :key="item.id"
          :label="item.username"
          :value="item.id"
        />
      </el-select>
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
        @click="$router.push({ name: 'PaperForm', params: { id: null }})"
      >
        添加试卷
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

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>
      <el-table-column fixed type="selection" width="55" align="center" />

      <el-table-column prop="id" label="序号" align="center" />

      <el-table-column prop="name" label="试卷名" align="center">
        <template slot-scope="scope">
          <el-link type="primary" @click="$router.push({ name: 'PaperForm', params: { id: scope.row.id }})">{{
            scope.row.name
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column prop="creatorName" label="创建人" align="center" />

      <el-table-column prop="questionCount" label="题目数量" align="center" />

      <el-table-column prop="totalScore" label="总分" align="center" />

      <el-table-column prop="qualifyScore" label="及格分" align="center" />

      <el-table-column prop="createTime" label="创建时间" align="center" />

      <el-table-column prop="updateTime" label="更新时间" align="center" />

      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="$router.push({ name: 'PaperForm', params: { id: scope.row.id }})"
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
  // getPaperCount,
  // queryPapers,
  queryPapersByPage,
  // addPaper,
  removePaper,
  removePapers
  // updatePaper
} from '@/api/admin/paper'
import { queryUsers } from '@/api/admin/user'

export default {
  name: 'PaperList',
  directives: { waves },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 记录总数
      recordTotal: 0,
      // 用户数据
      userData: [],
      // 抽屉框显示
      // drawerVisable: false,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        name: null,
        creator: null
      },
      // 当前操作的试卷id
      paperId: null
    }
  },
  // 创建后
  created() {
    // 从服务器获取数据表格第一页的信息
    // 默认page=1，size=10
    this.queryPage()
    // 从服务器获得用户信息
    queryUsers().then((res) => {
      this.userData = res.data
    })
  },
  methods: {
    // 查询分页
    queryPage() {
      queryPapersByPage(this.queryParam).then((res) => {
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
      // 清空
      this.queryParam.name = null
      this.queryParam.creator = null
      this.queryPage()
    },

    // 删除记录
    handleDelete(row, index) {
      this.$confirm('确定要删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removePaper(row).then((res) => {
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
        removePapers(items).then((res) => {
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
</style>
