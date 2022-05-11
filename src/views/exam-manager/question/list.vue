<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 题库选择 -->
      <el-select
        v-model="queryParam.repoId"
        filterable
        placeholder="所属题库"
        clearable
        class="filter-item"
        style="width: 200px"
        @change="repoChange"
      >
        <el-option
          v-for="item in repoData"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <!-- 章节选择 -->
      <el-select
        v-model="queryParam.chapterId"
        filterable
        placeholder="所属章节"
        clearable
        class="filter-item"
        style="width: 200px"
      >
        <el-option
          v-for="item in chapterData"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <!-- 题目类型 -->
      <el-select
        v-model="queryParam.type"
        :disabled="son ? true : false"
        filterable
        placeholder="类型"
        clearable
        class="filter-item"
        style="width: 200px"
      >
        <el-option key="0" label="单选题" value="SINGLE" />
        <el-option key="1" label="多选题" value="MULTI" />
        <el-option key="2" label="判断题" value="JUDGE" />
        <el-option key="3" label="填空题" value="BLANK" />
        <el-option key="4" label="简答题" value="WRITE" />
      </el-select>
      <!-- 内容 -->
      <el-input
        v-model="queryParam.content"
        placeholder="内容"
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
        v-if="!son"
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="curQuestion = null; drawerVisable = true"
      >
        添加题目
      </el-button>
      <el-button
        v-if="!son"
        class="filter-item"
        style="margin-left: 10px"
        type="danger"
        icon="el-icon-delete"
        @click="handleDeleteSome"
      >
        批量删除
      </el-button>
      <el-button
        v-if="son"
        class="filter-item"
        style="margin-left: 10px;"
        type="success"
        icon="el-icon-check"
        @click="$emit('close-event', $refs.multipleTable.selection)"
      >
        确定添加
      </el-button>
      <el-button-group v-if="!son" class="filter-item" style="float:  right">
        <el-button icon="el-icon-upload2" @click="importVisible = true">导入</el-button>
        <el-button icon="el-icon-download" @click="myExport">导出</el-button>
      </el-button-group>
    </div>

    <!-- 抽屉框，题目编辑表单 -->
    <el-drawer
      :title="curQuestion == null ? '增加题目' : '修改题目'"
      :visible.sync="drawerVisable"
      size="60%"
      :wrapper-closable="false"
      :destroy-on-close="true"
    >
      <questionForm
        v-if="drawerVisable"
        :cur-question="curQuestion"
        @close-event="drawerVisable = false; queryPage()"
      />
    </el-drawer>

    <!-- 导入框 -->
    <el-dialog
      title="导入试题"
      :visible.sync="importVisible"
      width="30%"
    >
      <el-row>
        <el-button type="warning" @click="downloadImport">下载导入模板</el-button>
        <el-upload
          class="upload-demo"
          drag
          action="http://localhost:8093/system/upload/uploadExcel"
          multiple
          align="center"
          style="margin-top: 30px"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-row>

    </el-dialog>

    <!--数据表格-->
    <el-table ref="multipleTable" :data="tableData" border>
      <el-table-column type="selection" fixed width="55" align="center" />

      <el-table-column v-if="!son" prop="id" label="序号" align="center" />

      <el-table-column prop="content" label="内容" align="center" width="600" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-link v-if="!son" type="primary" @click="handleUpdate(scope.row)">{{
            scope.row.content
          }}</el-link>
          <span v-else style="color: #409eff">{{ scope.row.content }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="类型" align="center" />

      <el-table-column prop="repoName" label="所属题库" align="center" />

      <el-table-column prop="chaperName" label="所属章节" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.chapterId != null">{{ scope.row.chapterName }}</span>
          <span v-else>未分配章节</span>
        </template>
      </el-table-column>

      <el-table-column v-if="!son" prop="createTime" label="创建时间" align="center" />

      <el-table-column v-if="!son" prop="updateTime" label="更新时间" align="center" />

      <el-table-column v-if="!son" fixed="right" label="操作" width="150" align="center">
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
  queryQuestionsByPage,
  removeQuestion,
  removeQuestions,
  exportExcel
} from '@/api/admin/question'
import {
  queryRepos
} from '@/api/admin/repo'
import {
  queryChapters
} from '@/api/admin/chapter'
import questionForm from './questionForm.vue'

export default {
  name: 'QuestionList',
  components: { questionForm },
  directives: { waves },
  props: {
    son: {
      type: Boolean,
      required: false,
      default: false
    },
    typeId: {
      type: Number,
      required: false,
      default: null
    },
    excludeIdList: {
      type: Array,
      required: false,
      default: null
    }
  },
  data() {
    return {
      // 表格数据
      tableData: [],
      // 记录总数
      recordTotal: 0,
      // 题库数据
      repoData: [],
      // 章节数据
      chapterData: [],
      // 抽屉框显示
      drawerVisable: false,
      // 导入框显示
      importVisible: false,
      // 查询参数
      queryParam: {
        page: 1,
        limit: 10,
        repoId: null,
        chapterId: null,
        type: null,
        content: null,
        excludeIdList: null
      },
      // 当前问题
      curQuestion: null
    }
  },
  // 创建后
  created() {
    if (this.son) {
      // 确定类型
      let type = null
      if (this.son) {
        switch (this.typeId) {
          case 0:
            type = 'SINGLE'
            break
          case 1:
            type = 'MULTI'
            break
          case 2:
            type = 'JUDGE'
            break
          case 3:
            type = 'BLANK'
            break
          case 4:
            type = 'WRITE'
            break
        }
        this.queryParam.type = type
      }
      // 确定排除
      this.queryParam.excludeIdList = this.excludeIdList
    }

    // 从服务器获取数据表格第一页的信息，默认page=1，size=10
    this.queryPage()

    // 从服务器获得题库信息
    queryRepos().then((res) => {
      this.repoData = res.data
    })
  },
  methods: {
    // 查询分页
    queryPage() {
      queryQuestionsByPage(this.queryParam).then((res) => {
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
      this.queryParam.repoId = null
      this.queryParam.chapterId = null
      if (!this.son) this.queryParam.type = null
      this.queryParam.content = null
      this.queryPage()
    },

    // 删除记录
    handleDelete(row, index) {
      this.$confirm('确定要删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeQuestion(row).then((res) => {
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
        removeQuestions(items).then((res) => {
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

    // 题库改变
    repoChange() {
      this.queryParam.chapterId = null
      if (this.queryParam.repoId == null || this.queryParam.repoId === '') {
        this.chapterData = null
      } else {
        queryChapters({ repoId: this.queryParam.repoId }).then((res) => {
          this.chapterData = res.data
        })
      }
    },

    // 修改
    handleUpdate(row) {
      this.curQuestion = row
      this.drawerVisable = true
    },

    // 导出
    myExport() {
      let newType = null
      if (this.queryParam.type === 'SINGLE') {
        newType = '单选题'
      } else if (this.queryParam.type === 'MULTI') {
        newType = '多选题'
      } else if (this.queryParam.type === 'JUDGE') {
        newType = '判断题'
      } else if (this.queryParam.type === 'BLANK') {
        newType = '填空题'
      } else if (this.queryParam.type === 'WRITE') {
        newType = '简答题'
      }
      const data = {
        repoId: this.queryParam.repoId,
        chapterId: this.queryParam.chapterId,
        type: newType,
        content: this.queryParam.content
      }
      // 导出到Excel
      exportExcel(data).then(res => {
        if (res.status === 200) {
          this.$message.success('导出成功')
          window.open(res.data)
        }
      })
    },

    downloadImport() {
      window.open('https://wangpeng-imgsubmit.oss-cn-hangzhou.aliyuncs.com/Exam/%E9%A2%98%E7%9B%AE%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx')
    },

    handleUploadSuccess() {
      // 上传成功
      this.$message.success('导入成功！')
      this.importVisible = false
      this.queryPage()
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
