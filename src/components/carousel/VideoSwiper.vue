<template>
    <div class="swiper-video-container">
        <div class="swiper" ref="swiperContainer">
            <div class="swiper-wrapper">
                <div v-for="(videoData, index) in videos" :key="index" class="swiper-slide">
                    <!-- WebRTC pano -->
                    <webrtcStreamCard v-if="videoData.videoType === 'rtsp' && !/\.[^/]+$/.test(videoData.rtspUrl)"
                        :key="videoData.rtspUrl" :camera="{ id: 'rtsp-' + index, panorama: true }"
                        :url="videoData.rtspUrl + '/whep'" class="w-full h-full object-cover absolute inset-0" :pano="1"
                        :hotspots="videoData.hotSpots || []" @hotspotclicked="handleHotspotClick" />

                    <!-- Regular video -->
                    <video v-else :id="'swiperVideo' + index" class="video-player" controls autoplay
                        :src="videoData.videoUrl || videoData.rtspUrl" @error="handleVideoError">
                        Your browser does not support the video tag.
                    </video>

                    <!-- Video info overlay (optional) -->
                    <div v-if="showVideoInfo" class="swiper-video-info">
                        <span>{{ videoData.title || `Video ${index + 1}` }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Swiper navigation -->
        <div class="swiper-wrapper-btn">
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, defineOptions } from 'vue'
import webrtcStreamCard from '../stream/webrtcStreamCard.vue'

// Swiper imports
import { Swiper } from 'swiper'
import { Navigation, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

// Define component name
defineOptions({
    name: 'VideoSwiper'
})

// Props
const props = defineProps({
    videos: {
        type: Array,
        default: () => [],
        required: true
    },
    showVideoInfo: {
        type: Boolean,
        default: false
    },
    swiperOptions: {
        type: Object,
        default: () => ({
            effect: 'slide',
            speed: 600,
            loop: false,
            // Disable autoHeight to enforce fixed height
            autoHeight: false
        })
    }
})

// Emits
const emit = defineEmits(['hotspot-clicked', 'video-error', 'swiper-initialized'])

// Refs
const swiperContainer = ref(null)

// Swiper instance
let swiperInstance = null

// Methods
function handleHotspotClick(hotspot) {
    console.log('Hotspot clicked in VideoSwiper:', hotspot)
    emit('hotspot-clicked', hotspot)
}

function handleVideoError(event) {
    console.error('Video error in swiper:', event.target.error)
    emit('video-error', event)
}

function initSwiper() {
    nextTick(() => {
        if (swiperInstance) {
            swiperInstance.destroy()
        }

        const swiperEl = swiperContainer.value
        if (swiperEl && props.videos.length > 0) {
            const defaultOptions = {
                modules: [Navigation, Pagination, EffectFade],
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    type: 'bullets',
                    dynamicBullets: true,
                    dynamicMainBullets: 3,
                }
            }

            const options = { ...defaultOptions, ...props.swiperOptions }

            swiperInstance = new Swiper(swiperEl, options)

            console.log('VideoSwiper initialized with', props.videos.length, 'slides')
            emit('swiper-initialized', swiperInstance)
        }
    })
}

function destroySwiper() {
    if (swiperInstance) {
        swiperInstance.destroy()
        swiperInstance = null
    }
}

// Exposed methods
defineExpose({
    initSwiper,
    destroySwiper,
    getInstance: () => swiperInstance
})

// Lifecycle
onMounted(() => {
    if (props.videos.length > 0) {
        initSwiper()
    }
})

onUnmounted(() => {
    destroySwiper()
})

// Watch for videos changes
import { watch } from 'vue'
watch(() => props.videos, (newVideos) => {
    if (newVideos.length > 0) {
        setTimeout(initSwiper, 100)
    } else {
        destroySwiper()
    }
}, { deep: true })
</script>

<style scoped>
/* swiper ở đây */
.swiper-video-container {
    position: absolute;
    width: 75%;
    height: 100%;
}

.swiper {
    width: 100%;
    height: 100%;
    z-index: 21;
}

.swiper-slide {
    position: relative;
    height: 400px;
    /* Fixed height for all slides */
    width: 80%;
    margin: 0 auto;
    transform: translateY(11%);
}

:deep(.swiper-slide) {
    position: relative;
    width: 80%;
    margin: 0 auto;
    height: 44em !important;
    transform: translateY(7%);
}

.video-player {
    width: 100%;
    height: 100%;
    /* Fill the slide height */
    object-fit: fill;
    /* Maintain aspect ratio and cover the area */
}

.swiper-wrapper-btn {
    position: absolute;
    z-index: 20;
    width: 114%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: end;
    left: 50%;
    top: 44%;
    transform: translateY(-50%) translateX(-50%);
}

.swiper-button-next,
.swiper-button-prev {
    color: white !important;
    width: 50px !important;
    height: 50px !important;
    border-radius: 50%;
    margin-top: -15px !important;
}

/* Làm icon arrow nhỏ hơn */
.swiper-button-next:after,
.swiper-button-prev:after {
    font-size: 12px !important;
    font-weight: bold;
}

/* Pagination dots */
:deep(.swiper-pagination) {
    justify-content: space-between;
    display: flex;
    position: relative;
    left: 0 !important;
    transform: translateY(0px) !important;
    width: 5% !important;
}

:deep(.swiper-pagination-bullet) {
    background: rgba(255, 255, 255, 0.5) !important;
    width: 15px !important;
    height: 15px !important;
    border-radius: 50px;
    margin: 0 4px !important;
    opacity: 0.7;
    transition: all 0.3s ease;
    padding: 10px;
}

:deep(.swiper-pagination-bullet-active) {
    background: white !important;
    opacity: 1;
    transform: scale(1.2);
}

:deep(.swiper-pagination-bullets-dynamic) {
    overflow: visible;
}
</style>