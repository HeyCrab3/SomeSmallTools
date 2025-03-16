// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@element-plus/nuxt'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 7000
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    public: {
      openai_key: process.env.ALIYUN_APP_KEY
    }
  }
})