<template>
  <div class="app-container">
    <el-row :gutter="24">

      <!-- 倒计时+交卷 -->
      <el-col :span="24">
        <el-card style="margin-bottom: 10px">
          距离考试结束还有：<span
            style="color: #ff0000"
          >{{ min }}分钟{{ sec }}秒</span>
          <el-button
            style="float: right; margin-top: -10px"
            type="primary"
            icon="el-icon-plus"
            :loading="loading"
            @click="handlerCommit"
          >交卷</el-button>
        </el-card>
      </el-col>

      <!-- 答题卡 -->
      <el-col :span="6" :xs="24" style="margin-bottom: 10px">
        <el-card>
          <p class="card-title">答题卡</p>
          <el-row :gutter="24" class="card-line" style="padding-left: 10px">
            <el-tag type="info">未作答</el-tag>
            <el-tag type="success">已作答</el-tag>
          </el-row>

          <div v-for="(classQus,index) in questionList" :key="index">
            <div v-if="classQus != null && classQus.length > 0">
              <p class="card-title">{{ answerCardTitle(index) }}</p>
              <el-row :gutter="24" class="card-line">
                <el-tag
                  v-for="item in classQus"
                  :key="item.id"
                  :type="answerCardClass(index, item.questionId, item.answer, item.options)"
                  @click="handleNumber(item)"
                >
                  {{ item.orderNum }}
                </el-tag>
              </el-row>
            </div>
          </div>

        </el-card>
      </el-col>

      <!-- 题目主体 -->
      <el-col :span="18" :xs="24">
        <el-card class="qu-content">

          <!-- 题型和分数 -->
          <p v-if="curQuestion.type != null">
            <b>{{ curQuestion.type }}（本题分值：{{ curQuestion.score }}分）</b>
          </p>

          <!-- 题目内容 -->
          <p v-if="curQuestion.content != null">
            {{ curQuestion.orderNum }}.{{ curQuestion.content }}
          </p>

          <!-- 题目图片 -->
          <p v-if="curQuestion.image != null">
            <el-image :src="curQuestion.image" style="height: 100px" />
          </p>

          <!-- 单选题 -->
          <div v-if="curQuestion.type === '单选题'">
            <el-radio-group v-model="radioValue">
              <el-radio
                v-for="(option, index) in curQuestion.options"
                :key="option.id"
                :label="option.id"
                :class="radioValue === option.id ? 'optionIsChecked' : 'optionNotChecked'"
              >
                {{ String.fromCharCode(65 + index) }}.{{ option.content }}
                <div v-if="option.image != null" style="clear: both">
                  <el-image :src="option.image" style="height: 100px" />
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 多选题 -->
          <div v-if="curQuestion.type === '多选题'">
            <el-checkbox-group v-model="checkValue">
              <el-checkbox
                v-for="(option, index) in curQuestion.options"
                :key="option.id"
                :label="option.id"
                :class="checkValue.includes(option.id) ? 'optionIsChecked' : 'optionNotChecked'"
              >
                {{ String.fromCharCode(65 + index) }}.{{ option.content }}
                <div v-if="option.image != null" style="clear: both">
                  <el-image :src="option.image" style="height: 100px" />
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 判断题 -->
          <div v-if="curQuestion.type === '判断题'">
            <el-radio-group v-model="questionList[2][curQuestion.orderNum - 1].answer">
              <el-radio
                label="true"
                :class="questionList[2][curQuestion.orderNum - 1].answer == 'true' ? 'optionIsChecked' : 'optionNotChecked'"
              >正确</el-radio>
              <el-radio
                label="false"
                :class="questionList[2][curQuestion.orderNum - 1].answer == 'false' ? 'optionIsChecked' : 'optionNotChecked'"
              >错误</el-radio>
            </el-radio-group>
          </div>

          <!-- 填空题 -->
          <div v-if="curQuestion.type === '填空题'">
            <el-input v-model="questionList[3][curQuestion.orderNum - 1].answer" placeholder="请输入您的答案" />
          </div>

          <!-- 简答题 -->
          <div v-if="curQuestion.type === '简答题'">
            <el-input v-model="questionList[4][curQuestion.orderNum - 1].answer" type="textarea" :rows="10" placeholder="请输入您的答案" />
          </div>

          <!-- 切换 -->
          <div style="margin-top: 20px">
            <el-button v-if="showPrevious" type="primary" icon="el-icon-back" @click="handlePrevious()">
              上一题
            </el-button>
            <el-button v-if="showNext" type="warning" icon="el-icon-right" @click="handleNext()">
              下一题
            </el-button>
          </div>

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Vue from 'vue'
import { getExamInfo, getQuestion, saveAnswer, commitPaper } from '@/api/student/exam'
export default {
  name: 'ExamRun',
  data() {
    return {
      // 学生考试id
      studentExamId: null,
      // 等待
      loading: false,
      // 考试信息
      examInfo: null,
      // 回答列表
      questionList: [
        [
          {
            id: null,
            type: null,
            questionId: null,
            orderNum: null,
            score: null,
            isAnswered: null,
            answer: null,
            options: [
              {
                id: null,
                studentQuestionId: null,
                optionId: null,
                isChecked: 0,
                orderNum: null,
                abc: null
              }
            ]
          }
        ], [], [], [], []
      ],
      // 当前问题
      curQuestion: {
        questionId: null,
        type: null,
        content: null,
        image: null,
        options: [],
        orderNum: null
      },
      // 剩余考试时间
      leftSeconds: 0,
      // 单选值
      radioValue: null,
      // 多选值
      checkValue: [],
      // 分
      min: '00',
      // 秒
      sec: '00'
    }
  },
  computed: {
    // 展示上一题
    showPrevious() {
      // 获取第一题
      const item = this.getFirstQuestion()
      if (this.curQuestion.questionId === item.questionId) {
        return false
      }
      return true
    },

    // 展示下一题
    showNext() {
      // 获取最后一题
      const item = this.getLastQuestion()
      if (this.curQuestion.questionId === item.questionId) {
        return false
      }
      return true
    }
  },
  watch: {
    // 监听单选值
    radioValue: {
      handler() {
        // 遍历options
        const questionIndex = this.getQuestionIndex()
        const options = this.questionList[0][questionIndex].options
        for (let i = 0; i < options.length; i++) {
          if (options[i].optionId === this.radioValue) {
            options[i].isChecked = 1
          } else {
            options[i].isChecked = 0
          }
        }
      }
    },

    // 监听多选值
    checkValue: {
      handler() {
        // 遍历options
        const questionIndex = this.getQuestionIndex()
        const options = this.questionList[1][questionIndex].options
        for (let i = 0; i < options.length; i++) {
          if (this.checkValue.includes(options[i].optionId)) {
            options[i].isChecked = 1
          } else {
            options[i].isChecked = 0
          }
        }
      }
    }
  },
  created() {
    this.studentExamId = this.$route.params.studentExamId
    if (this.studentExamId != null) {
      // 获取问题列表
      getExamInfo({ studentExamId: this.studentExamId }).then((res) => {
        if (res.status === 200) {
          const data = res.data
          // 考试信息
          this.examInfo = data.examInfo
          // 问题列表
          this.questionList = data.questionList

          this.leftSeconds = data.leftSeconds

          // 获取第一个问题
          const item = this.getFirstQuestion()
          this.fetchQuestion(item.questionId)

          // 开始计时
          this.countdown()
        }
      })
    }
  },
  methods: {
    // 倒计时
    countdown() {
      const leftSeconds = this.leftSeconds

      // 强制交卷
      if (leftSeconds < 0) {
        this.commitPaper()
        return
      }

      // 时
      const min = parseInt((leftSeconds / 60) % 60)
      const sec = parseInt(leftSeconds % 60)

      this.min = min > 9 ? min : '0' + min
      this.sec = sec > 9 ? sec : '0' + sec
      const that = this
      this.leftSeconds -= 1
      setTimeout(function() {
        that.countdown()
      }, 1000)
    },

    // 答题卡标题
    answerCardTitle(index) {
      switch (index) {
        case 0: return '单选题'
        case 1: return '多选题'
        case 2: return '判断题'
        case 3: return '填空题'
        case 4: return '简答题'
      }
      return null
    },

    // 答题卡样式
    answerCardClass(index, questionId, answer, options) {
      if (this.curQuestion == null) return

      if (questionId === this.curQuestion.questionId) {
        return 'warning'
      }

      if (index === 0 || index === 1) {
        let flag = false
        for (let i = 0; i < options.length; i++) {
          if (options[i].isChecked === 1) {
            flag = true
            break
          }
        }
        if (flag === true) return 'success'
        else return 'info'
      } else {
        if (answer != null && answer.length > 0) return 'success'
        else return 'info'
      }
    },

    // 获取第一个问题
    getFirstQuestion() {
      let item = null
      for (let i = 0; i < 5; i++) {
        if (this.questionList[i].length > 0) {
          item = this.questionList[i][0]
          break
        }
      }
      return item
    },

    // 获取最后一个问题
    getLastQuestion() {
      let item = null
      for (let i = 4; i >= 0; i--) {
        if (this.questionList[i].length > 0) {
          item = this.questionList[i][this.questionList[i].length - 1]
          break
        }
      }
      return item
    },

    // 获取问题
    fetchQuestion(questionId) {
      getQuestion({ paperId: this.examInfo.paperId, questionId: questionId }).then(res => {
        if (res.status === 200) {
          // 放置
          this.curQuestion = res.data
          // 初始化选项
          const questionIndex = this.getQuestionIndex()
          if (this.curQuestion.type === '单选题') {
            const options = this.questionList[0][questionIndex].options
            for (let i = 0; i < options.length; i++) {
              if (options[i].isChecked === 1) {
                this.radioValue = options[i].optionId
              }
            }
          } else if (this.curQuestion.type === '多选题') {
            const options = this.questionList[1][questionIndex].options
            this.checkValue = []
            for (let i = 0; i < options.length; i++) {
              if (options[i].isChecked === 1) {
                this.checkValue.push(options[i].optionId)
              }
            }
          }
        }
      })
    },

    // 获取类型的索引
    getTypeIndex() {
      const type = this.curQuestion.type
      let index
      if (type === '单选题') index = 0
      else if (type === '多选题') index = 1
      else if (type === '判断题') index = 2
      else if (type === '填空题') index = 3
      else if (type === '简答题') index = 4
      return index
    },

    // 获取问题索引
    getQuestionIndex() {
      return this.curQuestion.orderNum - 1
    },

    // 保存当前回答
    saveCurAnswer(callback) {
      const typeIndex = this.getTypeIndex()
      const questionIndex = this.getQuestionIndex()

      // 获得回答项
      const item = this.questionList[typeIndex][questionIndex]
      // 获得学生问题id、答案和选项信息
      const questionId = item.id
      const answer = item.answer
      const options = item.options

      saveAnswer({ studentQuestionId: questionId, answer: answer, studentOptions: options }).then(res => {
        if (res.status === 200) {
          // 执行回调
          if (callback) {
            callback()
          }
        }
      })
    },

    // 点击题号
    handleNumber(item) {
      const that = this
      const fun = function() {
        that.fetchQuestion(item.questionId)
      }
      this.saveCurAnswer(fun)
    },

    // 下一题
    handleNext() {
      // 获取当前索引
      let typeIndex = this.getTypeIndex()
      let questionIndex = this.getQuestionIndex()
      // 获取下一个的索引
      questionIndex++
      while (questionIndex === this.questionList[typeIndex].length) {
        typeIndex++
        if (typeIndex === this.questionList.length) return false
        questionIndex = 0
      }
      // 获取item
      const item = this.questionList[typeIndex][questionIndex]
      // 加载
      this.handleNumber(item)
    },

    // 上一题
    handlePrevious() {
      // 获取当前索引
      let typeIndex = this.getTypeIndex()
      let questionIndex = this.getQuestionIndex()
      // 获取上一个索引
      questionIndex--
      while (questionIndex === -1) {
        typeIndex--
        if (typeIndex === -1) return false
        questionIndex = this.questionList[typeIndex].length - 1
      }
      // 获取item
      const item = this.questionList[typeIndex][questionIndex]
      // 加载
      this.handleNumber(item)
    },

    // 交卷
    commitPaper() {
      const that = this
      const fun = function() {
        // 提交试卷
        commitPaper({ studentExamId: that.studentExamId }).then(res => {
          if (res.status === 200) {
            that.$router.push({ name: 'ExamInfo', params: { studentExamId: that.studentExamId, showState: 1 }})
          }
        })
      }
      // 保存当前答案
      this.saveCurAnswer(fun)
    },

    // 点击交卷
    handlerCommit() {
      // 交卷
      this.$confirm('确定要交卷吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.commitPaper()
      })
    }
  }
}
</script>

<style scope>
.card-title{
  background: #eee;
  line-height: 35px;
  text-align: center;
  font-size: 14px;
}

.card-line{
  padding-left: 10px
}

.card-line span {
  cursor: pointer;
  margin: 2px;
}

.qu-content div{
  line-height: 30px;
}

.optionNotChecked {
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color:#606266;
}

.optionIsChecked {
  border-radius: 5px;
  border: 1px solid #409eff;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color:#409eff;
}

.el-checkbox-group label,.el-radio-group label{
  width: 100%;
}

.el-radio__label{
  line-height: 30px;
}

.el-checkbox__label{
  line-height: 30px;
}

/* .el-radio__inner{
  display: none;
}

.el-checkbox__inner{
  display: none;
} */

</style>
