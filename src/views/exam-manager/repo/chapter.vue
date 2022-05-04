<template>
  <div class="app-container">
    <!-- 顶部功能 -->
    <div class="filter-container" style="margin-bottom: 15px">
      <!-- 一些按钮 -->
      <el-button icon="el-icon-back" @click="$emit('close-event')">返 回</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleAdd"
      >添 加</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="success"
        icon="el-icon-check"
        @click="handleSave"
      >保 存</el-button>
    </div>

    <!-- 表格 -->
    <el-table ref="multipleTable" :data="tableData" border>

      <el-table-column type="index" label="序号" width="55" align="center" />

      <el-table-column prop="name" label="章节名" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.$index].name" />
        </template>
      </el-table-column>

      <el-table-column prop="questionCount" label="题目数量" width="100" align="center" />

      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button type="success" size="small" icon="el-icon-top" circle @click="handleUp(scope.$index, scope.row)" />
          <el-button type="primary" size="small" icon="el-icon-bottom" circle @click="handleDown(scope.$index, scope.row)" />
          <el-button type="danger" size="small" icon="el-icon-delete" circle @click="handleRemove(scope.$index, scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Vue from 'vue'
import waves from '@/directive/waves' // waves directive
import {
  queryChapters,
  saveChapters
} from '@/api/admin/chapter'

export default {
  name: 'Chapter',
  directives: { waves },
  props: {
    repoId: {
      type: Number,
      required: true,
      default: 1
    }
  },
  data() {
    return {
      // 表格数据
      tableData: []
    }
  },
  // 创建后
  created() {
    // 从服务器获取数据
    this.queryAll()
  },
  methods: {
    // 查询
    queryAll() {
      queryChapters({ repoId: this.repoId }).then((res) => {
        if (res.status === 200) {
          this.tableData = res.data
        }
      })
    },

    // 点击添加
    handleAdd() {
      const row = {
        id: null,
        repoId: this.repoId,
        name: null,
        questionCount: 0
      }
      this.tableData.push(row)
    },

    // 点击移除
    handleRemove(index, row) {
      if (row.questionCount !== 0) {
        this.$confirm('参照该章节的题目的章节属性将被置空，确认要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tableData.splice(index, 1)
        })
      } else {
        this.tableData.splice(index, 1)
      }
    },

    // 上移记录
    handleUp(index, row) {
      // 上限处理
      if (index === 0) {
        this.$message.warning('已经是第一行了，不能上移')
        return
      }
      // 交换上一行和当前行
      const temp = this.tableData[index - 1]
      Vue.set(this.tableData, index - 1, this.tableData[index])
      Vue.set(this.tableData, index, temp)
      this.$message.success('上移成功')
    },

    // 下移记录
    handleDown(index, row) {
      // 下限处理
      if (index === (this.tableData.length - 1)) {
        this.$message.warning('已经是最后一行了，不能下移')
        return
      }
      // 交换下一行和当前行
      const temp = this.tableData[index + 1]
      Vue.set(this.tableData, index + 1, this.tableData[index])
      Vue.set(this.tableData, index, temp)
      this.$message.success('下移成功')
    },

    // 点击保存
    handleSave() {
      // 把tableData传给服务器
      saveChapters(this.tableData).then(res => {
        if (res.status === 200) {
          this.$message.success('保存成功')
          this.$emit('close-event')
        } else {
          this.$message.error('保存失败')
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
