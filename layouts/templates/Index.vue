<template>
  <div class="index-template">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'IndexTemplate',
}
</script>

<style lang="scss">
.index-template {
  width: 100%;
  margin-top: 50px;

  &__message {
    margin-top: 100px;
    text-align: center;
    }
  
  @include mq() {
    margin-top: 80px;

    &__message {
      margin-top: 200px;
      &--representative {
        margin-top: 50px;
      }
    }
  }
}
</style>