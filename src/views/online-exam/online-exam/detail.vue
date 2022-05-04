<template>
  <div>
    <!-- 修改弹出框 -->
    <el-dialog title="修改得分" :visible.sync="dialogVisible" width="300px">
      <el-input v-model="newScore" type="number" max="100" min="0" placeholder="修改得分" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitnewScore">确 定</el-button>
      </div>
    </el-dialog>
    <div style="margin: 20px; float: right">
      <el-button type="primary" @click="$router.push({ name: 'ExamRecord' })">返回列表</el-button>
      <el-button v-if="myState === 1" type="success" @click="handlerCheck">完成批改</el-button>
    </div>
    <div class="exam-name">{{ examName }} </div>
    <div class="finish-time">{{ finishTime }}</div>
    <el-row class="third-line">
      <el-col :span="8"> 考生姓名：{{ studentName }}</el-col>
      <el-col :span="8"> 考试用时：{{ useTime }} 分钟</el-col>
      <el-col :span="8">
        考试得分：<span style="color: #0a84ff; font-weight: bold">{{
          score
        }}</span>
        分
      </el-col>
    </el-row>

    <el-card v-for="(type, i) in questionList" v-show="type.length > 0" :key="i" class="myCard">
      <div slot="header">
        <span>{{ typeInfo[i].name }}（共{{ typeInfo[i].count }}题，共{{
          typeInfo[i].score
        }}分）</span>
      </div>
      <!-- 一道题 -->
      <div v-for="(question, j) in type" :key="question.id">
        <el-row>
          <el-col :span="18">
            <!-- 题目内容 -->
            <div>
              {{ j + 1 }}.<span
                class="question-content"
              >{{ question.content }} （本题 {{ question.score }} 分）
              </span>
            </div>
            <!-- 题目图片 -->
            <el-image
              v-if="question.image != null"
              fit="contain"
              :src="question.image"
              :preview-src-list="[question.image]"
              style="height: 100px; margin-top: 10px"
            />
            <!-- 单选多选选项 -->
            <div v-if="i == 0 || i == 1">
              <div
                v-for="(option, k) in question.options"
                :key="option.id"
                :class="optionClass(option)"
              >
                <div>
                  {{ String.fromCharCode(65 + k) }}. {{ option.content }}
                </div>
                <el-image
                  v-if="option.image != null"
                  fit="contain"
                  :src="option.image"
                  :preview-src-list="[option.image]"
                  style="height: 100px; margin-top: 10px"
                />
              </div>
            </div>
            <!-- 判断题选项 -->
            <div v-if="i == 2">
              <div
                :class="
                  question.answer == 'true' ? 'optionIsRight' : 'optionNormal'
                "
              >
                正确
              </div>
              <div
                :class="
                  question.answer == 'false' ? 'optionIsRight' : 'optionNormal'
                "
              >
                错误
              </div>
            </div>
            <!-- 填空简答答案 -->
            <div v-if="i == 3 || i == 4">
              <div class="optionIsRight">
                <div>题目答案：{{ question.answer }}</div>
                <el-image
                  v-if="question.answerImage != null"
                  fit="contain"
                  :src="question.answerImage"
                  :preview-src-list="[question.answerImage]"
                  style="height: 100px; margin-top: 10px"
                />
              </div>
            </div>
            <!-- 解析 -->
            <div class="grayback-box">
              <div>题目解析：{{ question.analysis }}</div>
              <el-image
                v-if="question.analysisImage != null"
                fit="contain"
                :src="question.analysisImage"
                :preview-src-list="[question.analysisImage]"
                style="height: 100px; margin-top: 10px"
              />
            </div>
          </el-col>
          <el-col :span="6">
            <div class="answer-box">
              <!-- 您的作答 -->
              <div :class="answerClass(answerList[i][j].isRight)">
                <span
                  v-if="answerList[i][j].yourAnswer != null"
                >您的作答：{{ answerList[i][j].yourAnswer }}</span>
                <span v-else>您没有作答！</span>
              </div>
              <!-- 您的得分 -->
              <div style="color: #0a84ff; margin-top: 10px">
                您的得分：{{ answerList[i][j].gotScore ? answerList[i][j].gotScore : 0 }}
              </div>
              <div v-if="myState === 1" style="margin-top: 20px">
                <el-button
                  :disabled="i !== 3 && i !== 4"
                  type="primary"
                  size="small"
                  @click="handlerAlterScore(i,j)"
                >修改得分</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider />
      </div>
    </el-card>
  </div>
</template>

<script>
import { alterScore, commitCheck } from '@/api/admin/record'
import { getDetail } from '@/api/student/exam'
export default {
  name: 'Detail',
  data() {
    return {
      myState: 0,
      studentExamId: null,
      examName: '第一次考试',
      finishTime: '2020-04-14 12:00:00',
      studentName: '张三',
      useTime: 60,
      score: 95,
      dialogVisible: false,
      newScore: 0,
      curStudentQuestionId: null,
      curI: null,
      curJ: null,
      typeInfo: [
        { name: '单选题', count: 0, score: 0 },
        { name: '多选题', count: 0, score: 0 },
        { name: '判断题', count: 0, score: 0 },
        { name: '填空题', count: 0, score: 0 },
        { name: '简答题', count: 0, score: 0 }
      ],
      questionList: [
        [
          {
            id: 196,
            paperId: 1,
            questionId: 1,
            score: 2,
            orderNum: 1,
            repoId: 1,
            chapterId: 49,
            type: '单选题',
            content: '中国最大的淡水湖是哪一个？',
            image: null,
            answer: '449',
            answerImage: null,
            analysis: '中国四大淡水湖分别是：鄱阳湖、洞庭湖、太湖和洪泽湖。',
            analysisImage: null,
            remark: null,
            options: [
              {
                id: 448,
                questionId: 1,
                content: '洞庭湖',
                image: null,
                isRight: 0
              },
              {
                id: 449,
                questionId: 1,
                content: '鄱阳湖',
                image: null,
                isRight: 1
              },
              {
                id: 450,
                questionId: 1,
                content: '太湖',
                image: null,
                isRight: 0
              },
              {
                id: 451,
                questionId: 1,
                content: '洪泽湖',
                image: null,
                isRight: 0
              }
            ]
          }
        ],
        [
          {
            id: 206,
            paperId: 1,
            questionId: 21,
            score: 2,
            orderNum: 1,
            repoId: 1,
            chapterId: 48,
            type: '多选题',
            content: '南北朝的南朝指的是（）。',
            image: null,
            answer: '542,544,545,546',
            answerImage: null,
            analysis: '南朝宋齐梁陈',
            analysisImage: null,
            remark: null,
            options: [
              {
                id: 542,
                questionId: 21,
                content: '宋',
                image: null,
                isRight: 1
              },
              {
                id: 543,
                questionId: 21,
                content: '魏',
                image: null,
                isRight: 0
              },
              {
                id: 544,
                questionId: 21,
                content: '齐',
                image: null,
                isRight: 1
              },
              {
                id: 545,
                questionId: 21,
                content: '陈',
                image: null,
                isRight: 1
              },
              {
                id: 546,
                questionId: 21,
                content: '梁',
                image: null,
                isRight: 1
              }
            ]
          }
        ],
        [],
        [],
        []
      ],
      answerList: [
        [
          {
            studentQuestionId: null,
            yourAnswer: null,
            isRight: 0,
            gotScore: 0
          }
        ],
        [],
        [],
        [],
        []
      ]
    }
  },
  created() {
    this.studentExamId = this.$route.params.studentExamId
    this.myState = this.$route.params.myState
    // 得到detail
    getDetail({ studentExamId: this.studentExamId }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        this.examName = data.examName
        this.finishTime = data.finishTime
        this.studentName = data.studentName
        this.useTime = data.useTime
        this.score = data.score
        this.questionList = data.questionList
        this.answerList = data.answerList
        // 处理type1
        for (let i = 0; i < this.questionList.length; i++) {
          const count = this.questionList[i].length
          this.typeInfo[i].count = count
          let theScore = 0
          for (let j = 0; j < count; j++) {
            theScore += this.questionList[i][j].score
          }
          this.typeInfo[i].score = theScore
        }
      }
    })
  },
  methods: {
    // option样式
    optionClass(option) {
      if (option.isRight === 1) {
        return 'optionIsRight'
      } else {
        return 'optionNormal'
      }
    },

    // answer样式
    answerClass(isRight) {
      if (isRight === 1) {
        return 'answer-rignt'
      } else {
        return 'answer-wrong'
      }
    },

    // 点击修改得分
    handlerAlterScore(i, j) {
      // 得到当前的学生问题id
      this.curStudentQuestionId = this.answerList[i][j].studentQuestionId
      // 得到当前i,j
      this.curI = i
      this.curJ = j
      // 显示弹出框
      this.dialogVisible = true
    },

    // 提交修改分数
    submitnewScore() {
      const newScore = this.newScore
      const studentQuestionId = this.curStudentQuestionId
      // 题目分值
      const questionScore = this.questionList[this.curI][this.curJ].score

      if (newScore < 0 || newScore > questionScore) {
        this.$message.error('得分必须大于等于0且小于该题的分值')
        return
      }

      alterScore({
        studentExamId: this.studentExamId,
        studentQuestionId: studentQuestionId,
        newScore: newScore
      }).then(res => {
        if (res.status === 200) {
          this.$message.success('修改成功')
          // 前端更新题目得分
          this.answerList[this.curI][this.curJ].gotScore = this.newScore
          // 前端更新题目正确性
          if (this.newScore > 0) {
            this.answerList[this.curI][this.curJ].isRight = 1
          }
          // 前端更新试卷得分
          this.score = res.data
          // 关闭弹出框
          this.dialogVisible = false
        } else {
          this.$message.error(res.message)
        }
      })
    },

    // 提交批改
    handlerCheck() {
      commitCheck({ studentExamId: this.studentExamId }).then(res => {
        if (res.status === 200) {
          this.$message.success('提交成功')
          this.$router.push({ name: 'ExamRecord' })
        }
      })
    }
  }
}
</script>

<style scope>
.myCard {
  margin: 20px;
}

.exam-name {
  text-align: center;
  margin-top: 30px;
  font-size: 30px;
  font-weight: bold;
}

.finish-time {
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
  font-style: italic;
}

.third-line {
  text-align: center;
  margin-top: 30px;
  font-size: 20px;
}

.question-content {
  line-height: 25px;
  margin-left: 10px;
}

.optionNormal {
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: #606266;
}

.optionIsRight {
  border-radius: 5px;
  border: 1px solid #67c23a;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: #67c23a;
}

.answer-box {
  text-align: center;
  margin: 20px;
}

.grayback-box {
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  font-size: 16px;
  line-height: 20px;
}

.answer-rignt {
  color: #67c23a;
  margin-top: 10px;
}

.answer-wrong {
  color: red;
  margin-top: 10px;
}
</style>
