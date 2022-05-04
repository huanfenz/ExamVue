<template>
  <div class="dashboard-container">
    <el-row style="line-height: 30px">
      <el-row :span="24">欢迎使用 在线考试系统</el-row>
      <el-row :span="24" style="font-size: 14px; color: #666">系统版本：1.0.0</el-row>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }
}
</script>

<style scoped>
.dashboard-container{
  margin: 20px;
  font-size: 24px;
}
</style>
