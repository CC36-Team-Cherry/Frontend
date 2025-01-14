<template>

<div class="h-screen flex items-center justify-center">
  <looping-rhombuses-spinner
  :animation-duration="2500"
  :rhombus-size="22"
  color="#3ab2e1"
  />
</div>

</template>

<script>

import { LoopingRhombusesSpinner } from 'epic-spinners'

export default {
  components: {
    LoopingRhombusesSpinner,
  },
}

</script>