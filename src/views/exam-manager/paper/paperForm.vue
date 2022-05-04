<template>
  <div class="app-container">
    <!--弹出框-->
    <el-drawer
      title="添加题目"
      :visible.sync="drawerVisable"
      size="70%"
      :wrapper-closable="false"
      :destroy-on-close="true"
    >
      <QuestionList
        v-if="drawerVisable"
        :son="true"
        :type-id="curTypeId"
        :exclude-id-list="excludeIdList"
        @close-event="handlerAddResult"
      />
    </el-drawer>
    <!-- 随机抽题弹出框 -->
    <el-dialog title="随机抽题" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <!-- 选择题库 -->
        <el-form-item label="选择题库">
          <el-select v-model="form.repoId" placeholder="请选择题库" clearable @change="repoChange">
            <el-option
              v-for="item in repoData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 选择章节 -->
        <el-form-item label="选择章节">
          <el-select v-model="form.chapterId" placeholder="请选择章节" clearable>
            <el-option
              v-for="item in chapterData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 输入题目数量 -->
        <el-form-item label="题目数量">
          <el-input v-model="form.quantity" type="number" max="100" min="0" placeholder="请输入题目数量" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRandomForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-row :gutter="10">
      <el-col ref="leftObject" :span="5" :style="styleObj">
        <el-card>
          <p>试卷名称：<el-input v-model="paperData.name" style="width: 60%" /></p>
          <p>创建的人：{{ paperData.creatorName }}</p>
          <p>题目总数：<span class="number">{{ paperData.questionCount }}</span> 题</p>
          <p>题目总分：<span class="number">{{ paperData.totalScore }}</span> 分</p>
          <p>及格分数：<el-input v-model="paperData.qualifyScore" type="number" size="mini" style="width: 70px" /> 分</p>
          <el-button type="danger" size="mini" style="width: 47%" @click="$router.push({ name: 'Paper' })">返回</el-button>
          <el-button type="primary" size="mini" style="width: 47%" @click="handlerSave">保存</el-button>
          <div v-for="(item, i) in 5" :key="i">
            <el-divider><el-button type="text" @click="jumpTypeCard(i)">{{ typeInfo[i].name }}</el-button></el-divider>
            <div>
              共有 <span class="number">{{ typeInfo[i].count }}</span> 题，
              共有 <span class="number">{{ typeInfo[i].score }}</span> 分，
              设置每题<el-input v-model="typeInfo[i].eachScore" type="number" size="mini" style="width: 70px" @change="handlerEach(i)" />分
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18" :offset="6">
        <el-card v-for="(type, i) in questionList" ref="typeCard" :key="i" :style="i !== 0 ? 'margin-top: 20px' : null">
          <div slot="header">
            <span>{{ typeInfo[i].name }}</span>
            <el-button style="float: right; padding: 3px 0; margin-left: 10px" type="text" @click="handlerRandomQuestion(i)">随机抽题</el-button>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handlerAddQuestion(i)">添加题目</el-button>
          </div>
          <!-- 一道题 -->
          <div v-for="(question, j) in type" :key="question.id">
            <el-row>
              <el-col :span="20">
                <div>
                  <el-tag effect="dark" size="medium">{{ j + 1 }}</el-tag>
                  <span class="question-content">{{ question.content }}</span>
                </div>
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
                    :class="option.isRight == 1 ? 'optionIsRight' : 'optionNotRight'"
                  >
                    <div>{{ String.fromCharCode(65 + k) }}. {{ option.content }}</div>
                    <el-image
                      v-if="option.image != null"
                      fit="contain"
                      :src="option.image"
                      :preview-src-list="[option.image]"
                      style="height: 100px; margin-top: 10px"
                    />
                  </div>
                </div>
                <!-- 判断选项 -->
                <div v-if="i == 2">
                  <div :class="question.answer == 'true' ? 'optionIsRight' : 'optionNotRight'">
                    正确
                  </div>
                  <div :class="question.answer == 'false' ? 'optionIsRight' : 'optionNotRight'">
                    错误
                  </div>
                </div>
                <!-- 填空简答答案 -->
                <div v-if="i == 3 || i == 4">
                  <div class="grayback-box">
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
              <el-col :span="4" align="center">
                <div style="margin-top: 20px">
                  <el-button type="success" size="small" icon="el-icon-top" circle @click="handleUp(i, j)" />
                  <el-button type="primary" size="small" icon="el-icon-bottom" circle @click="handleDown(i, j)" />
                  <el-button type="danger" size="small" icon="el-icon-delete" circle @click="handleRemove(i, j)" />
                </div>
                <div style="margin-top: 20px">
                  本题 <el-input v-model="question.score" type="number" size="mini" style="width: 70px" /> 分
                </div>
              </el-col>
            </el-row>
            <el-divider />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'

import { queryRepos } from '@/api/admin/repo'
import { queryChapters } from '@/api/admin/chapter'
import QuestionList from '../question/list'
import {
  savePaper,
  getPaper
} from '@/api/admin/paper'

import {
  getRandomQuestion
} from '@/api/admin/question'

export default {
  name: 'PaperForm',
  components: { QuestionList },
  data() {
    return {
      styleObj: {
        position: 'fixed',
        top: '70px'
      },
      drawerVisable: false,
      dialogVisible: false,
      form: {
        repoId: null,
        chapterId: null,
        quantity: 0
      },
      repoData: [],
      chapterData: [],
      curTypeId: 1,
      excludeIdList: [],
      paperData: {
        id: null,
        name: '',
        creator: null,
        creatorName: null,
        questionCount: 0,
        totalScore: 0,
        qualifyScore: 0
      },
      typeInfo: [
        { name: '单选题', count: 0, score: 0, isEach: false, eachScore: null },
        { name: '多选题', count: 0, score: 0, isEach: false, eachScore: null },
        { name: '判断题', count: 0, score: 0, isEach: false, eachScore: null },
        { name: '填空题', count: 0, score: 0, isEach: false, eachScore: null },
        { name: '简答题', count: 0, score: 0, isEach: false, eachScore: null }
      ],
      questionList: [
        [], [], [], [], []
      ]
    }
  },
  computed: {
    ...mapGetters(['id', 'name', 'roles', 'avatar'])
  },
  watch: {
    questionList: {
      immediate: true,
      deep: true,
      handler() {
        let questionCount = 0
        let totalScore = 0
        for (let i = 0; i < this.questionList.length; i++) {
          let curTypeScore = 0
          for (let j = 0; j < this.questionList[i].length; j++) {
            curTypeScore += parseFloat(this.questionList[i][j].score)
          }
          this.typeInfo[i].count = this.questionList[i].length
          this.typeInfo[i].score = curTypeScore

          questionCount += parseFloat(this.typeInfo[i].count)
          totalScore += parseFloat(this.typeInfo[i].score)
        }
        this.paperData.questionCount = questionCount
        this.paperData.totalScore = totalScore
      }
    },
    id: {
      immediate: true,
      handler() {
        this.paperData.creator = this.id
      }
    },
    name: {
      immediate: true,
      handler() {
        this.paperData.creatorName = this.name
      }
    }
  },
  created() {
    // 获取repo
    // 查询所有题库
    queryRepos().then((res) => {
      this.repoData = res.data
    })

    this.paperData.id = this.$route.params.id
    if (this.paperData.id != null) {
      // 获取信息
      getPaper({ paperId: this.paperData.id }).then(res => {
        if (res.status === 200) {
          this.paperData = res.data.paper
          this.questionList = res.data.paperQuestionListList
        }
      })
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    // 每题几分
    for (let i = 0; i < 5; i++) {
      if (this.questionList[i] != null && this.questionList[i].size > 0) {
        this.typeInfo[i].eachScore = this.questionList[i][0].score
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    // 题库改变
    repoChange() {
      this.form.chapterId = null

      if (this.form.repoId == null || this.form.repoId === '') {
        this.chapterData = null
      } else {
        queryChapters({ repoId: this.form.repoId }).then((res) => {
          this.chapterData = res.data
        })
      }
    },

    handleScroll() {
      const top =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop
      if (this.styleObj.top === '70px' && top > 55) {
        this.styleObj.top = '20px'
      } else if (this.styleObj.top === '20px' && top < 55) {
        this.styleObj.top = '70px'
      }
    },

    // 跳到类型卡片
    jumpTypeCard(i) {
      window.scrollTo(0, this.$refs.typeCard[i].$el.offsetTop)
    },

    // 处理每题几分
    handlerEach(i) {
      for (let j = 0; j < this.questionList[i].length; j++) {
        this.questionList[i][j].score = this.typeInfo[i].eachScore
      }
    },

    // 点击移除
    handleRemove(i, j) {
      this.questionList[i].splice(j, 1)
    },

    // 上移记录
    handleUp(i, j) {
      // 上限处理
      if (j === 0) {
        this.$message.warning('已经是第一行了，不能上移')
        return
      }
      // 交换上一行和当前行
      const temp = this.questionList[i][j - 1]
      Vue.set(this.questionList[i], j - 1, this.questionList[i][j])
      Vue.set(this.questionList[i], j, temp)
      this.$message.success('上移成功')
    },

    // 下移记录
    handleDown(i, j) {
      // 下限处理
      if (j === (this.questionList[i].length - 1)) {
        this.$message.warning('已经是最后一行了，不能下移')
        return
      }
      // 交换下一行和当前行
      const temp = this.questionList[i][j + 1]
      Vue.set(this.questionList[i], j + 1, this.questionList[i][j])
      Vue.set(this.questionList[i], j, temp)
      this.$message.success('下移成功')
    },

    // 添加问题
    handlerAddQuestion(typeId) {
      // 放置类型
      this.curTypeId = typeId
      // 放置排除
      // 清空排除
      this.excludeIdList = []
      // 提取所有题目id
      for (let i = 0; i < this.questionList.length; i++) {
        for (let j = 0; j < this.questionList[i].length; j++) {
          this.excludeIdList.push(this.questionList[i][j].questionId)
        }
      }
      // 显示抽屉框
      this.drawerVisable = true
    },

    handlerRandomQuestion(typeId) {
      // 放置类型
      this.curTypeId = typeId
      // 放置排除
      // 清空排除
      this.excludeIdList = []
      // 提取所有题目id
      for (let i = 0; i < this.questionList.length; i++) {
        for (let j = 0; j < this.questionList[i].length; j++) {
          this.excludeIdList.push(this.questionList[i][j].questionId)
        }
      }
      // 显示抽屉框
      this.dialogVisible = true
    },

    // 处理添加结果
    handlerAddResult(items) {
      this.drawerVisable = false
      console.log(items)

      for (let i = 0; i < items.length; i++) {
        const cur = items[i]
        // 添加默认分值
        Vue.set(cur, 'score', 1)
        // 添加questionId
        Vue.set(cur, 'questionId', cur.id)
        // 自己id置空
        cur.id = null
        // 添加到数组中
        this.questionList[this.curTypeId].push(cur)
      }
    },

    // 保存结果
    handlerSave() {
      // 处理问题列表
      // 把paperData和questionList传过去
      savePaper({ paper: this.paperData, paperQuestionListList: this.questionList }).then(res => {
        if (res.status === 200) {
          this.$message.success('保存成功')
        } else {
          this.$message.error(res.message)
        }
      })
    },

    // 提交随机抽题表单
    submitRandomForm() {
      getRandomQuestion({
        repoId: this.form.repoId,
        chapterId: this.form.chapterId,
        quantity: this.form.quantity,
        typeId: this.curTypeId,
        excludeIdList: this.excludeIdList
      }).then(res => {
        if (res.status === 200) {
          this.$message.success('获取成功')
          this.handlerAddResult(res.data)
          this.dialogVisible = false
        } else {
          this.$message.error(res.message)
        }
      })
    }
  }
}
</script>

<style scoped>
.optionNotRight {
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

.optionIsRight {
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
  font-size: 14px;
  line-height: 25px;
}

.question-content {
  line-height: 25px;
  margin-left: 10px;
}

.number {
    color: #1890ff;
    font-style: italic;
}

/*1.显示滚动条：当内容超出容器的时候，可以拖动：*/
::v-deep .el-drawer__body {
   overflow: auto;
}

</style>
