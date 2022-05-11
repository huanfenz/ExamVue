<template>
  <div class="app-container">
    <!--普通表单-->
    <el-form
      ref="myForm"
      :model="form"
      :rules="rules"
      label-width="80px"
      :hide-required-asterisk="true"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属题库" prop="repoId">
            <el-select
              v-model="form.repoId"
              placeholder="请选择题库"
              style="width: 100%"
              @change="repoChange"
            >
              <el-option
                v-for="item in repoData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属章节" prop="chapterId">
            <el-select
              v-model="form.chapterId"
              placeholder="请选择章节"
              style="width: 100%"
            >
              <el-option
                v-for="item in chapterData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="题目类型" prop="type">
            <el-select
              v-model="form.type"
              :disabled="curQuestion !== null"
              placeholder="请选择题目类型"
              style="width: 100%"
              @change="changeType"
            >
              <el-option key="0" label="单选题" value="单选题" />
              <el-option key="1" label="多选题" value="多选题" />
              <el-option key="2" label="判断题" value="判断题" />
              <el-option key="3" label="填空题" value="填空题" />
              <el-option key="4" label="简答题" value="简答题" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="22">
          <el-form-item label="题目内容" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="4" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-upload
            class="upload-demo"
            action="http://localhost:8093/system/upload/uploadImage"
            multiple
            :limit="1"
            :file-list="imageList"
            list-type="picture"
            :on-success="handleImageSuccess"
            :before-remove="beforeImageRemove"
            :on-remove="handleImageRemove"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="22">
          <el-form-item label="题目分析" prop="analysis">
            <el-input v-model="form.analysis" type="textarea" :rows="4" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-upload
            class="upload-demo"
            action="http://localhost:8093/system/upload/uploadImage"
            multiple
            :limit="1"
            :file-list="analysisImageList"
            list-type="picture"
            :on-success="handleAnalysisImageSuccess"
            :before-remove="beforeImageRemove"
            :on-remove="handleAnalysisImageRemove"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </el-col>
      </el-row>

      <el-row v-if="form.type == '填空题' || form.type == '简答题'">
        <el-col :span="22">
          <el-form-item label="题目答案" prop="answer">
            <el-input v-model="form.answer" type="textarea" :rows="4" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-upload
            class="upload-demo"
            action="http://localhost:8093/system/upload/uploadImage"
            multiple
            :limit="1"
            :file-list="answerImageList"
            list-type="picture"
            :on-success="handleAnswerImageSuccess"
            :before-remove="beforeImageRemove"
            :on-remove="handleAnswerImageRemove"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </el-col>
      </el-row>

      <el-form-item v-if="form.type == '判断题'" label="题目答案" prop="answer">
        <el-radio v-model="form.answer" label="true">正确</el-radio>
        <el-radio v-model="form.answer" label="false">错误</el-radio>
      </el-form-item>
    </el-form>
    <!-- 添加选项 -->
    <div
      v-if="form.type == '单选题' || form.type == '多选题'"
      ref="myTable"
      style="margin-bottom: 10px"
    >
      <!-- 一些按钮 -->
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        size="small"
        @click="handleAdd"
      >
        添加选项
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      v-if="form.type == '单选题' || form.type == '多选题'"
      ref="myTable"
      :data="form.options"
      border
    >
      <el-table-column
        prop="isRight"
        label="是否答案"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-checkbox
            v-model="form.options[scope.$index].isRight"
            :true-label="1"
            :false-label="0"
          >答案</el-checkbox>
        </template>
      </el-table-column>

      <el-table-column prop="abc" label="编号" width="55" align="center" />

      <el-table-column prop="content" label="选项内容" align="center">
        <template slot-scope="scope">
          <el-input v-model="form.options[scope.$index].content" />
        </template>
      </el-table-column>

      <el-table-column
        prop="content"
        label="选项图片"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-upload
            class="upload-demo"
            action="http://localhost:8093/system/upload/uploadImage"
            multiple
            :limit="1"
            :file-list="optionImageList[scope.$index]"
            list-type="picture"
            :on-success="(res) => handleOptionImageSuccess(res, scope.$index)"
            :before-remove="beforeImageRemove"
            :on-remove="(file) => handleOptionImageRemove(file, scope.$index)"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            circle
            @click="handleRemove(scope.$index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer" style="margin-top: 15px">
      <el-button
        icon="el-icon-back"
        @click="$emit('close-event')"
      >返 回</el-button>
      <el-button
        type="success"
        icon="el-icon-check"
        @click="handleSave"
      >确 定</el-button>
    </div>
  </div>
</template>

<script>
import { queryRepos } from '@/api/admin/repo'
import { queryChapters } from '@/api/admin/chapter'
import {
  saveQuestion
} from '@/api/admin/question'
export default {
  name: 'QuestionForm',
  props: {
    curQuestion: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      // 题库数据
      repoData: [],
      // 章节数据
      chapterData: [],
      // 表单数据
      form: {
        id: null,
        repoId: null,
        repoName: null,
        chapterId: null,
        chapterName: null,
        type: null,
        remark: null,
        content: null,
        image: null,
        analysis: null,
        analysisImage: null,
        answer: null,
        answerImage: null,
        options: [
          {
            id: null,
            content: null,
            image: null,
            isRight: 0,
            orderNum: 1,
            abc: 'A'
          },
          {
            id: null,
            content: null,
            image: null,
            isRight: 0,
            orderNum: 2,
            abc: 'B'
          },
          {
            id: null,
            content: null,
            image: null,
            isRight: 0,
            orderNum: 3,
            abc: 'C'
          },
          {
            id: null,
            content: null,
            image: null,
            isRight: 0,
            orderNum: 4,
            abc: 'D'
          }
        ]
      },
      imageList: [],
      answerImageList: [],
      analysisImageList: [],
      optionImageList: [],
      rules: {
        repoId: [{ required: true, message: '请选择题库', trigger: 'blur' }],
        type: [{ required: true, message: '请选择题目类型', trigger: 'blur' }]
      }
    }
  },
  computed: {},
  // 创建后
  created() {
    // 查询所有题库
    queryRepos().then((res) => {
      this.repoData = res.data
    })

    if (this.curQuestion != null) {
      // 放置问题（深拷贝）
      this.form = JSON.parse(JSON.stringify(this.curQuestion))
      // 显示题目图片
      if (this.form.image != null) {
        this.imageList.push({
          url: this.form.image
        })
      }
      // 显示分析图片
      if (this.form.analysisImage != null) {
        this.analysisImageList.push({
          url: this.form.analysisImage
        })
      }
      // 显示答案图片
      if (this.form.answerImage != null) {
        this.answerImageList.push({
          url: this.form.answerImage
        })
      }

      // 处理选项
      const options = this.form.options
      // 遍历选项
      for (let i = 0; i < options.length; i++) {
        // 添加abc
        // Vue.set(options[i], 'abc', String.fromCharCode(65 + i))
        // 放optionImage
        if (options[i].image == null) {
          this.optionImageList.push([])
        } else {
          this.optionImageList.push([{
            url: options[i].image
          }])
        }
      }

      // 查询所有章节
      queryChapters({ repoId: this.form.repoId }).then((res) => {
        this.chapterData = res.data
      })
    }
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

    changeType() {
      if (this.form.type === '判断题') {
        this.form.answer = 'true'
      } else if (this.form.answer === 'true' || this.form.answer === 'false') {
        this.form.answer = null
      }
    },

    // 点击添加
    handleAdd() {
      const row = {
        isRight: 0,
        orderNum: this.form.options.length + 1,
        abc: String.fromCharCode(65 + this.form.options.length),
        conent: null,
        image: null
      }
      this.form.options.push(row)
    },

    // 点击移除
    handleRemove(index) {
      this.form.options.splice(index, 1)
      // 重新加载编号
      for (let i = 0; i < this.form.options.length; i++) {
        this.form.options[i].orderNum = i + 1
        this.form.options[i].abc = String.fromCharCode(65 + i)
      }
    },

    // 移除之前
    beforeImageRemove(file) {
      if (!file || file.status !== 'success') return false

      return this.$confirm('确定要删除该图片吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    },

    // 处理图片移除
    handleImageRemove(file) {
      if (file && file.status === 'success') {
        this.form.image = null
      }
    },

    // 处理分析图片移除
    handleAnalysisImageRemove(file) {
      if (file && file.status === 'success') {
        this.form.analysisImage = null
      }
    },

    // 处理答案图片移除
    handleAnswerImageRemove(file) {
      if (file && file.status === 'success') {
        this.form.answerImage = null
      }
    },

    // 处理选项图片移除
    handleOptionImageRemove(file, index) {
      if (file && file.status === 'success') {
        this.form.options[index].image = null
      }
    },

    // 上传图片成功
    handleImageSuccess(res) {
      if (res.status === 200) {
        this.$message.success(res.message)
        this.form.image = res.data
      } else {
        this.$message.error(res.message)
      }
    },

    // 上传分析图片成功
    handleAnalysisImageSuccess(res) {
      if (res.status === 200) {
        this.$message.success(res.message)
        this.form.analysisImage = res.data
      } else {
        this.$message.error(res.message)
      }
    },

    // 上传答案图片成功
    handleAnswerImageSuccess(res) {
      if (res.status === 200) {
        this.$message.success(res.message)
        this.form.answerImage = res.data
      } else {
        this.$message.error(res.message)
      }
    },

    // 上传选项图片成功
    handleOptionImageSuccess(res, index) {
      if (res.status === 200) {
        this.$message.success(res.message)
        this.form.options[index].image = res.data
      } else {
        this.$message.error(res.message)
      }
    },

    // 处理保存
    handleSave() {
      // 先系统校验
      this.$refs.myForm.validate((valid) => {
        if (!valid) {
          this.$message.error('不允许提交，请检查必填项')
          return false
        } else {
          // 题目内容和图片至少有一个
          if (this.form.content === null && this.form.image === null) {
            this.$message.error('请输入题目内容或上传题目图片')
            return false
          }
          if (this.form.type === '单选题' || this.form.type === '多选题') {
            // 计算勾选的数量
            let count = 0
            for (let i = 0; i < this.form.options.length; i++) {
              if (this.form.options[i].isRight === 1) count++
            }
            if (this.form.type === '单选题') {
              // 单选题：保证只有一个答案
              // 遍历optionData，计算isRight的个数
              if (count !== 1) {
                this.$message.error('确保单选题有且仅有一个答案')
                return false
              }
            } else {
              // 多选题：保证答案数量>=2
              if (count < 2) {
                this.$message.error('确保多选题的答案数量不少于2个')
                return false
              }
            }
          } else {
            // 题目答案和图片至少有一个
            if (this.form.answer === null && this.form.answerImage === null) {
              this.$message.error('请输入题目答案或上传答案图片')
              return false
            }
          }
          // 将表单和选项数据一起上传
          saveQuestion({ question: this.form, option: this.form.options }).then((res) => {
            if (res.status === 200) {
              this.$message.success('保存成功')
              this.$emit('close-event')
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
/* element-ui el-upload框去除‘按 delete 键可删除’提示 */
.el-upload-list__item.is-success.focusing .el-icon-close-tip {
display: none !important;
}

</style>
