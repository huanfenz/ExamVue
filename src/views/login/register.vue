<template>
  <div class="login-container">
    <el-form
      ref="registerForm"
      :model="registerForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <!-- 标题 -->
      <div class="title-container">
        <h3 class="title">在线考试系统-注册界面</h3>
      </div>
      <!-- 用户名 -->
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          placeholder="请输入用户名"
          name="username"
          type="text"
          tabindex="1"
        />
      </el-form-item>
      <!-- 密码 -->
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          ref="password"
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          name="password"
          tabindex="2"
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item prop="repeat">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          ref="repeat"
          v-model="registerForm.repeat"
          type="password"
          placeholder="请确认密码"
          name="repeat"
          tabindex="3"
        />
      </el-form-item>

      <!-- 验证码 -->
      <el-row>
        <el-col :span="16">
          <el-form-item prop="code">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              ref="code"
              v-model="registerForm.code"
              class="yuan"
              placeholder="请输入验证码"
              name="code"
              type="text"
              tabindex="3"
              @keyup.enter.native="handleRight"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <img :src="url" alt="加载失败" width="150px" height="50px" style="cursor:pointer; margin-top: 2px" @click="handleCheckCode">
        </el-col>
      </el-row>

      <!-- 登录按钮 -->
      <div style="height: 40px; margin-bottom: 30px">
        <el-button
          :loading="loading"
          type="primary"
          style="width: 48%; float: left"
          @click.native.prevent="handleRight"
        >确认</el-button>
        <el-button
          :loading="loading"
          type="success"
          style="width: 48%; float: right"
          @click.native.prevent="handleBack"
        >返回登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { register } from '@/api/system/user'
import {
  getCode
} from '@/api/system/user'
export default {
  name: 'Register',
  data() {
    const validateRepeat = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      url: null,
      registerForm: {
        username: '',
        password: '',
        repeat: '',
        key: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        repeat: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { trigger: 'blur', validator: validateRepeat }
        ],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      },
      loading: false
    }
  },
  created() {
    this.handleCheckCode()
  },
  methods: {
    // 切换验证码
    handleCheckCode() {
      getCode().then((res) => {
        this.registerForm.key = res.data.key
        this.url = res.data.img
      })
    },
    // 确定
    handleRight() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.loading = true
          register(this.registerForm).then((res) => {
            if (res.status === 200) { // 注册成功
              this.$message.success(res.message)
              // 跳回登录界面
              this.$router.push({
                path: '/login',
                query: {
                  username: this.registerForm.username,
                  password: this.registerForm.password
                }
              })
              this.loading = false
            } else { // 注册失败
              this.$message.error(res.message)
              // 刷新验证码
              this.handleCheckCode()
              this.loading = false
            }
          })
        } else {
          console.log('不允许提交!')
          return false
        }
      })
    },
    // 返回登录界面
    handleBack() {
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  .el-icon-arrow-up:before {
    content: '';
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
