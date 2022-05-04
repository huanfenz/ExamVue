<template>
  <div>

    <div v-if="showState === 0">
      <div class="thank" style="margin-top: 100px">感谢您的作答</div>
      <div class="message" style="margin-top: 20px">试卷批阅结束后会公布详情!</div>
    </div>

    <div v-else-if="showState === 1">
      <div v-if="showState === 1" class="score" style="margin-top: 100px">
        {{ score }}<span style="font-size: 18px">分</span>
      </div>
      <div class="thank2" style="margin-top: 20px">感谢您的作答</div>
      <div class="message" style="margin-top: 20px">如果试卷有主观题，主观题分数将在阅卷后累计到总成绩，请知晓！</div>
    </div>

  </div>

</template>

<script>
import { getScore } from '@/api/student/exam'
export default {
  data() {
    return {
      // 展示状态
      showState: null,
      studentExamId: null,
      score: null
    }
  },
  created() {
    this.studentExamId = this.$route.params.studentExamId
    this.showState = this.$route.params.showState
    if (this.showState === 1) {
      getScore({ studentExamId: this.studentExamId }).then(res => {
        if (res.status === 200) {
          this.score = res.data
        }
      })
    }
  }
}
</script>

<style scope>

.thank{
  font-size: 32px;
  color: #0a84ff;
  text-align:center;
}

.thank2{
  font-size: 18px;
  color: black;
  text-align:center;
}

.score{
  font-size: 48px;
  color: #0a84ff;
  text-align:center;
}

.message{
  font-size: 18px;
  color: #ff8000;
  text-align:center;
}

</style>
