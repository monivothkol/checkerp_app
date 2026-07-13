<template>
    <ion-footer :translucent="true" collapse="fade" class="footer_btn">
        <ion-toolbar>
            <div class="wrap_btn">
                <slot></slot>
            </div>
        </ion-toolbar>
    </ion-footer>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
    ion-footer {
        ion-toolbar { --background: #FFFFFF; padding: 0 !important; --border-width: 0 0 0 !important; --padding-start: 16px; --padding-end: 16px; --padding-top: 16px; --padding-bottom: calc(env(safe-area-inset-bottom) / 2 + 20px);
            .btn01 { flex: 1;}
        }
        &.footer_login {
            ion-toolbar { --background: #ECECEC; background: #ECECEC !important;
            }
        }
    }
</style>