<template>
  <div class="app-container">
    <el-row>
      <el-col :span="14" :offset="5">
        <el-card style="height: 450px">
          <div slot="header">
            <span>修改信息</span>
          </div>
          <el-row>
            <el-col :span="16">
              <!--普通表单-->
              <el-form ref="ruleForm" :model="form" label-width="80px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="form.username" />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                  <el-input v-model="form.password" />
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
          <div style="margin-top: 80px; float: right">
            <el-button @click="cancelAlert">取消修改</el-button>
            <el-button type="primary" @click="submitForm">保存修改</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserById, updateInfo } from '@/api/system/user'
export default {
  name: 'PersonInfo',
  data() {
    return {
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
    ...mapGetters(['id', 'name', 'roles', 'avatar'])
  },
  created() {
    getUserById(this.id).then(res => {
      if (res.status === 200) {
        this.form = res.data
      }
    })
  },
  methods: {
    // 添加和更新的提交表单
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) {
          this.$message.error('不允许提交，请检查必填项')
          return false
        }
        // 更新记录
        updateInfo(this.form).then((res) => {
          if (res.status === 200) {
            this.$message.success('修改个人信息成功')
            this.dialogFormVisible = false // 关闭对话框
            this.$store.state.user.avatar = this.form.profile
            this.$store.state.user.username = this.form.username
            this.$store.state.user.password = this.form.password
          } else {
            if (res.status === 501) this.$message.error(res.message)
            else this.$message.error('修改个人信息失败')
          }
        })
      })
    },

    cancelAlert() {
      getUserById(this.id).then(res => {
        if (res.status === 200) {
          this.form = res.data
        }
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
