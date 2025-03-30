import { defineNuxtPlugin } from "#app";
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
export default defineNuxtPlugin(nuxtApp => {
    VMdPreview.use(vuepressTheme, {})
    nuxtApp.vueApp.use(VMdPreview);
});