<template>
    <div class="flex flex-col h-full bg-gradient-to-b from-green-300 to-blue-500 text-white gap-3">

      <!-- Switch language -->
      <div class="flex flex-col items-end">
        <label class="font-medium">{{ $t('settings.fields.languagePreference') }}</label>
        <div class="flex space-x-2 mt-2">
          <button @click="switchLanguage('en-US')"
            :class="locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
            class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200">
            {{ $t('language.en') }}
          </button>
          <button @click="switchLanguage('ja-JP')"
            :class="locale === 'ja-JP' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
            class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200">
            {{ $t('language.jp') }}
          </button>
        </div>
      </div>

        <!-- Header Section -->
        <div
            class="flex flex-col justify-center items-center py-8 px-4 bg-white text-gray-800 shadow-lg rounded-lg w-11/12 max-w-md mx-auto mt-5">
            <img src="/favicon.png" alt="Breeze Logo" class="h-20 mb-3">
            <h1 class="text-4xl font-extrabold text-blue-500">Breeze</h1>
            <p class="text-sm italic text-gray-500 mt-2 text-center">
                {{$t('landing.simpleApp')}}
            </p>
            <hr class="border-gray-300 w-full my-4">
            <p v-if="language==='en-US'" class="text-gray-700 text-center">
                Our app eliminates the administrative hassles for small companies and startups in Tokyo.
                With our intuitive and simple user interface, attendance logging and PTO requests simply becomes a 
                <span class="text-blue-500 font-bold">Breeze</span>.
            </p>
            <p v-if="language==='ja-JP'" class="text-gray-700 text-center">
              私たちのアプリは、東京の小規模企業やスタートアップにおける管理業務の手間を排除します。
              <br/>
              直感的でシンプルなユーザーインターフェースにより、出勤記録や有給休暇の申請が簡単に
              <span class="text-blue-500 font-bold">Breeze</span>になります。
            </p>
        </div>

        <!-- Content Section -->
        <div class="flex flex-col justify-start items-start p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold text-blue-500 mb-3">{{$t('landing.whyBreeze')}}</h2>
            <ul class="list-disc pl-5 space-y-2 text-gray-700">
              <div v-if="language==='en-US'" class="min-h-30">
                <li><span class="font-bold">Effortlessly</span> log and track attendance</li>
                <li><span class="font-bold">Quickly</span> and securely onboard new employees</li>
                <li><span class="font-bold">Intuitive</span> design for hassle-free management</li>
              </div>
              <div v-if="language==='ja-JP'" class="min-h-30">
                <li><span class="font-bold">簡単に</span> 出勤記録をログ・追跡</li>
                <li><span class="font-bold">迅速に</span> かつ安全に新しい従業員をオンボーディング</li>
                <li><span class="font-bold">直感的な</span> デザインで手間のかからない管理</li>
              </div>
            </ul>
        </div>

        <!-- Multi-Select Video -->
        <div class="flex flex-col justify-start items-start p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold text-blue-500 mb-3">{{ $t('landing.multiSelect') }}</h2>
            <video class="w-full rounded" src="/src/assets/multiselectvideo.mp4" autoplay loop muted
                playsinline></video>
        </div>

        <div class="flex flex-col justify-start items-start p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold text-blue-500 mb-3">{{ $t('landing.ptoReview') }}</h2>
            <video class="w-full rounded" src="/src/assets/ptoapprovalsvideo.mp4" autoplay loop muted
                playsinline></video>
        </div>

        <!-- Links Section -->
        <div
            class="flex flex-col justify-start items-center p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto text-center border-green-300 border-solid">
            <!-- Centered Heading -->
            <h2 class="text-2xl font-semibold text-blue-500 mb-6">{{ $t('landing.team') }}</h2>

            <!-- 2x2 Grid -->
            <div class="grid grid-cols-2 gap-4 w-full">
                <!-- First Person -->
                <div class="flex flex-col items-center justify-center">
                    <div class="flex flex-row items-center space-x-2 mt-2">
                        <img src="/src/assets/TeamBreeze_Preston.png" alt="Preston Headshot" class="w-14 rounded-xl">
                        <a href="https://github.com/prestonb91" class="w-10 h-10">
                            <img src="/src/assets/github_logo.png" alt="Logo 1" class="w-full h-full object-contain">
                        </a>
                        <a href="https://www.linkedin.com/in/preston-boardman-8210a671/" class="w-8 h-8">
                            <img src="/src/assets/LinkedIn_logo.png" alt="Logo 2" class="w-full h-full object-contain">
                        </a>
                    </div>
                    <p class="text-blue-500 font-bold">Preston Boardman</p>
                </div>

                <!-- Second Person -->
                <div class="flex flex-col items-center">
                    <div class="flex flex-row items-center space-x-2 mt-2">
                        <img src="/src/assets/TeamBreeze_Jackson.png" alt="Jackson Headshot" class="w-14 rounded-xl">
                        <a href="https://github.com/jacksontfm" class="w-8 h-8">
                            <img src="/src/assets/github_logo.png" alt="Logo 1" class="w-full h-full object-contain">
                        </a>
                        <a href="https://www.linkedin.com/in/jackson-merle-47ba7518a/" class="w-8 h-8">
                            <img src="/src/assets/LinkedIn_logo.png" alt="Logo 2" class="w-full h-full object-contain">
                        </a>
                    </div>
                    <p class="text-blue-500 font-bold">Jackson Merle</p>
                </div>

                <!-- Third Person -->
                <div class="flex flex-col items-center">
                    <div class="flex flex-row items-center space-x-2 mt-2">
                        <img src="/src/assets/TeamBreeze_Davide.png" alt="Davide Headshot" class="w-14 rounded-xl">
                        <a href="https://github.com/Ghezz9" class="w-8 h-8">
                            <img src="/src/assets/github_logo.png" alt="Logo 1" class="w-full h-full object-contain">
                        </a>
                        <a href="https://www.linkedin.com/in/davide-ghezzo-a91587206/?originalSubdomain=it" class="w-8 h-8">
                            <img src="/src/assets/LinkedIn_logo.png" alt="Logo 2" class="w-full h-full object-contain">
                        </a>
                    </div>
                    <p class="text-blue-500 font-bold">Davide Ghezzo</p>
                </div>

                <!-- Fourth Person -->
                <div class="flex flex-col items-center">
                    <div class="flex flex-row items-center space-x-2 mt-2">
                        <img src="/src/assets/TeamBreeze_Jason.png" alt="Jason Headshot" class="w-14 rounded-xl">
                        <a href="https://github.com/ConwayDecker" class="w-8 h-8">
                            <img src="/src/assets/github_logo.png" alt="Logo 1" class="w-full h-full object-contain">
                        </a>
                        <a href="https://www.linkedin.com/in/jason-sagalow-76047614b/"
                            class="w-8 h-8">
                            <img src="/src/assets/LinkedIn_logo.png" alt="Logo 2" class="w-full h-full object-contain">
                        </a>
                    </div>
                    <p class="text-blue-500 font-bold">Jason Sagalow</p>
                </div>
            </div>
        </div>

        <!-- Footer Section -->
        <div
        class="flex flex-col items-center p-6 bg-green-300 shadow-md rounded-lg w-full max-w-md mx-auto text-center sticky bottom-3">
        <p class="text-blue-500 font-bold text-lg">
                {{ $t('landing.sticky1') }} <br>
                {{ $t('landing.sticky2') }} <br>
                <a href="https://breezehr.netlify.app/login" class="w-10 h-10 underline text-violet-700">
                    {{ $t('landing.sticky3') }}
                </a>
            </p>
        </div>
    </div>
</template>

<script setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';


const { locale } = useI18n();
var language = ref('en-US');

const switchLanguage = (lang) => {
  locale.value = lang;
  language = lang;
};
</script>