<template>
  <q-card data-cy="dark-card" :dark="isDark">
    {{ isDark ? 'Dark ' : 'Light' }} content
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);
</script>
